// src/hooks/useComments.ts

import { useState, useEffect, useCallback } from 'react';
import { CommentsService } from '../services/commentsService';
import { EventCommentWithUser, CommentStats } from '../types/comments';
import { useAuthNew } from './useAuthNew';

interface UseCommentsReturn {
  comments: EventCommentWithUser[];
  stats: CommentStats;
  loading: boolean;
  error: string | null;
  createComment: (content: string) => Promise<boolean>;
  updateComment: (commentId: string, content: string) => Promise<boolean>;
  deleteComment: (commentId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

/**
 * Hook personnalisé pour gérer les commentaires d'un événement
 * @param eventId - ID de l'événement
 * @param autoLoad - Charger automatiquement les commentaires au montage (défaut: true)
 */
export const useComments = (eventId: string, autoLoad: boolean = true): UseCommentsReturn => {
  const { user } = useAuthNew();
  const [comments, setComments] = useState<EventCommentWithUser[]>([]);
  const [stats, setStats] = useState<CommentStats>({ totalComments: 0, userHasCommented: false });
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  // Charger les commentaires et les stats
  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [commentsData, statsData] = await Promise.all([
        CommentsService.getEventComments(eventId),
        CommentsService.getCommentStats(eventId, user?.id),
      ]);

      setComments(commentsData);
      setStats(statsData);
    } catch (err: any) {
      console.error('Error loading comments:', err);
      setError(err.message || 'Erreur lors du chargement des commentaires');
    } finally {
      setLoading(false);
    }
  }, [eventId, user?.id]);

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
        const newComment = await CommentsService.createComment({
          event_id: eventId,
          user_id: user.id,
          content: content.trim(),
        });

        setComments(prev => [...prev, newComment]);
        setStats(prev => ({
          totalComments: prev.totalComments + 1,
          userHasCommented: true,
        }));

        return true;
      } catch (err: any) {
        console.error('Error creating comment:', err);
        setError(err.message || 'Erreur lors de la création du commentaire');
        return false;
      }
    },
    [eventId, user]
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
        const updatedComment = await CommentsService.updateComment(
          commentId,
          { content: content.trim() },
          user.id
        );

        setComments(prev =>
          prev.map(c => (c.id === commentId ? updatedComment : c))
        );

        return true;
      } catch (err: any) {
        console.error('Error updating comment:', err);
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
        await CommentsService.deleteComment(commentId, user.id);

        setComments(prev => prev.filter(c => c.id !== commentId));
        setStats(prev => ({
          totalComments: Math.max(0, prev.totalComments - 1),
          userHasCommented: prev.userHasCommented, // Pourrait être recalculé si nécessaire
        }));

        return true;
      } catch (err: any) {
        console.error('Error deleting comment:', err);
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
 * Utile pour afficher le nombre de commentaires dans une liste d'événements
 */
export const useCommentStats = (eventId: string): {
  stats: CommentStats;
  loading: boolean;
  refresh: () => Promise<void>;
} => {
  const { user } = useAuthNew();
  const [stats, setStats] = useState<CommentStats>({ totalComments: 0, userHasCommented: false });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await CommentsService.getCommentStats(eventId, user?.id);
      setStats(data);
    } catch (err) {
      console.error('Error loading comment stats:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId, user?.id]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, refresh: loadStats };
};