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
import { NotificationService } from './notificationService';

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

// ============================================
// NOUVELLES INTERFACES POUR STATS AVANCÉES
// ============================================
interface MonthlyRequestData {
  month: string;
  year: number;
  total_requests: number;
  approved: number;
  rejected: number;
}

interface EquipmentStatData {
  equipment_id: string;
  equipment_name: string;
  category: string;
  times_requested: number;
  times_reserved: number;
  utilization_rate: number;
}

interface ClubActivityData {
  club_id: string;
  club_name: string;
  total_requests: number;
  approved_requests: number;
  rejected_requests: number;
  approval_rate: number;
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

    // ============================================
    // BLOC DE NOTIFICATION AJOUTÉ ICI
    // ============================================
    // NOUVEAU : Notifier le Super Admin de la nouvelle demande de matériel
    try {
      console.log('=== DÉBUT NOTIFICATION DEMANDE MATÉRIEL ===');
      
      // Récupérer les informations du club et de l'association
      const { data: clubInfo, error: clubError } = await supabase
        .from('clubs')
        .select('name, association_id')
        .eq('id', clubId)
        .single();

      if (!clubError && clubInfo) {
        // Récupérer le Super Admin de l'association
        const { data: superAdmin, error: superAdminError } = await supabase
          .from('profiles')
          .select('id')
          .eq('association_id', clubInfo.association_id)
          .eq('role', 'Super Admin')
          .single();

        if (!superAdminError && superAdmin) {
          // Récupérer les informations de l'utilisateur qui fait la demande
          const { data: requesterInfo, error: requesterError } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', requestedBy)
            .single();

          const requesterName = requesterInfo 
            ? `${requesterInfo.first_name} ${requesterInfo.last_name}`
            : 'Utilisateur inconnu';

          // Envoyer la notification
          await NotificationService.notifyMaterialRequest(
            superAdmin.id,
            requestData.id,
            clubInfo.name,
            requesterName,
            request.event_name
          );
          
          console.log(`✅ Notification envoyée au Super Admin pour la demande de matériel`);
        } else {
          console.warn('⚠️ Aucun Super Admin trouvé pour l\'association:', clubInfo.association_id);
        }
      }
    } catch (notificationError) {
      console.error('Erreur lors de l\'envoi de la notification:', notificationError);
      // Ne pas faire échouer la demande si la notification échoue
    }

    console.log('=== FIN NOTIFICATION DEMANDE MATÉRIEL ===');

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

  // ============================================
  // MÉTHODE getAdvancedStats ENTIÈREMENT CORRIGÉE
  // ============================================
  static async getAdvancedStats(associationId: string): Promise<{
    basic: {
      total_items: number;
      total_quantity: number;
      items_by_status: Record<string, number>;
      items_by_category: Record<string, number>;
      pending_requests: number;
      upcoming_reservations: number;
    };
    clubs: {
      most_active: ClubActivityData[];
      least_active: ClubActivityData[];
    };
    equipment: {
      most_popular: EquipmentStatData[];
      least_used: Array<{
        equipment_id: string;
        equipment_name: string;
        category: string;
        times_requested: number;
        last_used: string | null;
      }>;
    };
    trends: {
      monthly_requests: MonthlyRequestData[];
      average_reservation_duration: number;
      peak_months: string[];
    };
    performance: {
      overall_approval_rate: number;
      average_response_time_hours: number;
      busiest_equipment_categories: Record<string, number>;
    };
  }> {
    try {
      // 1. Stats de base (réutilisation de la méthode existante)
      const basicStats = await this.getEquipmentStats(associationId);
  
      // 2. Récupérer les IDs des clubs de l'association
      const { data: clubIds } = await supabase
        .from('clubs')
        .select('id, name')
        .eq('association_id', associationId);
  
      const clubIdList = clubIds?.map(club => club.id) || [];
      
      if (clubIdList.length === 0) {
        return {
          basic: basicStats,
          clubs: { most_active: [], least_active: [] },
          equipment: { most_popular: [], least_used: [] },
          trends: { monthly_requests: [], average_reservation_duration: 0, peak_months: [] },
          performance: { overall_approval_rate: 0, average_response_time_hours: 0, busiest_equipment_categories: {} }
        };
      }
  
      // 3. Stats des clubs les plus actifs
      const { data: clubStats } = await supabase
        .from('reservation_requests')
        .select(`
          club_id,
          status,
          created_at,
          updated_at,
          club:clubs(name)
        `)
        .in('club_id', clubIdList);
  
      // Analyse des clubs
      const clubActivity: ClubActivityData[] = clubIds?.map(club => {
        const clubRequests = clubStats?.filter(req => req.club_id === club.id) || [];
        const approved = clubRequests.filter(req => req.status === 'approved' || req.status === 'partially_approved').length;
        const rejected = clubRequests.filter(req => req.status === 'rejected').length;
        const total = clubRequests.length;
  
        return {
          club_id: club.id,
          club_name: club.name,
          total_requests: total,
          approved_requests: approved,
          rejected_requests: rejected,
          approval_rate: total > 0 ? Math.round((approved / total) * 100) : 0
        };
      }) || [];
  
      const mostActive = clubActivity
        .sort((a, b) => b.total_requests - a.total_requests)
        .slice(0, 10);
  
      const leastActive = clubActivity
        .filter(club => club.total_requests > 0)
        .sort((a, b) => a.total_requests - b.total_requests)
        .slice(0, 5);
  
      // 4. Stats des équipements les plus populaires
      const { data: equipmentUsage } = await supabase
        .from('request_items')
        .select(`
          equipment_item_id,
          quantity_requested,
          reservation_request:reservation_requests!inner(status, created_at),
          equipment_item:equipment_items!inner(name, category)
        `)
        .in('reservation_request.club_id', clubIdList);

      const equipmentStats: Record<string, {
        equipment_id: string;
        equipment_name: string;
        category: string;
        times_requested: number;
        times_reserved: number;
        total_quantity_requested: number;
      }> = {};
  
      equipmentUsage?.forEach((item: any) => {
        const equipId = item.equipment_item_id;
        if (!equipmentStats[equipId]) {
          equipmentStats[equipId] = {
            equipment_id: equipId,
            equipment_name: item.equipment_item.name,
            category: item.equipment_item.category,
            times_requested: 0,
            times_reserved: 0,
            total_quantity_requested: 0
          };
        }
        
        equipmentStats[equipId].times_requested++;
        equipmentStats[equipId].total_quantity_requested += item.quantity_requested;
        
        if (item.reservation_request.status === 'approved' || item.reservation_request.status === 'partially_approved') {
          equipmentStats[equipId].times_reserved++;
        }
      });
      // AJOUTEZ LE NOUVEAU BLOC ICI (après la ligne 778)
      // Récupérer et traiter les réservations approuvées (vos 8 réservations)
      const { data: reservationItems } = await supabase
        .from('reservation_items')
        .select(`
          equipment_item_id,
          quantity_reserved,
          equipment_reservation:equipment_reservations!inner(created_at),
          equipment_item:equipment_items!inner(name, category)
        ` )
        .in('equipment_reservation.club_id', clubIdList);

      reservationItems?.forEach((item: any) => {
        const equipId = item.equipment_item_id;
        if (!equipmentStats[equipId]) {
          equipmentStats[equipId] = {
            equipment_id: equipId,
            equipment_name: item.equipment_item.name,
            category: item.equipment_item.category,
            times_requested: 0,
            times_reserved: 0,
            total_quantity_requested: 0
      };
    }
    
    // Compter comme demandé ET réservé
    equipmentStats[equipId].times_requested++;
    equipmentStats[equipId].times_reserved++;
    equipmentStats[equipId].total_quantity_requested += item.quantity_reserved;
  });
      const mostPopular: EquipmentStatData[] = Object.values(equipmentStats)
        .map((item) => ({
          ...item,
          utilization_rate: item.times_requested > 0 ? Math.round((item.times_reserved / item.times_requested) * 100) : 0
        }))
        .sort((a, b) => b.times_requested - a.times_requested)
        .slice(0, 10);
  
      // 5. Équipements les moins utilisés
      const { data: allEquipment } = await supabase
        .from('equipment_items')
        .select('id, name, category')
        .eq('association_id', associationId);
  
      const leastUsed = allEquipment
        ?.filter(equip => !equipmentStats[equip.id])
        .map(equip => ({
          equipment_id: equip.id,
          equipment_name: equip.name,
          category: equip.category,
          times_requested: 0,
          last_used: null
        }))
        .slice(0, 10) || [];
  
      // 6. Tendances mensuelles
      const monthlyData: Record<string, MonthlyRequestData> = {};
      
      clubStats?.forEach(request => {
        const date = new Date(request.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: date.toLocaleString('fr-FR', { month: 'long' }),
            year: date.getFullYear(),
            total_requests: 0,
            approved: 0,
            rejected: 0
          };
        }
        
        monthlyData[monthKey].total_requests++;
        if (request.status === 'approved' || request.status === 'partially_approved') {
          monthlyData[monthKey].approved++;
        } else if (request.status === 'rejected') {
          monthlyData[monthKey].rejected++;
        }
      });
  
      const monthlyRequests = Object.values(monthlyData)
        .sort((a, b) => `${b.year}-${b.month}`.localeCompare(`${a.year}-${a.month}`))
        .slice(0, 12);
  
      // 7. Durée moyenne des réservations
      const { data: reservationDurations } = await supabase
        .from('equipment_reservations')
        .select('start_date, end_date')
        .in('club_id', clubIdList);
  
      const avgDuration = (reservationDurations && reservationDurations.length > 0) 
        ? reservationDurations.reduce((sum, res) => {
            const start = new Date(res.start_date);
            const end = new Date(res.end_date);
            const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            return sum + durationHours;
          }, 0) / reservationDurations.length 
        : 0;
  
      // 8. Stats de performance
      const totalRequests = clubStats?.length || 0;
      const totalApproved = clubStats?.filter(req => req.status === 'approved' || req.status === 'partially_approved').length || 0;
      const overallApprovalRate = totalRequests > 0 ? Math.round((totalApproved / totalRequests) * 100) : 0;
  
      // Temps de réponse moyen
      const responseTimesMs = clubStats
        ?.filter(req => req.updated_at && req.status !== 'pending')
        .map(req => new Date(req.updated_at).getTime() - new Date(req.created_at).getTime()) || [];
      
      const avgResponseTimeHours = responseTimesMs.length > 0
        ? responseTimesMs.reduce((sum, time) => sum + time, 0) / responseTimesMs.length / (1000 * 60 * 60)
        : 0;
  
      // Catégories les plus demandées
      const categoryStats: Record<string, number> = {};
      mostPopular.forEach(item => {
        const category = item.category;
        categoryStats[category] = (categoryStats[category] || 0) + item.times_requested;
      });
  
      return {
        basic: basicStats,
        clubs: {
          most_active: mostActive,
          least_active: leastActive
        },
        equipment: {
          most_popular: mostPopular,
          least_used: leastUsed
        },
        trends: {
          monthly_requests: monthlyRequests,
          average_reservation_duration: Math.round(avgDuration),
          peak_months: Object.entries(monthlyData)
            .sort(([,a], [,b]) => (b as any).total_requests - (a as any).total_requests)
            .slice(0, 3)
            .map(([month]) => month)
        },
        performance: {
          overall_approval_rate: overallApprovalRate,
          average_response_time_hours: Math.round(avgResponseTimeHours * 10) / 10,
          busiest_equipment_categories: categoryStats
        }
      };
    } catch (error: unknown) {
      console.error('Erreur lors du calcul des statistiques avancées:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Impossible de récupérer les statistiques avancées: ${errorMessage}`);
    }
  }

  // ============ EXPORT DES STATISTIQUES ============

  static async exportStatsToCSV(associationId: string): Promise<{
    filename: string;
    data: string;
    summary: {
      total_records: number;
      export_date: string;
      period_covered: string;
    };
  }> {
    try {
      const stats = await this.getAdvancedStats(associationId);
      const exportDate = new Date().toISOString().split('T')[0];
      
      // Créer le CSV avec plusieurs sections
      let csvContent = '';
      
      // En-tête général
      csvContent += `"Export des statistiques matériel"\n`;
      csvContent += `"Date d'export","${new Date().toLocaleDateString('fr-FR')}"\n`;
      csvContent += `"Association ID","${associationId}"\n\n`;
      
      // Section 1: Clubs les plus actifs
      csvContent += `"CLUBS LES PLUS ACTIFS"\n`;
      csvContent += `"Nom du club","Total demandes","Demandes approuvées","Demandes rejetées","Taux d'approbation (%)"\n`;
      stats.clubs.most_active.forEach(club => {
        csvContent += `"${club.club_name}","${club.total_requests}","${club.approved_requests}","${club.rejected_requests}","${club.approval_rate}"\n`;
      });
      csvContent += '\n';
      
      // Section 2: Équipements les plus populaires
      csvContent += `"ÉQUIPEMENTS LES PLUS POPULAIRES"\n`;
      csvContent += `"Nom de l'équipement","Catégorie","Fois demandé","Fois réservé","Taux d'utilisation (%)"\n`;
      stats.equipment.most_popular.forEach(equip => {
        csvContent += `"${equip.equipment_name}","${equip.category}","${equip.times_requested}","${equip.times_reserved}","${equip.utilization_rate}"\n`;
      });
      csvContent += '\n';
      
      // Section 3: Tendances mensuelles
      csvContent += `"TENDANCES MENSUELLES"\n`;
      csvContent += `"Mois","Année","Total demandes","Approuvées","Rejetées"\n`;
      stats.trends.monthly_requests.forEach(month => {
        csvContent += `"${month.month}","${month.year}","${month.total_requests}","${month.approved}","${month.rejected}"\n`;
      });
      csvContent += '\n';
      
      // Section 4: Statistiques générales
      csvContent += `"STATISTIQUES GÉNÉRALES"\n`;
      csvContent += `"Métrique","Valeur"\n`;
      csvContent += `"Total équipements","${stats.basic.total_items}"\n`;
      csvContent += `"Quantité totale","${stats.basic.total_quantity}"\n`;
      csvContent += `"Demandes en attente","${stats.basic.pending_requests}"\n`;
      csvContent += `"Réservations à venir","${stats.basic.upcoming_reservations}"\n`;
      csvContent += `"Taux d'approbation global","${stats.performance.overall_approval_rate}%"\n`;
      csvContent += `"Temps de réponse moyen (h)","${stats.performance.average_response_time_hours}"\n`;
      csvContent += `"Durée moyenne de réservation (h)","${stats.trends.average_reservation_duration}"\n`;
      
      const filename = `statistiques_materiel_${associationId}_${exportDate}.csv`;
      
      return {
        filename,
        data: csvContent,
        summary: {
          total_records: stats.clubs.most_active.length + stats.equipment.most_popular.length + stats.trends.monthly_requests.length,
          export_date: exportDate,
          period_covered: 'Toute la période'
        }
      };
    } catch (error: unknown) {
      console.error('Erreur lors de l\'export CSV:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Impossible d'exporter les statistiques: ${errorMessage}`);
    }
  }

  // ============ REMISE À ZÉRO AVEC ARCHIVE ============

  static async resetAllRequests(associationId: string, options: {
    createArchive: boolean;
    confirmationCode: string;
    adminUserId: string;
  }): Promise<{
    success: boolean;
    archived_requests: number;
    deleted_requests: number;
    archived_reservations: number;
    deleted_reservations: number;
    archive_filename?: string;
    reset_date: string;
  }> {
    try {
      // Vérification du code de confirmation
      const expectedCode = `RESET-${associationId.slice(-6).toUpperCase()}`;
      if (options.confirmationCode !== expectedCode) {
        throw new Error(`Code de confirmation incorrect. Le code attendu est: ${expectedCode}`);
      }

      // Récupérer les IDs des clubs de l'association
      const { data: clubIds } = await supabase
        .from('clubs')
        .select('id')
        .eq('association_id', associationId);

      const clubIdList = clubIds?.map(club => club.id) || [];
      
      if (clubIdList.length === 0) {
        return {
          success: true,
          archived_requests: 0,
          deleted_requests: 0,
          archived_reservations: 0,
          deleted_reservations: 0,
          reset_date: new Date().toISOString()
        };
      }

      let archiveFilename: string | undefined;
      let archivedRequests = 0;
      let archivedReservations = 0;

      // 1. Créer une archive si demandé
      if (options.createArchive) {
        const resetDate = new Date().toISOString().split('T')[0];
        
        // Récupérer toutes les demandes à archiver
        const { data: requestsToArchive } = await supabase
          .from('reservation_requests')
          .select(`
            *,
            club:clubs(name),
            requester:profiles(first_name, last_name),
            request_items(
              *,
              equipment_item:equipment_items(name, category)
            )
          `)
          .in('club_id', clubIdList);

        // Récupérer toutes les réservations à archiver
        const { data: reservationsToArchive } = await supabase
          .from('equipment_reservations')
          .select(`
            *,
            club:clubs(name),
            approver:profiles(first_name, last_name),
            reservation_items(
              *,
              equipment_item:equipment_items(name, category)
            )
          `)
          .in('club_id', clubIdList);

        // Créer le fichier d'archive JSON
        const archiveData = {
          export_info: {
            association_id: associationId,
            reset_date: new Date().toISOString(),
            reset_by: options.adminUserId,
            total_requests: requestsToArchive?.length || 0,
            total_reservations: reservationsToArchive?.length || 0
          },
          reservation_requests: requestsToArchive || [],
          equipment_reservations: reservationsToArchive || []
        };

        archiveFilename = `archive_materiel_${associationId}_${resetDate}.json`;
        archivedRequests = requestsToArchive?.length || 0;
        archivedReservations = reservationsToArchive?.length || 0;

        // Dans un vrai système, on sauvegarderait ce fichier dans un stockage persistant
        console.log('Archive créée:', archiveFilename);
        console.log('Données archivées:', JSON.stringify(archiveData, null, 2));
      }

      // 2. Supprimer toutes les demandes et réservations
      
      // Supprimer les items de réservation d'abord (contraintes de clés étrangères)
      await supabase
        .from('reservation_items')
        .delete()
        .in('reservation_id', 
          (await supabase
            .from('equipment_reservations')
            .select('id')
            .in('club_id', clubIdList)
          ).data?.map(r => r.id) || []
        );

      // Supprimer les réservations
      const { data: deletedReservations } = await supabase
        .from('equipment_reservations')
        .delete()
        .in('club_id', clubIdList)
        .select('id');

      // Supprimer les items de demande
      await supabase
        .from('request_items')
        .delete()
        .in('reservation_request_id', 
          (await supabase
            .from('reservation_requests')
            .select('id')
            .in('club_id', clubIdList)
          ).data?.map(r => r.id) || []
        );

      // Supprimer les demandes
      const { data: deletedRequests } = await supabase
        .from('reservation_requests')
        .delete()
        .in('club_id', clubIdList)
        .select('id');

      // 3. Logger l'opération de reset
      await supabase
        .from('admin_logs')
        .insert([{
          admin_id: options.adminUserId,
          action: 'RESET_ALL_EQUIPMENT_REQUESTS',
          details: {
            association_id: associationId,
            deleted_requests: deletedRequests?.length || 0,
            deleted_reservations: deletedReservations?.length || 0,
            archive_created: options.createArchive,
            archive_filename: archiveFilename
          }
        }]);

      return {
        success: true,
        archived_requests: archivedRequests,
        deleted_requests: deletedRequests?.length || 0,
        archived_reservations: archivedReservations,
        deleted_reservations: deletedReservations?.length || 0,
        archive_filename: archiveFilename,
        reset_date: new Date().toISOString()
      };

    } catch (error: unknown) {
      console.error('Erreur lors de la remise à zéro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Impossible de réinitialiser les demandes: ${errorMessage}`);
    }
  }

  // ============ UTILITAIRE POUR GÉNÉRER LE CODE DE CONFIRMATION ============

  static generateResetConfirmationCode(associationId: string): string {
    return `RESET-${associationId.slice(-6).toUpperCase()}`;
  }
}