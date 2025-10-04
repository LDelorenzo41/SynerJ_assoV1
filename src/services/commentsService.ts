// src/services/commentsService.ts

import { supabase } from '../lib/supabase';
import {
  EventComment,
  EventCommentWithUser,
  CreateCommentInput,
  UpdateCommentInput,
  CommentStats,
  COMMENT_VALIDATION,
  COMMENT_ERROR_MESSAGES,
} from '../types/comments';

export class CommentsService {
  /**
   * Récupérer tous les commentaires d'un événement avec les infos des utilisateurs
   */
  static async getEventComments(eventId: string): Promise<EventCommentWithUser[]> {
    try {
      const { data, error } = await supabase
        .from('event_comments')
        .select(`
          *,
          profiles:user_id (
            id,
            pseudo,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: true }); // Les plus anciens en premier

      if (error) {
        console.error('Error fetching comments:', error);
        throw new Error(COMMENT_ERROR_MESSAGES.FETCH_FAILED);
      }

      return data as EventCommentWithUser[];
    } catch (error) {
      console.error('Error in getEventComments:', error);
      throw error;
    }
  }

  /**
   * Créer un nouveau commentaire
   */
  static async createComment(input: CreateCommentInput): Promise<EventCommentWithUser> {
    try {
      // Validation du contenu
      const trimmedContent = input.content.trim();
      
      if (trimmedContent.length < COMMENT_VALIDATION.MIN_LENGTH) {
        throw new Error(COMMENT_ERROR_MESSAGES.TOO_SHORT);
      }
      
      if (trimmedContent.length > COMMENT_VALIDATION.MAX_LENGTH) {
        throw new Error(COMMENT_ERROR_MESSAGES.TOO_LONG);
      }

      // Insertion du commentaire
      const { data, error } = await supabase
        .from('event_comments')
        .insert([{
          event_id: input.event_id,
          user_id: input.user_id,
          content: trimmedContent,
        }])
        .select(`
          *,
          profiles:user_id (
            id,
            pseudo,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error creating comment:', error);
        throw new Error(COMMENT_ERROR_MESSAGES.CREATION_FAILED);
      }

      return data as EventCommentWithUser;
    } catch (error) {
      console.error('Error in createComment:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un commentaire existant
   */
  static async updateComment(
    commentId: string,
    input: UpdateCommentInput,
    userId: string
  ): Promise<EventCommentWithUser> {
    try {
      // Validation du contenu
      const trimmedContent = input.content.trim();
      
      if (trimmedContent.length < COMMENT_VALIDATION.MIN_LENGTH) {
        throw new Error(COMMENT_ERROR_MESSAGES.TOO_SHORT);
      }
      
      if (trimmedContent.length > COMMENT_VALIDATION.MAX_LENGTH) {
        throw new Error(COMMENT_ERROR_MESSAGES.TOO_LONG);
      }

      // Vérifier que le commentaire appartient à l'utilisateur
      const { data: existingComment, error: fetchError } = await supabase
        .from('event_comments')
        .select('user_id')
        .eq('id', commentId)
        .single();

      if (fetchError || !existingComment) {
        throw new Error(COMMENT_ERROR_MESSAGES.NOT_FOUND);
      }

      if (existingComment.user_id !== userId) {
        throw new Error(COMMENT_ERROR_MESSAGES.UNAUTHORIZED);
      }

      // Mise à jour du commentaire
      const { data, error } = await supabase
        .from('event_comments')
        .update({ content: trimmedContent })
        .eq('id', commentId)
        .select(`
          *,
          profiles:user_id (
            id,
            pseudo,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error updating comment:', error);
        throw new Error(COMMENT_ERROR_MESSAGES.UPDATE_FAILED);
      }

      return data as EventCommentWithUser;
    } catch (error) {
      console.error('Error in updateComment:', error);
      throw error;
    }
  }

  /**
   * Supprimer un commentaire
   */
  static async deleteComment(commentId: string, userId: string, isAdmin: boolean = false): Promise<void> {
    try {
      if (!isAdmin) {
        // Vérifier que le commentaire appartient à l'utilisateur
        const { data: existingComment, error: fetchError } = await supabase
          .from('event_comments')
          .select('user_id')
          .eq('id', commentId)
          .single();

        if (fetchError || !existingComment) {
          throw new Error(COMMENT_ERROR_MESSAGES.NOT_FOUND);
        }

        if (existingComment.user_id !== userId) {
          throw new Error(COMMENT_ERROR_MESSAGES.UNAUTHORIZED);
        }
      }

      // Suppression du commentaire
      const { error } = await supabase
        .from('event_comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Error deleting comment:', error);
        throw new Error(COMMENT_ERROR_MESSAGES.DELETE_FAILED);
      }
    } catch (error) {
      console.error('Error in deleteComment:', error);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques de commentaires pour un événement
   */
  static async getCommentStats(eventId: string, userId?: string): Promise<CommentStats> {
    try {
      // Compter le nombre total de commentaires
      const { count, error: countError } = await supabase
        .from('event_comments')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      if (countError) {
        console.error('Error counting comments:', countError);
        throw countError;
      }

      // Vérifier si l'utilisateur a commenté
      let userHasCommented = false;
      if (userId) {
        const { data, error: checkError } = await supabase
          .from('event_comments')
          .select('id')
          .eq('event_id', eventId)
          .eq('user_id', userId)
          .limit(1)
          .maybeSingle();

        if (!checkError && data) {
          userHasCommented = true;
        }
      }

      return {
        totalComments: count || 0,
        userHasCommented,
      };
    } catch (error) {
      console.error('Error fetching comment stats:', error);
      return { totalComments: 0, userHasCommented: false };
    }
  }

  /**
   * Récupérer les statistiques de commentaires pour plusieurs événements
   */
  static async getBulkCommentStats(
    eventIds: string[],
    userId?: string
  ): Promise<Map<string, CommentStats>> {
    try {
      const statsMap = new Map<string, CommentStats>();

      if (eventIds.length === 0) return statsMap;

      // Récupérer tous les commentaires pour ces événements
      const { data: comments, error } = await supabase
        .from('event_comments')
        .select('event_id, user_id')
        .in('event_id', eventIds);

      if (error) {
        console.error('Error fetching bulk comment stats:', error);
        throw error;
      }

      // Compter les commentaires par événement
      eventIds.forEach(eventId => {
        const eventComments = comments?.filter(comment => comment.event_id === eventId) || [];
        const userHasCommented = userId 
          ? eventComments.some(comment => comment.user_id === userId) 
          : false;

        statsMap.set(eventId, {
          totalComments: eventComments.length,
          userHasCommented,
        });
      });

      return statsMap;
    } catch (error) {
      console.error('Error in getBulkCommentStats:', error);
      return new Map();
    }
  }

  /**
   * Vérifier si un utilisateur peut supprimer un commentaire
   * (soit il est l'auteur, soit il est Club Admin de l'événement)
   */
  static async canDeleteComment(commentId: string, userId: string): Promise<boolean> {
    try {
      const { data: comment, error } = await supabase
        .from('event_comments')
        .select(`
          user_id,
          event_id,
          events:event_id (
            club_id
          )
        `)
        .eq('id', commentId)
        .single();

      if (error || !comment) {
        return false;
      }

      // L'utilisateur est l'auteur
      if (comment.user_id === userId) {
        return true;
      }

      // Vérifier si l'utilisateur est Club Admin du club de l'événement
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, club_id')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        return false;
      }

      const eventClubId = (comment.events as any)?.club_id;
      return profile.role === 'Club Admin' && profile.club_id === eventClubId;
    } catch (error) {
      console.error('Error checking delete permission:', error);
      return false;
    }
  }
}