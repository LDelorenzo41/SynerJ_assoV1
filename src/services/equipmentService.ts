// src/services/equipmentService.ts

import { supabase } from '../lib/supabase';
import type {
  EquipmentItem,
  ReservationRequest,
  EquipmentReservation,
  CreateEquipmentItemForm,
  CreateReservationRequestForm,
  ApproveReservationForm,
} from '../types/equipment';

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

    // Ajouter les items demandés
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
        // Aucun club trouvé, retourner une liste vide
        return [];
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateReservationRequestStatus(
    requestId: string,
    status: 'approved' | 'rejected',
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

  // ============ RÉSERVATIONS APPROUVÉES (Calendrier officiel) ============

  static async approveReservationRequest(
    requestId: string,
    approvedBy: string,
    approvalData: ApproveReservationForm
  ): Promise<EquipmentReservation> {
    // 1. Récupérer les détails de la demande
    const { data: request, error: requestError } = await supabase
      .from('reservation_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError) throw requestError;

    // 2. Créer la réservation officielle
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

    // 3. Ajouter les items approuvés
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

    // 4. Marquer la demande comme approuvée
    await this.updateReservationRequestStatus(requestId, 'approved');

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
      // D'abord récupérer les IDs des clubs de cette association
      const { data: clubIds, error: clubsError } = await supabase
        .from('clubs')
        .select('id')
        .eq('association_id', associationId);

      if (clubsError) throw clubsError;

      const clubIdList = clubIds?.map(club => club.id) || [];
      if (clubIdList.length > 0) {
        query = query.in('club_id', clubIdList);
      } else {
        // Aucun club trouvé, retourner une liste vide
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

  // ============ VÉRIFICATION DE DISPONIBILITÉ ============

  static async checkEquipmentAvailability(
    equipmentItemId: string,
    startDate: Date,
    endDate: Date,
    quantityRequested: number,
    excludeReservationId?: string
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc('check_equipment_availability', {
      p_equipment_item_id: equipmentItemId,
      p_start_date: startDate.toISOString(),
      p_end_date: endDate.toISOString(),
      p_quantity_requested: quantityRequested,
      p_exclude_reservation_id: excludeReservationId || null,
    });

    if (error) throw error;
    return data as boolean;
  }

  static async getEquipmentAvailabilityForPeriod(
    associationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{
    equipment_item: EquipmentItem;
    available_quantity: number;
    conflicting_reservations: EquipmentReservation[];
  }>> {
    // Récupérer tout le matériel
    const equipment = await this.getEquipmentItems(associationId);
    
    // D'abord récupérer les IDs des clubs de cette association
    const { data: clubIds, error: clubsError } = await supabase
      .from('clubs')
      .select('id')
      .eq('association_id', associationId);

    if (clubsError) throw clubsError;

    const clubIdList = clubIds?.map(club => club.id) || [];
    
    if (clubIdList.length === 0) {
      // Aucun club trouvé, tous les items sont disponibles
      return equipment.map(item => ({
        equipment_item: item,
        available_quantity: item.quantity,
        conflicting_reservations: [],
      }));
    }
    
    // Récupérer les réservations qui chevauchent
    const { data: reservations, error } = await supabase
      .from('equipment_reservations')
      .select(`
        *,
        reservation_items(
          *,
          equipment_item:equipment_items(*)
        )
      `)
      .in('club_id', clubIdList)
      .lt('start_date', endDate.toISOString())
      .gt('end_date', startDate.toISOString());

    if (error) throw error;

    // Calculer la disponibilité pour chaque item
    return equipment.map(item => {
      const conflictingReservations = reservations?.filter(res =>
        res.reservation_items?.some((ri: any) => ri.equipment_item_id === item.id)
      ) || [];

      const reservedQuantity = conflictingReservations.reduce((total, res) => {
        const reservedItem = res.reservation_items?.find((ri: any) => ri.equipment_item_id === item.id);
        return total + (reservedItem?.quantity_reserved || 0);
      }, 0);

      return {
        equipment_item: item,
        available_quantity: Math.max(0, item.quantity - reservedQuantity),
        conflicting_reservations: conflictingReservations,
      };
    });
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
    const [
      equipment,
      requests,
      reservations
    ] = await Promise.all([
      this.getEquipmentItems(associationId),
      this.getReservationRequests({ associationId, status: 'pending' }),
      this.getEquipmentReservations(associationId)
    ]);

    const now = new Date();
    const upcomingReservations = reservations.filter(res => 
      new Date(res.start_date) > now
    );

    return {
      total_items: equipment.length,
      total_quantity: equipment.reduce((sum, item) => sum + item.quantity, 0),
      items_by_status: equipment.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      items_by_category: equipment.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      pending_requests: requests.length,
      upcoming_reservations: upcomingReservations.length,
    };
  }
}