// src/services/communicationCommentsService.ts

import { supabase } from '../lib/supabase';
import {
  CommunicationComment,
  CommunicationCommentWithUser,
  CreateCommunicationCommentInput,
  UpdateCommunicationCommentInput,
  CommunicationCommentStats,
  COMMUNICATION_COMMENT_VALIDATION,
  COMMUNICATION_COMMENT_ERROR_MESSAGES,
} from '../types/communicationInteractions';

export class CommunicationCommentsService {
  /**
   * Récupérer tous les commentaires d'une communication avec les infos des utilisateurs
   */
  static async getCommunicationComments(communicationId: string): Promise<CommunicationCommentWithUser[]> {
    try {
      const { data, error } = await supabase
        .from('communication_comments')
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
        .eq('communication_id', communicationId)
        .order('created_at', { ascending: true }); // Les plus anciens en premier

      if (error) {
        console.error('Error fetching communication comments:', error);
        throw new Error(COMMUNICATION_COMMENT_ERROR_MESSAGES.FETCH_FAILED);
      }

      return data as CommunicationCommentWithUser[];
    } catch (error) {
      console.error('Error in getCommunicationComments:', error);
      throw error;
    }
  }

  /**
   * Créer un nouveau commentaire
   */
  static async createComment(input: CreateCommunicationCommentInput): Promise<CommunicationCommentWithUser> {
    try {
      // Validation du contenu
      const trimmedContent = input.content.trim();
      
      if (trimmedContent.length < COMMUNICATION_COMMENT_VALIDATION.MIN_LENGTH) {
        throw new Error(COMMUNICATION_COMMENT_ERROR_MESSAGES.TOO_SHORT);
      }
      
      if (trimmedContent.length > COMMUNICATION_COMMENT_VALIDATION.MAX_LENGTH) {
        throw new Error(COMMUNICATION_COMMENT_ERROR_MESSAGES.TOO_LONG);
      }

      // Insertion du commentaire
      const { data, error } = await supabase
        .from('communication_comments')
        .insert([{
          communication_id: input.communication_id,
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
        console.error('Error creating communication comment:', error);
        throw new Error(COMMUNICATION_COMMENT_ERROR_MESSAGES.CREATION_FAILED);
      }

      return data as CommunicationCommentWithUser;
    } catch (error) {
      console.error('Error in createComment:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un commentaire
   */
  static async updateComment(
    commentId: string,
    input: UpdateCommunicationCommentInput,
    userId: string
  ): Promise<CommunicationCommentWithUser> {
    try {
      // Validation du contenu
      const trimmedContent = input.content.trim();
      
      if (trimmedContent.length < COMMUNICATION_COMMENT_VALIDATION.MIN_LENGTH) {
        throw new Error(COMMUNICATION_COMMENT_ERROR_MESSAGES.TOO_SHORT);
      }
      
      if (trimmedContent.length > COMMUNICATION_COMMENT_VALIDATION.MAX_LENGTH) {
        throw new Error(COMMUNICATION_COMMENT_ERROR_MESSAGES.TOO_LONG);
      }

      // Vérifier que l'utilisateur est bien le propriétaire du commentaire
      const { data: existingComment, error: fetchError } = await supabase
        .from('communication_comments')
        .select('user_id')
        .eq('id', commentId)
        .single();

      if (fetchError || !existingComment) {
        throw new Error(COMMUNICATION_COMMENT_ERROR_MESSAGES.NOT_FOUND);
      }

      if (existingComment.user_id !== userId) {
        throw new Error(COMMUNICATION_COMMENT_ERROR_MESSAGES.UNAUTHORIZED);
      }

      // Mise à jour du commentaire
      const { data, error } = await supabase
        .from('communication_comments')
        .update({
          content: trimmedContent,
          updated_at: new Date().toISOString(),
        })
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
        console.error('Error updating communication comment:', error);
        throw new Error(COMMUNICATION_COMMENT_ERROR_MESSAGES.UPDATE_FAILED);
      }

      return data as CommunicationCommentWithUser;
    } catch (error) {
      console.error('Error in updateComment:', error);
      throw error;
    }
  }

  /**
   * Supprimer un commentaire
   */
  static async deleteComment(commentId: string, userId: string): Promise<void> {
    try {
      // Vérifier que l'utilisateur est bien le propriétaire du commentaire
      // ou qu'il est Club Admin du club de la communication
      const { data: comment, error: fetchError } = await supabase
        .from('communication_comments')
        .select(`
          user_id,
          communication_id,
          communications!inner(club_id)
        `)
        .eq('id', commentId)
        .single();

      if (fetchError || !comment) {
        throw new Error(COMMUNICATION_COMMENT_ERROR_MESSAGES.NOT_FOUND);
      }

      // Vérifier les permissions
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role, club_id')
        .eq('id', userId)
        .single();

      const isOwner = comment.user_id === userId;
      const isClubAdmin = profile?.role === 'Club Admin' && 
                         profile?.club_id === (comment.communications as any).club_id;

      if (!isOwner && !isClubAdmin) {
        throw new Error(COMMUNICATION_COMMENT_ERROR_MESSAGES.UNAUTHORIZED);
      }

      // Suppression du commentaire
      const { error } = await supabase
        .from('communication_comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Error deleting communication comment:', error);
        throw new Error(COMMUNICATION_COMMENT_ERROR_MESSAGES.DELETE_FAILED);
      }
    } catch (error) {
      console.error('Error in deleteComment:', error);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques de commentaires pour une communication
   */
  static async getCommentStats(communicationId: string, userId?: string): Promise<CommunicationCommentStats> {
    try {
      // Compter le nombre total de commentaires
      const { count, error: countError } = await supabase
        .from('communication_comments')
        .select('*', { count: 'exact', head: true })
        .eq('communication_id', communicationId);

      if (countError) {
        console.error('Error counting communication comments:', countError);
        throw countError;
      }

      // Vérifier si l'utilisateur a commenté
      let userHasCommented = false;
      if (userId) {
        const { data, error: checkError } = await supabase
          .from('communication_comments')
          .select('id')
          .eq('communication_id', communicationId)
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
      console.error('Error fetching communication comment stats:', error);
      return { totalComments: 0, userHasCommented: false };
    }
  }

  /**
   * Récupérer les statistiques de commentaires pour plusieurs communications
   */
  static async getBulkCommentStats(
    communicationIds: string[],
    userId?: string
  ): Promise<Map<string, CommunicationCommentStats>> {
    try {
      const statsMap = new Map<string, CommunicationCommentStats>();

      if (communicationIds.length === 0) return statsMap;

      // Récupérer tous les commentaires pour ces communications
      const { data: comments, error } = await supabase
        .from('communication_comments')
        .select('communication_id, user_id')
        .in('communication_id', communicationIds);

      if (error) {
        console.error('Error fetching bulk communication comment stats:', error);
        throw error;
      }

      // Compter les commentaires par communication
      communicationIds.forEach(communicationId => {
        const communicationComments = comments?.filter(comment => comment.communication_id === communicationId) || [];
        const userHasCommented = userId 
          ? communicationComments.some(comment => comment.user_id === userId)
          : false;

        statsMap.set(communicationId, {
          totalComments: communicationComments.length,
          userHasCommented,
        });
      });

      return statsMap;
    } catch (error) {
      console.error('Error in getBulkCommentStats:', error);
      return new Map();
    }
  }
}