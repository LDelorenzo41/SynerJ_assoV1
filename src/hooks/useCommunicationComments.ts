// src/hooks/useCommunicationComments.ts

import { useState, useEffect, useCallback } from 'react';
import { CommunicationCommentsService } from '../services/communicationCommentsService';
import { 
  CommunicationCommentWithUser, 
  CommunicationCommentStats 
} from '../types/communicationInteractions';
import { useAuthNew } from './useAuthNew';

interface UseCommunicationCommentsReturn {
  comments: CommunicationCommentWithUser[];
  stats: CommunicationCommentStats;
  loading: boolean;
  error: string | null;
  createComment: (content: string) => Promise<boolean>;
  updateComment: (commentId: string, content: string) => Promise<boolean>;
  deleteComment: (commentId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

/**
 * Hook personnalisé pour gérer les commentaires d'une communication
 * @param communicationId - ID de la communication
 * @param autoLoad - Charger automatiquement les commentaires au montage (défaut: true)
 */
export const useCommunicationComments = (
  communicationId: string, 
  autoLoad: boolean = true
): UseCommunicationCommentsReturn => {
  const { user } = useAuthNew();
  const [comments, setComments] = useState<CommunicationCommentWithUser[]>([]);
  const [stats, setStats] = useState<CommunicationCommentStats>({ totalComments: 0, userHasCommented: false });
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  // Charger les commentaires et les stats
  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [commentsData, statsData] = await Promise.all([
        CommunicationCommentsService.getCommunicationComments(communicationId),
        CommunicationCommentsService.getCommentStats(communicationId, user?.id),
      ]);

      setComments(commentsData);
      setStats(statsData);
    } catch (err: any) {
      console.error('Error loading communication comments:', err);
      setError(err.message || 'Erreur lors du chargement des commentaires');
    } finally {
      setLoading(false);
    }
  }, [communicationId, user?.id]);

  // Charger automatiquement au montage si autoLoad est true
  useEffect(() => {
    if (autoLoad) {
      loadComments();
    }
  }, [autoLoad, loadComments]);

  // Créer un nouveau commentaire
  const createComment = useCallback(
    async (content: string): Promise<boolean> => {
      if (!user) {
        setError('Vous devez être connecté pour commenter');
        return false;
      }

      try {
        setError(null);
        const newComment = await CommunicationCommentsService.createComment({
          communication_id: communicationId,
          user_id: user.id,
          content,
        });

        setComments(prev => [...prev, newComment]);
        setStats(prev => ({
          totalComments: prev.totalComments + 1,
          userHasCommented: true,
        }));

        return true;
      } catch (err: any) {
        console.error('Error creating communication comment:', err);
        setError(err.message || 'Erreur lors de la création du commentaire');
        return false;
      }
    },
    [user, communicationId]
  );

  // Mettre à jour un commentaire
  const updateComment = useCallback(
    async (commentId: string, content: string): Promise<boolean> => {
      if (!user) {
        setError('Vous devez être connecté pour modifier un commentaire');
        return false;
      }

      try {
        setError(null);
        const updatedComment = await CommunicationCommentsService.updateComment(
          commentId,
          { content },
          user.id
        );

        setComments(prev =>
          prev.map(c => (c.id === commentId ? updatedComment : c))
        );

        return true;
      } catch (err: any) {
        console.error('Error updating communication comment:', err);
        setError(err.message || 'Erreur lors de la modification du commentaire');
        return false;
      }
    },
    [user]
  );

  // Supprimer un commentaire
  const deleteComment = useCallback(
    async (commentId: string): Promise<boolean> => {
      if (!user) {
        setError('Vous devez être connecté pour supprimer un commentaire');
        return false;
      }

      try {
        setError(null);
        await CommunicationCommentsService.deleteComment(commentId, user.id);

        setComments(prev => prev.filter(c => c.id !== commentId));
        setStats(prev => ({
          totalComments: Math.max(0, prev.totalComments - 1),
          userHasCommented: prev.userHasCommented,
        }));

        return true;
      } catch (err: any) {
        console.error('Error deleting communication comment:', err);
        setError(err.message || 'Erreur lors de la suppression du commentaire');
        return false;
      }
    },
    [user]
  );

  // Rafraîchir les commentaires
  const refresh = useCallback(async () => {
    await loadComments();
  }, [loadComments]);

  return {
    comments,
    stats,
    loading,
    error,
    createComment,
    updateComment,
    deleteComment,
    refresh,
  };
};

/**
 * Hook pour obtenir uniquement les stats de commentaires (plus léger)
 * Utile pour afficher le nombre de commentaires dans une liste de communications
 */
export const useCommunicationCommentStats = (communicationId: string): {
  stats: CommunicationCommentStats;
  loading: boolean;
  refresh: () => Promise<void>;
} => {
  const { user } = useAuthNew();
  const [stats, setStats] = useState<CommunicationCommentStats>({ totalComments: 0, userHasCommented: false });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await CommunicationCommentsService.getCommentStats(communicationId, user?.id);
      setStats(data);
    } catch (err) {
      console.error('Error loading communication comment stats:', err);
    } finally {
      setLoading(false);
    }
  }, [communicationId, user?.id]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, refresh: loadStats };
};