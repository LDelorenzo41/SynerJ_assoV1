// ============================================
// HOOK COMMUNICATIONS - Système de Communications
// Fichier : src/hooks/useCommunications.ts
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { CommunicationService } from '../services/communicationService';
import { useAuthNew } from './useAuthNew';
import type { 
  Communication,
  CreateCommunicationInput,
  UpdateCommunicationInput,
  CommunicationFilters,
  PaginatedCommunications,
  CommunicationStats
} from '../types/communication';

interface UseCommunicationsOptions {
  filters?: CommunicationFilters;
  pageSize?: number;
  autoFetch?: boolean;
}

interface UseCommunicationsResult {
  // État
  communications: Communication[];
  loading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalCount: number;
  hasMore: boolean;
  
  // Statistiques
  stats: CommunicationStats | null;
  statsLoading: boolean;
  
  // Actions
  fetchCommunications: (page?: number) => Promise<void>;
  createCommunication: (input: CreateCommunicationInput) => Promise<Communication>;
  updateCommunication: (id: string, updates: UpdateCommunicationInput) => Promise<Communication>;
  deleteCommunication: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  searchCommunications: (query: string) => Promise<Communication[]>;
  refreshStats: () => Promise<void>;
  
  // Utilitaires
  resetFilters: () => void;
  setFilters: (filters: CommunicationFilters) => void;
  loadMore: () => Promise<void>;
}

export const useCommunications = (options: UseCommunicationsOptions = {}): UseCommunicationsResult => {
  const { profile } = useAuthNew();
  const {
    filters: initialFilters = {},
    pageSize = 10,
    autoFetch = true
  } = options;

  // États principaux
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // États pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  // États filtres
  const [filters, setFiltersState] = useState<CommunicationFilters>(initialFilters);
  
  // États statistiques
  const [stats, setStats] = useState<CommunicationStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // ============================================
  // RÉCUPÉRATION DES COMMUNICATIONS
  // ============================================

  const fetchCommunications = useCallback(async (page: number = 1) => {
    if (!profile?.association_id) return;

    setLoading(true);
    setError(null);

    try {
      // Ajouter l'association_id aux filtres
      const finalFilters = {
        ...filters,
        association_id: profile.association_id
      };

      const result: PaginatedCommunications = await CommunicationService.getCommunications(
        finalFilters,
        page,
        pageSize
      );

      if (page === 1) {
        setCommunications(result.data);
      } else {
        setCommunications(prev => [...prev, ...result.data]);
      }

      setCurrentPage(page);
      setTotalCount(result.count);
      setHasMore(result.has_more);

    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des communications');
      console.error('Error fetching communications:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?.association_id, filters, pageSize]);

  // ============================================
  // ACTIONS CRUD
  // ============================================

  const createCommunication = useCallback(async (input: CreateCommunicationInput): Promise<Communication> => {
    if (!profile?.id || !profile?.association_id) {
      throw new Error('Utilisateur non authentifié');
    }

    setError(null);

    try {
      const communicationInput = {
        ...input,
        author_id: profile.id,
        association_id: profile.association_id,
        // Pour les Club Admins, forcer club_id à leur club
        club_id: profile.role === 'Club Admin' ? profile.club_id : input.club_id
      };

      const newCommunication = await CommunicationService.createCommunication(communicationInput);
      
      // Ajouter la nouvelle communication en haut de la liste
      setCommunications(prev => [newCommunication, ...prev]);
      setTotalCount(prev => prev + 1);

      // Rafraîchir les stats
      await refreshStats();

      return newCommunication;

    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la création de la communication';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [profile]);

  const updateCommunication = useCallback(async (id: string, updates: UpdateCommunicationInput): Promise<Communication> => {
    setError(null);

    try {
      const updatedCommunication = await CommunicationService.updateCommunication(id, updates);
      
      // Mettre à jour la communication dans la liste
      setCommunications(prev => 
        prev.map(comm => 
          comm.id === id ? updatedCommunication : comm
        )
      );

      return updatedCommunication;

    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la mise à jour de la communication';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteCommunication = useCallback(async (id: string): Promise<void> => {
    setError(null);

    try {
      await CommunicationService.deleteCommunication(id);
      
      // Supprimer la communication de la liste
      setCommunications(prev => prev.filter(comm => comm.id !== id));
      setTotalCount(prev => Math.max(0, prev - 1));

      // Rafraîchir les stats
      await refreshStats();

    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la suppression de la communication';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const togglePin = useCallback(async (id: string): Promise<void> => {
    setError(null);

    try {
      const updatedCommunication = await CommunicationService.togglePin(id);
      
      // Mettre à jour la communication dans la liste
      setCommunications(prev => {
        const updated = prev.map(comm => 
          comm.id === id ? updatedCommunication : comm
        );

        // Trier pour mettre les épinglées en premier
        return updated.sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      });

    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la modification de l\'épinglage';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // ============================================
  // RECHERCHE
  // ============================================

  const searchCommunications = useCallback(async (query: string): Promise<Communication[]> => {
    if (!profile?.association_id || !query.trim()) return [];

    setError(null);

    try {
      return await CommunicationService.searchCommunications(
        query,
        profile.association_id,
        profile.role === 'Club Admin' ? profile.club_id || undefined : undefined
      );

    } catch (err: any) {
      setError(err.message || 'Erreur lors de la recherche');
      console.error('Error searching communications:', err);
      return [];
    }
  }, [profile]);

  // ============================================
  // STATISTIQUES
  // ============================================

  const refreshStats = useCallback(async () => {
    if (!profile?.association_id) return;

    setStatsLoading(true);

    try {
      const newStats = await CommunicationService.getCommunicationStats(
        profile.association_id,
        profile.role === 'Club Admin' ? profile.club_id || undefined : undefined
      );
      setStats(newStats);

    } catch (err: any) {
      console.error('Error fetching communication stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [profile]);

  // ============================================
  // UTILITAIRES
  // ============================================

  const setFilters = useCallback((newFilters: CommunicationFilters) => {
    setFiltersState(newFilters);
    setCurrentPage(1);
    setCommunications([]);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters, setFilters]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchCommunications(currentPage + 1);
  }, [hasMore, loading, currentPage, fetchCommunications]);

  // ============================================
  // EFFETS
  // ============================================

  // Chargement initial
  useEffect(() => {
    if (autoFetch && profile?.association_id) {
      fetchCommunications(1);
      refreshStats();
    }
  }, [profile?.association_id, autoFetch, fetchCommunications, refreshStats]);

  // Recharger quand les filtres changent
  useEffect(() => {
    if (profile?.association_id) {
      fetchCommunications(1);
    }
  }, [filters, fetchCommunications, profile?.association_id]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // État
    communications,
    loading,
    error,
    
    // Pagination
    currentPage,
    totalCount,
    hasMore,
    
    // Statistiques
    stats,
    statsLoading,
    
    // Actions
    fetchCommunications,
    createCommunication,
    updateCommunication,
    deleteCommunication,
    togglePin,
    searchCommunications,
    refreshStats,
    
    // Utilitaires
    resetFilters,
    setFilters,
    loadMore
  };
};

// ============================================
// HOOK POUR UNE COMMUNICATION SPÉCIFIQUE
// ============================================

interface UseCommunicationOptions {
  id: string;
  autoFetch?: boolean;
}

interface UseCommunicationResult {
  communication: Communication | null;
  loading: boolean;
  error: string | null;
  fetchCommunication: () => Promise<void>;
  updateCommunication: (updates: UpdateCommunicationInput) => Promise<Communication>;
  deleteCommunication: () => Promise<void>;
  togglePin: () => Promise<void>;
}

export const useCommunication = (options: UseCommunicationOptions): UseCommunicationResult => {
  const { id, autoFetch = true } = options;
  
  const [communication, setCommunication] = useState<Communication | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunication = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const result = await CommunicationService.getCommunicationById(id);
      setCommunication(result);

      if (!result) {
        setError('Communication non trouvée');
      }

    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de la communication');
      console.error('Error fetching communication:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const updateCommunication = useCallback(async (updates: UpdateCommunicationInput): Promise<Communication> => {
    if (!id) throw new Error('ID de communication manquant');

    setError(null);

    try {
      const updated = await CommunicationService.updateCommunication(id, updates);
      setCommunication(updated);
      return updated;

    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la mise à jour';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [id]);

  const deleteCommunication = useCallback(async (): Promise<void> => {
    if (!id) throw new Error('ID de communication manquant');

    setError(null);

    try {
      await CommunicationService.deleteCommunication(id);
      setCommunication(null);

    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la suppression';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [id]);

  const togglePin = useCallback(async (): Promise<void> => {
    if (!id) throw new Error('ID de communication manquant');

    setError(null);

    try {
      const updated = await CommunicationService.togglePin(id);
      setCommunication(updated);

    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la modification de l\'épinglage';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [id]);

  useEffect(() => {
    if (autoFetch && id) {
      fetchCommunication();
    }
  }, [autoFetch, id, fetchCommunication]);

  return {
    communication,
    loading,
    error,
    fetchCommunication,
    updateCommunication,
    deleteCommunication,
    togglePin
  };
};