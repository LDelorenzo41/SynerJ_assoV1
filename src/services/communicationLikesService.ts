// src/services/communicationLikesService.ts

import { supabase } from '../lib/supabase';

export interface CommunicationLike {
  id: string;
  user_id: string;
  communication_id: string;
  created_at: string;
}

export interface CommunicationLikeStats {
  totalLikes: number;
  isLikedByUser: boolean;
}

export class CommunicationLikesService {
  /**
   * Toggle le like d'une communication (like si pas liké, unlike si déjà liké)
   */
  static async toggleLike(
    communicationId: string,
    userId: string
  ): Promise<{ success: boolean; isLiked: boolean; error?: any }> {
    try {
      // Vérifier si l'utilisateur a déjà liké cette communication
      const { data: existingLike, error: checkError } = await supabase
        .from('communication_likes')
        .select('id')
        .eq('communication_id', communicationId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingLike) {
        // Unliker : supprimer le like existant
        const { error: deleteError } = await supabase
          .from('communication_likes')
          .delete()
          .eq('id', existingLike.id);

        if (deleteError) throw deleteError;

        return { success: true, isLiked: false };
      } else {
        // Liker : créer un nouveau like
        const { error: insertError } = await supabase
          .from('communication_likes')
          .insert([{ communication_id: communicationId, user_id: userId }]);

        if (insertError) throw insertError;

        return { success: true, isLiked: true };
      }
    } catch (error) {
      console.error('Error toggling communication like:', error);
      return { success: false, isLiked: false, error };
    }
  }

  /**
   * Récupérer les statistiques de likes pour une communication
   */
  static async getLikeStats(
    communicationId: string,
    userId?: string
  ): Promise<CommunicationLikeStats> {
    try {
      // Compter le nombre total de likes
      const { count, error: countError } = await supabase
        .from('communication_likes')
        .select('*', { count: 'exact', head: true })
        .eq('communication_id', communicationId);

      if (countError) throw countError;

      // Vérifier si l'utilisateur actuel a liké
      let isLikedByUser = false;
      if (userId) {
        const { data, error: checkError } = await supabase
          .from('communication_likes')
          .select('id')
          .eq('communication_id', communicationId)
          .eq('user_id', userId)
          .maybeSingle();

        if (!checkError && data) {
          isLikedByUser = true;
        }
      }

      return {
        totalLikes: count || 0,
        isLikedByUser,
      };
    } catch (error) {
      console.error('Error fetching communication like stats:', error);
      return { totalLikes: 0, isLikedByUser: false };
    }
  }

  /**
   * Récupérer les statistiques de likes pour plusieurs communications en une seule requête
   */
  static async getBulkLikeStats(
    communicationIds: string[],
    userId?: string
  ): Promise<Map<string, CommunicationLikeStats>> {
    try {
      const statsMap = new Map<string, CommunicationLikeStats>();

      if (communicationIds.length === 0) return statsMap;

      // Récupérer tous les likes pour ces communications
      const { data: likes, error } = await supabase
        .from('communication_likes')
        .select('communication_id, user_id')
        .in('communication_id', communicationIds);

      if (error) throw error;

      // Compter les likes par communication
      communicationIds.forEach(communicationId => {
        const communicationLikes = likes?.filter(like => like.communication_id === communicationId) || [];
        const isLikedByUser = userId ? communicationLikes.some(like => like.user_id === userId) : false;

        statsMap.set(communicationId, {
          totalLikes: communicationLikes.length,
          isLikedByUser,
        });
      });

      return statsMap;
    } catch (error) {
      console.error('Error fetching bulk communication like stats:', error);
      return new Map();
    }
  }

  /**
   * Récupérer la liste des utilisateurs qui ont liké une communication
   */
  static async getCommunicationLikers(communicationId: string): Promise<{ id: string; pseudo: string | null }[]> {
    try {
      const { data, error } = await supabase
        .from('communication_likes')
        .select(`
          user_id,
          profiles!inner(id, pseudo)
        `)
        .eq('communication_id', communicationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map((like: any) => ({
        id: like.profiles.id,
        pseudo: like.profiles.pseudo,
      })) || [];
    } catch (error) {
      console.error('Error fetching communication likers:', error);
      return [];
    }
  }
}