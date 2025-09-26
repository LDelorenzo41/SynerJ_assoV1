// src/hooks/useEquipment.ts - Version mise à jour

import { useState, useEffect } from 'react';
import { EquipmentService } from '../services/equipmentService';
import type {
  EquipmentItem,
  ReservationRequest,
  EquipmentReservation,
  CreateEquipmentItemForm,
  CreateReservationRequestForm,
  ApproveReservationForm,
  EquipmentAvailabilityCheck,
  RequestItemAvailability,
  PeriodAvailability,
} from '../types/equipment';
import { NotificationService } from '../services/notificationService';
import { supabase } from '../lib/supabase';

// ============ HOOK POUR LA GESTION DU MATÉRIEL ============

export function useEquipmentItems(associationId: string | null | undefined) {
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    if (!associationId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await EquipmentService.getEquipmentItems(associationId);
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [associationId]);

  const createItem = async (item: CreateEquipmentItemForm) => {
    if (!associationId) throw new Error('Association ID required');
    
    try {
      const newItem = await EquipmentService.createEquipmentItem(associationId, item);
      setItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateItem = async (itemId: string, updates: Partial<EquipmentItem>) => {
    try {
      const updatedItem = await EquipmentService.updateEquipmentItem(itemId, updates);
      setItems(prev => prev.map(item => item.id === itemId ? updatedItem : item));
      return updatedItem;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      await EquipmentService.deleteEquipmentItem(itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const refreshItems = () => fetchItems();

  return {
    items,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    refreshItems,
  };
}

// ============ HOOK POUR LES DEMANDES DE RÉSERVATION ============

export function useReservationRequests(filters: {
  clubId?: string;
  associationId?: string;
  status?: string;
} = {}) {
  const [requests, setRequests] = useState<ReservationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await EquipmentService.getReservationRequests(filters);
      setRequests(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filters.clubId, filters.associationId, filters.status]);

  const createRequest = async (
    clubId: string,
    requestedBy: string,
    request: CreateReservationRequestForm
  ) => {
    try {
      const newRequest = await EquipmentService.createReservationRequest(
        clubId,
        requestedBy,
        request
      );
      await fetchRequests(); // Refresh to get the complete data with relations
      return newRequest;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateRequestStatus = async (
    requestId: string,
    status: 'approved' | 'rejected' | 'partially_approved',
    adminNotes?: string,
    rejectedReason?: string
  ) => {
    console.log('🔧 updateRequestStatus appelé avec:', { requestId, status, adminNotes, rejectedReason });
    try {
      // 1. Récupérer les informations de la demande AVANT mise à jour
      const { data: requestInfo, error: requestInfoError } = await supabase
        .from('reservation_requests')
        .select(`
          *,
          club:clubs(id, name, association_id),
          requester:profiles(id, first_name, last_name)
        `)
        .eq('id', requestId)
        .single();

      if (requestInfoError) throw requestInfoError;

      // 2. Mettre à jour le statut
      const updatedRequest = await EquipmentService.updateReservationRequestStatus(
        requestId,
        status,
        adminNotes,
        rejectedReason
      );
      
      // 3. Mettre à jour l'état local
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, ...updatedRequest } : req
      ));

      // 4. NOUVEAU : Envoyer la notification au Club Admin
      try {
        console.log('=== DÉBUT NOTIFICATION RÉPONSE MATÉRIEL ===');
        
        if (requestInfo?.club?.association_id) {
          // Récupérer le Club Admin du club concerné
          const { data: clubAdmin, error: clubAdminError } = await supabase
            .from('profiles')
            .select('id')
            .eq('club_id', requestInfo.club.id)
            .eq('role', 'Club Admin')
            .single();

          if (!clubAdminError && clubAdmin) {
            // Envoyer la notification
            await NotificationService.notifyMaterialResponse(
              clubAdmin.id,
              requestId,
              status,
              requestInfo.event_name,
              adminNotes
            );
            
            console.log(`✅ Notification envoyée au Club Admin pour la réponse de matériel (${status})`);
          } else {
            console.warn('⚠️ Aucun Club Admin trouvé pour le club:', requestInfo.club.id);
          }
        }
      } catch (notificationError) {
        console.error('Erreur lors de l\'envoi de la notification:', notificationError);
        // Ne pas faire échouer la mise à jour si la notification échoue
      }

      console.log('=== FIN NOTIFICATION RÉPONSE MATÉRIEL ===');
      
      return updatedRequest;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const approveRequest = async (
    requestId: string,
    approvedBy: string,
    approvalData: ApproveReservationForm
  ) => {
    console.log('🔧 approveRequest appelé avec:', { requestId, approvedBy, approvalData });
    
    try {
      // 1. Récupérer les informations de la demande AVANT approbation
      const { data: requestInfo, error: requestInfoError } = await supabase
        .from('reservation_requests')
        .select(`
          *,
          club:clubs(id, name, association_id),
          requester:profiles(id, first_name, last_name)
        `)
        .eq('id', requestId)
        .single();

      console.log('🔧 Informations de la demande récupérées:', requestInfo);

      if (requestInfoError) throw requestInfoError;

      // 2. Approuver la demande
      const reservation = await EquipmentService.approveReservationRequest(
        requestId,
        approvedBy,
        approvalData
      );
      
      console.log('🔧 Demande approuvée avec succès');

      // 3. Rafraîchir les données
      await fetchRequests();

      // 4. NOUVEAU : Envoyer la notification au Club Admin
      try {
        console.log('=== DÉBUT NOTIFICATION RÉPONSE MATÉRIEL (APPROVE) ===');
        
        if (requestInfo?.club?.association_id) {
          // Récupérer le Club Admin du club concerné
          const { data: clubAdmin, error: clubAdminError } = await supabase
            .from('profiles')
            .select('id')
            .eq('club_id', requestInfo.club.id)
            .eq('role', 'Club Admin')
            .single();

          console.log('🔧 Club Admin trouvé:', clubAdmin);

          if (!clubAdminError && clubAdmin) {
            // Déterminer le statut
            const { data: originalItems } = await supabase
              .from('request_items')
              .select('*')
              .eq('reservation_request_id', requestId);

            const totalOriginalItems = originalItems?.length || 0;
            const totalApprovedItems = approvalData.items.length;
            
            const status = totalApprovedItems === totalOriginalItems ? 'approved' : 'partially_approved';

            // Envoyer la notification
            await NotificationService.notifyMaterialResponse(
              clubAdmin.id,
              requestId,
              status,
              requestInfo.event_name,
              approvalData.notes
            );
            
            console.log(`✅ Notification envoyée au Club Admin pour l'approbation (${status})`);
          } else {
            console.warn('⚠️ Aucun Club Admin trouvé pour le club:', requestInfo.club.id);
          }
        }
      } catch (notificationError) {
        console.error('Erreur lors de l\'envoi de la notification:', notificationError);
      }

      console.log('=== FIN NOTIFICATION RÉPONSE MATÉRIEL (APPROVE) ===');
      
      return reservation;
    } catch (err: any) {
      console.error('🔧 Erreur dans approveRequest:', err);
      setError(err.message);
      throw err;
    }
  };

  const refreshRequests = () => fetchRequests();

  return {
    requests,
    loading,
    error,
    createRequest,
    updateRequestStatus,
    approveRequest,
    refreshRequests,
  };
}

// ============ HOOK POUR LES RÉSERVATIONS APPROUVÉES ============

export function useEquipmentReservations(
  associationId?: string,
  clubId?: string
) {
  const [reservations, setReservations] = useState<EquipmentReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await EquipmentService.getEquipmentReservations(
        associationId,
        clubId
      );
      setReservations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [associationId, clubId]);

  const deleteReservation = async (reservationId: string) => {
    try {
      await EquipmentService.deleteEquipmentReservation(reservationId);
      setReservations(prev => prev.filter(res => res.id !== reservationId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const refreshReservations = () => fetchReservations();

  return {
    reservations,
    loading,
    error,
    deleteReservation,
    refreshReservations,
  };
}

// ============ HOOK POUR LA VÉRIFICATION DE DISPONIBILITÉ ============

export function useEquipmentAvailability() {
  const [loading, setLoading] = useState(false);

  const checkAvailability = async (
    equipmentItemId: string,
    startDate: Date,
    endDate: Date,
    quantityRequested: number,
    excludeReservationId?: string
  ): Promise<EquipmentAvailabilityCheck> => {
    try {
      setLoading(true);
      return await EquipmentService.checkEquipmentAvailability(
        equipmentItemId,
        startDate,
        endDate,
        quantityRequested,
        excludeReservationId
      );
    } finally {
      setLoading(false);
    }
  };

  const checkRequestAvailability = async (
    items: Array<{ equipment_item_id: string; quantity_requested: number }>,
    startDate: Date,
    endDate: Date
  ): Promise<RequestItemAvailability[]> => {
    try {
      setLoading(true);
      return await EquipmentService.checkRequestAvailability(items, startDate, endDate);
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityForPeriod = async (
    associationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PeriodAvailability[]> => {
    try {
      setLoading(true);
      return await EquipmentService.getEquipmentAvailabilityForPeriod(
        associationId,
        startDate,
        endDate
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    checkAvailability,
    checkRequestAvailability,
    getAvailabilityForPeriod,
  };
}

// ============ HOOK POUR LES STATISTIQUES ============

export function useEquipmentStats(associationId: string | null | undefined) {
  const [stats, setStats] = useState<{
    total_items: number;
    total_quantity: number;
    items_by_status: Record<string, number>;
    items_by_category: Record<string, number>;
    pending_requests: number;
    upcoming_reservations: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!associationId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await EquipmentService.getEquipmentStats(associationId);
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [associationId]);

  const refreshStats = () => fetchStats();

  return { stats, loading, error, refreshStats };
}

// ============ HOOK COMPOSITE POUR LES PAGES ============

export function useEquipmentManagement(associationId: string | null | undefined) {
  const equipmentItems = useEquipmentItems(associationId);
  const reservationRequests = useReservationRequests({ associationId: associationId || undefined });
  const equipmentReservations = useEquipmentReservations(associationId || undefined);
  const equipmentStats = useEquipmentStats(associationId);
  const availability = useEquipmentAvailability();

  const refresh = () => {
    equipmentItems.refreshItems();
    reservationRequests.refreshRequests();
    equipmentReservations.refreshReservations();
    equipmentStats.refreshStats();
  };

  return {
    // Items
    items: equipmentItems.items,
    createItem: equipmentItems.createItem,
    updateItem: equipmentItems.updateItem,
    deleteItem: equipmentItems.deleteItem,
    refreshItems: equipmentItems.refreshItems,

    // Requests
    requests: reservationRequests.requests,
    createRequest: reservationRequests.createRequest,
    updateRequestStatus: reservationRequests.updateRequestStatus,
    approveRequest: reservationRequests.approveRequest,
    refreshRequests: reservationRequests.refreshRequests,

    // Reservations
    reservations: equipmentReservations.reservations,
    deleteReservation: equipmentReservations.deleteReservation,
    refreshReservations: equipmentReservations.refreshReservations,

    // Stats
    stats: equipmentStats.stats,

    // Availability
    checkAvailability: availability.checkAvailability,
    checkRequestAvailability: availability.checkRequestAvailability,
    getAvailabilityForPeriod: availability.getAvailabilityForPeriod,

    // Global
    refresh,
    isLoading: equipmentItems.loading || reservationRequests.loading || equipmentReservations.loading,
    error: equipmentItems.error || reservationRequests.error || equipmentReservations.error,
  };
}

// ============ HOOK SPÉCIALISÉ POUR LES CLUBS ============

export function useClubEquipmentManagement(clubId: string, associationId: string) {
  const equipmentItems = useEquipmentItems(associationId);
  const reservationRequests = useReservationRequests({ clubId });
  const equipmentReservations = useEquipmentReservations(undefined, clubId);
  const availability = useEquipmentAvailability();

  const refresh = () => {
    equipmentItems.refreshItems();
    reservationRequests.refreshRequests();
    equipmentReservations.refreshReservations();
  };

  return {
    // Items (lecture seule pour les clubs)
    items: equipmentItems.items,
    refreshItems: equipmentItems.refreshItems,

    // Requests (gestion complète pour le club)
    requests: reservationRequests.requests,
    createRequest: reservationRequests.createRequest,
    refreshRequests: reservationRequests.refreshRequests,

    // Reservations (lecture seule des réservations du club)
    reservations: equipmentReservations.reservations,
    refreshReservations: equipmentReservations.refreshReservations,

    // Availability
    checkAvailability: availability.checkAvailability,
    checkRequestAvailability: availability.checkRequestAvailability,
    getAvailabilityForPeriod: availability.getAvailabilityForPeriod,

    // Global
    refresh,
    isLoading: equipmentItems.loading || reservationRequests.loading || equipmentReservations.loading,
    error: equipmentItems.error || reservationRequests.error || equipmentReservations.error,
  };
}