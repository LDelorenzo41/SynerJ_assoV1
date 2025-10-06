// src/hooks/useCommunicationLikes.ts

import { useState, useEffect, useCallback } from 'react';
import { CommunicationLikesService, CommunicationLikeStats } from '../services/communicationLikesService';
import { useAuthNew } from './useAuthNew';

interface UseCommunicationLikesReturn {
  stats: CommunicationLikeStats;
  loading: boolean;
  toggling: boolean;
  error: string | null;
  toggleLike: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook personnalisé pour gérer les likes d'une communication
 * @param communicationId - ID de la communication
 */
export const useCommunicationLikes = (communicationId: string): UseCommunicationLikesReturn => {
  const { user } = useAuthNew();
  const [stats, setStats] = useState<CommunicationLikeStats>({ totalLikes: 0, isLikedByUser: false });
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les statistiques de likes
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CommunicationLikesService.getLikeStats(communicationId, user?.id);
      setStats(data);
    } catch (err: any) {
      console.error('Error loading communication like stats:', err);
      setError(err.message || 'Erreur lors du chargement des likes');
    } finally {
      setLoading(false);
    }
  }, [communicationId, user?.id]);

  // Charger au montage
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Toggle le like
  const toggleLike = useCallback(async () => {
    if (!user) {
      setError('Vous devez être connecté pour liker une communication');
      return;
    }

    try {
      setToggling(true);
      setError(null);

      const result = await CommunicationLikesService.toggleLike(communicationId, user.id);

      if (result.success) {
        // Mise à jour optimiste de l'UI
        setStats(prev => ({
          totalLikes: result.isLiked ? prev.totalLikes + 1 : Math.max(0, prev.totalLikes - 1),
          isLikedByUser: result.isLiked,
        }));
      } else {
        throw new Error('Erreur lors du like');
      }
    } catch (err: any) {
      console.error('Error toggling communication like:', err);
      setError(err.message || 'Erreur lors du like');
      // Recharger les stats en cas d'erreur pour être sûr de l'état réel
      await loadStats();
    } finally {
      setToggling(false);
    }
  }, [user, communicationId, loadStats]);

  // Rafraîchir les stats
  const refresh = useCallback(async () => {
    await loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    toggling,
    error,
    toggleLike,
    refresh,
  };
};

/**
 * Hook pour obtenir uniquement les stats de likes (plus léger)
 * Utile pour afficher le nombre de likes dans une liste de communications
 */
export const useCommunicationLikeStats = (communicationId: string): {
  stats: CommunicationLikeStats;
  loading: boolean;
  refresh: () => Promise<void>;
} => {
  const { user } = useAuthNew();
  const [stats, setStats] = useState<CommunicationLikeStats>({ totalLikes: 0, isLikedByUser: false });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await CommunicationLikesService.getLikeStats(communicationId, user?.id);
      setStats(data);
    } catch (err) {
      console.error('Error loading communication like stats:', err);
    } finally {
      setLoading(false);
    }
  }, [communicationId, user?.id]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, refresh: loadStats };
};