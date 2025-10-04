import { supabase } from '../lib/supabase';

export interface EventLike {
  id: string;
  user_id: string;
  event_id: string;
  created_at: string;
}

export interface LikeStats {
  totalLikes: number;
  isLikedByUser: boolean;
}

export class LikesService {
  /**
   * Toggle le like d'un événement (like si pas liké, unlike si déjà liké)
   */
  static async toggleLike(eventId: string, userId: string): Promise<{ success: boolean; isLiked: boolean; error?: any }> {
    try {
      // Vérifier si l'utilisateur a déjà liké cet événement
      const { data: existingLike, error: checkError } = await supabase
        .from('event_likes')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingLike) {
        // Unliker : supprimer le like existant
        const { error: deleteError } = await supabase
          .from('event_likes')
          .delete()
          .eq('id', existingLike.id);

        if (deleteError) throw deleteError;

        return { success: true, isLiked: false };
      } else {
        // Liker : créer un nouveau like
        const { error: insertError } = await supabase
          .from('event_likes')
          .insert([{ event_id: eventId, user_id: userId }]);

        if (insertError) throw insertError;

        return { success: true, isLiked: true };
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      return { success: false, isLiked: false, error };
    }
  }

  /**
   * Récupérer les statistiques de likes pour un événement
   */
  static async getLikeStats(eventId: string, userId?: string): Promise<LikeStats> {
    try {
      // Compter le nombre total de likes
      const { count, error: countError } = await supabase
        .from('event_likes')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      if (countError) throw countError;

      // Vérifier si l'utilisateur actuel a liké
      let isLikedByUser = false;
      if (userId) {
        const { data, error: checkError } = await supabase
          .from('event_likes')
          .select('id')
          .eq('event_id', eventId)
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
      console.error('Error fetching like stats:', error);
      return { totalLikes: 0, isLikedByUser: false };
    }
  }

  /**
   * Récupérer les statistiques de likes pour plusieurs événements en une seule requête
   */
  static async getBulkLikeStats(eventIds: string[], userId?: string): Promise<Map<string, LikeStats>> {
    try {
      const statsMap = new Map<string, LikeStats>();

      if (eventIds.length === 0) return statsMap;

      // Récupérer tous les likes pour ces événements
      const { data: likes, error } = await supabase
        .from('event_likes')
        .select('event_id, user_id')
        .in('event_id', eventIds);

      if (error) throw error;

      // Compter les likes par événement
      eventIds.forEach(eventId => {
        const eventLikes = likes?.filter(like => like.event_id === eventId) || [];
        const isLikedByUser = userId ? eventLikes.some(like => like.user_id === userId) : false;

        statsMap.set(eventId, {
          totalLikes: eventLikes.length,
          isLikedByUser,
        });
      });

      return statsMap;
    } catch (error) {
      console.error('Error fetching bulk like stats:', error);
      return new Map();
    }
  }

  /**
   * Récupérer la liste des utilisateurs qui ont liké un événement
   */
  static async getEventLikers(eventId: string): Promise<{ id: string; pseudo: string | null }[]> {
    try {
      const { data, error } = await supabase
        .from('event_likes')
        .select(`
          user_id,
          profiles!inner(id, pseudo)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map((like: any) => ({
        id: like.profiles.id,
        pseudo: like.profiles.pseudo,
      })) || [];
    } catch (error) {
      console.error('Error fetching event likers:', error);
      return [];
    }
  }
}