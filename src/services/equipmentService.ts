// src/services/equipmentService.ts - Version corrigée

import { supabase } from '../lib/supabase';
import type {
  EquipmentItem,
  ReservationRequest,
  EquipmentReservation,
  CreateEquipmentItemForm,
  CreateReservationRequestForm,
  ApproveReservationForm,
} from '../types/equipment';

// Types pour les nouvelles fonctionnalités
export interface EquipmentAvailabilityResult {
  available: boolean;
  available_quantity: number;
  total_quantity: number;
  reserved_quantity: number;
  conflicting_reservations: Array<{
    reservation_id: string;
    club_name: string;
    event_name: string;
    start_date: string;
    end_date: string;
    quantity_reserved: number;
    overlap_start: string;
    overlap_end: string;
  }>;
  equipment_status?: string;
  reason?: string;
}

export interface RequestAvailabilityResult {
  item_id: string;
  equipment_item_id: string;
  equipment_name: string;
  equipment_category: string;
  equipment_status: string;
  requested_quantity: number;
  available_quantity: number;
  total_quantity: number;
  reserved_quantity: number;
  is_available: boolean;
  conflicts: any[];
}

export class EquipmentService {
  // ============ GESTION DU MATÉRIEL (Super Admin) ============
  
  static async getEquipmentItems(associationId: string): Promise<EquipmentItem[]> {
    const { data, error } = await supabase
      .from('equipment_items')
      .select('*')
      .eq('association_id', associationId)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async createEquipmentItem(
    associationId: string,
    item: CreateEquipmentItemForm
  ): Promise<EquipmentItem> {
    const { data, error } = await supabase
      .from('equipment_items')
      .insert([{ ...item, association_id: associationId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateEquipmentItem(
    itemId: string,
    updates: Partial<EquipmentItem>
  ): Promise<EquipmentItem> {
    const { data, error } = await supabase
      .from('equipment_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteEquipmentItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('equipment_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  }

  // ============ DEMANDES DE RÉSERVATION ============

  static async createReservationRequest(
    clubId: string,
    requestedBy: string,
    request: CreateReservationRequestForm
  ): Promise<ReservationRequest> {
    // 1. Vérifier la disponibilité AVANT de créer la demande
    const availabilityCheck = await this.checkRequestAvailability(
      request.items,
      request.start_date,
      request.end_date
    );

    const unavailableItems = availabilityCheck.filter(item => !item.is_available);
    
    if (unavailableItems.length > 0) {
      const itemNames = unavailableItems.map(item => `${item.equipment_name} (${item.requested_quantity} demandés, ${item.available_quantity} disponibles)`);
      throw new Error(`Les équipements suivants ne sont pas disponibles sur cette période :\n${itemNames.join('\n')}`);
    }

    // 2. Créer la demande si tout est disponible
    const { data: requestData, error: requestError } = await supabase
      .from('reservation_requests')
      .insert([{
        club_id: clubId,
        requested_by: requestedBy,
        event_name: request.event_name,
        start_date: request.start_date.toISOString(),
        end_date: request.end_date.toISOString(),
        notes: request.notes || null,
      }])
      .select()
      .single();

    if (requestError) throw requestError;

    // 3. Ajouter les items demandés
    if (request.items.length > 0) {
      const { error: itemsError } = await supabase
        .from('request_items')
        .insert(
          request.items.map(item => ({
            reservation_request_id: requestData.id,
            equipment_item_id: item.equipment_item_id,
            quantity_requested: item.quantity_requested,
          }))
        );

      if (itemsError) throw itemsError;
    }

    return requestData;
  }

  static async getReservationRequests(
    filters: {
      clubId?: string;
      associationId?: string;
      status?: string;
    } = {}
  ): Promise<ReservationRequest[]> {
    let query = supabase
      .from('reservation_requests')
      .select(`
        *,
        club:clubs(id, name),
        requester:profiles(id, first_name, last_name),
        request_items(
          *,
          equipment_item:equipment_items(*)
        )
      `);

    if (filters.clubId) {
      query = query.eq('club_id', filters.clubId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.associationId) {
      // D'abord récupérer les IDs des clubs de cette association
      const { data: clubIds, error: clubsError } = await supabase
        .from('clubs')
        .select('id')
        .eq('association_id', filters.associationId);

      if (clubsError) throw clubsError;

      const clubIdList = clubIds?.map(club => club.id) || [];
      if (clubIdList.length > 0) {
        query = query.in('club_id', clubIdList);
      } else {
        return [];
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateReservationRequestStatus(
    requestId: string,
    status: 'approved' | 'rejected' | 'partially_approved',
    adminNotes?: string,
    rejectedReason?: string
  ): Promise<ReservationRequest> {
    const { data, error } = await supabase
      .from('reservation_requests')
      .update({
        status,
        admin_notes: adminNotes || null,
        rejected_reason: rejectedReason || null,
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ============ NOUVELLES FONCTIONS DE VÉRIFICATION ============

  static async checkEquipmentAvailability(
    equipmentItemId: string,
    startDate: Date,
    endDate: Date,
    quantityRequested: number,
    excludeReservationId?: string
  ): Promise<EquipmentAvailabilityResult> {
    const { data, error } = await supabase.rpc('check_equipment_availability', {
      p_equipment_item_id: equipmentItemId,
      p_start_date: startDate.toISOString(),
      p_end_date: endDate.toISOString(),
      p_quantity_requested: quantityRequested,
      p_exclude_reservation_id: excludeReservationId || null,
    });

    if (error) throw error;

    // La fonction retourne un array avec un seul élément
    return data[0] as EquipmentAvailabilityResult;
  }

  static async checkRequestAvailability(
    items: Array<{ equipment_item_id: string; quantity_requested: number }>,
    startDate: Date,
    endDate: Date
  ): Promise<RequestAvailabilityResult[]> {
    // Créer une demande temporaire pour la vérification
    const results: RequestAvailabilityResult[] = [];

    for (const item of items) {
      try {
        const availability = await this.checkEquipmentAvailability(
          item.equipment_item_id,
          startDate,
          endDate,
          item.quantity_requested
        );

        // Récupérer les infos de l'équipement
        const { data: equipment, error: equipError } = await supabase
          .from('equipment_items')
          .select('name, category, status')
          .eq('id', item.equipment_item_id)
          .single();

        if (equipError) throw equipError;

        results.push({
          item_id: item.equipment_item_id,
          equipment_item_id: item.equipment_item_id,
          equipment_name: equipment.name,
          equipment_category: equipment.category,
          equipment_status: equipment.status,
          requested_quantity: item.quantity_requested,
          available_quantity: availability.available_quantity,
          total_quantity: availability.total_quantity,
          reserved_quantity: availability.reserved_quantity,
          is_available: availability.available,
          conflicts: availability.conflicting_reservations,
        });
      } catch (err) {
        console.error(`Erreur lors de la vérification de l'item ${item.equipment_item_id}:`, err);
        results.push({
          item_id: item.equipment_item_id,
          equipment_item_id: item.equipment_item_id,
          equipment_name: 'Équipement inconnu',
          equipment_category: 'Inconnu',
          equipment_status: 'unknown',
          requested_quantity: item.quantity_requested,
          available_quantity: 0,
          total_quantity: 0,
          reserved_quantity: 0,
          is_available: false,
          conflicts: [],
        });
      }
    }

    return results;
  }

  static async getEquipmentAvailabilityForPeriod(
    associationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{
    equipment_id: string;
    equipment_name: string;
    category: string;
    equipment_status: string;
    total_quantity: number;
    available_quantity: number;
    reserved_quantity: number;
    conflicting_reservations: any[];
  }>> {
    const { data, error } = await supabase.rpc('get_equipment_availability_for_period', {
      p_association_id: associationId,
      p_start_date: startDate.toISOString(),
      p_end_date: endDate.toISOString(),
    });

    if (error) throw error;
    return data || [];
  }

  // ============ RÉSERVATIONS APPROUVÉES (Calendrier officiel) ============

  static async approveReservationRequest(
    requestId: string,
    approvedBy: string,
    approvalData: ApproveReservationForm
  ): Promise<EquipmentReservation> {
    // 1. Vérifier la disponibilité avant approbation
    const availabilityCheck = await this.checkRequestAvailability(
      approvalData.items.map(item => ({
        equipment_item_id: item.equipment_item_id,
        quantity_requested: item.quantity_reserved,
      })),
      approvalData.start_date || new Date(),
      approvalData.end_date || new Date()
    );

    const unavailableItems = availabilityCheck.filter(item => !item.is_available);
    
    if (unavailableItems.length > 0) {
      const itemNames = unavailableItems.map(item => 
        `${item.equipment_name} (${item.requested_quantity} demandés, ${item.available_quantity} disponibles)`
      );
      throw new Error(`Impossible d'approuver : équipements non disponibles :\n${itemNames.join('\n')}`);
    }

    // 2. Récupérer les détails de la demande
    const { data: request, error: requestError } = await supabase
      .from('reservation_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError) throw requestError;

    // 3. Créer la réservation officielle
    const { data: reservation, error: reservationError } = await supabase
      .from('equipment_reservations')
      .insert([{
        club_id: request.club_id,
        event_name: approvalData.event_name || request.event_name,
        start_date: (approvalData.start_date || new Date(request.start_date)).toISOString(),
        end_date: (approvalData.end_date || new Date(request.end_date)).toISOString(),
        approved_by: approvedBy,
        notes: approvalData.notes || null,
      }])
      .select()
      .single();

    if (reservationError) throw reservationError;

    // 4. Ajouter les items approuvés
    if (approvalData.items.length > 0) {
      const { error: itemsError } = await supabase
        .from('reservation_items')
        .insert(
          approvalData.items.map(item => ({
            reservation_id: reservation.id,
            equipment_item_id: item.equipment_item_id,
            quantity_reserved: item.quantity_reserved,
          }))
        );

      if (itemsError) throw itemsError;
    }

    // 5. Déterminer le statut de la demande
    const { data: originalItems } = await supabase
      .from('request_items')
      .select('*')
      .eq('reservation_request_id', requestId);

    const totalOriginalItems = originalItems?.length || 0;
    const totalApprovedItems = approvalData.items.length;
    
    const newStatus = totalApprovedItems === totalOriginalItems ? 'approved' : 'partially_approved';

    // 6. Marquer la demande avec le bon statut
    await this.updateReservationRequestStatus(requestId, newStatus);

    return reservation;
  }

  static async getEquipmentReservations(
    associationId?: string,
    clubId?: string
  ): Promise<EquipmentReservation[]> {
    let query = supabase
      .from('equipment_reservations')
      .select(`
        *,
        club:clubs(id, name),
        approver:profiles(id, first_name, last_name),
        reservation_items(
          *,
          equipment_item:equipment_items(*)
        )
      `);

    if (clubId) {
      query = query.eq('club_id', clubId);
    } else if (associationId) {
      const { data: clubIds, error: clubsError } = await supabase
        .from('clubs')
        .select('id')
        .eq('association_id', associationId);

      if (clubsError) throw clubsError;

      const clubIdList = clubIds?.map(club => club.id) || [];
      if (clubIdList.length > 0) {
        query = query.in('club_id', clubIdList);
      } else {
        return [];
      }
    }

    const { data, error } = await query.order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async deleteEquipmentReservation(reservationId: string): Promise<void> {
    const { error } = await supabase
      .from('equipment_reservations')
      .delete()
      .eq('id', reservationId);

    if (error) throw error;
  }

  // ============ STATISTIQUES ============

  static async getEquipmentStats(associationId: string): Promise<{
    total_items: number;
    total_quantity: number;
    items_by_status: Record<string, number>;
    items_by_category: Record<string, number>;
    pending_requests: number;
    upcoming_reservations: number;
  }> {
    try {
      // Récupérer les statistiques de base du matériel - DIRECTEMENT depuis la base
      const { data: items, error: itemsError } = await supabase
        .from('equipment_items')
        .select('status, category, quantity')
        .eq('association_id', associationId);

      if (itemsError) throw itemsError;

      // Récupérer les demandes en attente - DIRECTEMENT depuis la base
      const { data: clubIds } = await supabase
        .from('clubs')
        .select('id')
        .eq('association_id', associationId);

      const clubIdList = clubIds?.map(club => club.id) || [];

      let pendingRequests = 0;
      let upcomingReservations = 0;

      if (clubIdList.length > 0) {
        // Compter les demandes en attente
        const { data: requests, error: requestsError } = await supabase
          .from('reservation_requests')
          .select('id')
          .in('club_id', clubIdList)
          .eq('status', 'pending');

        if (requestsError) throw requestsError;

        // Compter les réservations à venir
        const { data: reservations, error: reservationsError } = await supabase
          .from('equipment_reservations')
          .select('id')
          .in('club_id', clubIdList)
          .gte('start_date', new Date().toISOString());

        if (reservationsError) throw reservationsError;

        pendingRequests = requests?.length || 0;
        upcomingReservations = reservations?.length || 0;
      }

      // Calculer les statistiques
      const stats = {
        total_items: items?.length || 0,
        total_quantity: items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0,
        items_by_status: {} as Record<string, number>,
        items_by_category: {} as Record<string, number>,
        pending_requests: pendingRequests,
        upcoming_reservations: upcomingReservations,
      };

      // Grouper par statut
      items?.forEach(item => {
        const status = item.status || 'unknown';
        stats.items_by_status[status] = (stats.items_by_status[status] || 0) + 1;
      });

      // Grouper par catégorie
      items?.forEach(item => {
        const category = item.category || 'Autre';
        stats.items_by_category[category] = (stats.items_by_category[category] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return {
        total_items: 0,
        total_quantity: 0,
        items_by_status: {} as Record<string, number>,
        items_by_category: {} as Record<string, number>,
        pending_requests: 0,
        upcoming_reservations: 0,
      };
    }
  }
}