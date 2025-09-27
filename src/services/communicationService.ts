// ============================================
// SERVICE COMMUNICATIONS - Système de Communications
// Fichier : src/services/communicationService.ts
// ============================================

import { supabase } from '../lib/supabase';
import type { 
  Communication, 
  CreateCommunicationInput, 
  UpdateCommunicationInput,
  CommunicationFilters,
  PaginatedCommunications,
  CommunicationStats
} from '../types/communication';
import { NotificationService } from './notificationService';

export class CommunicationService {

  // ============================================
  // LECTURE DES COMMUNICATIONS
  // ============================================

  /**
   * Récupérer les communications avec filtres et pagination
   * SÉCURITÉ: Utilise les politiques RLS existantes
   */
  static async getCommunications(
    filters: CommunicationFilters = {},
    page: number = 1,
    perPage: number = 10
  ): Promise<PaginatedCommunications> {
    try {
      let query = supabase
        .from('communications')
        .select(`
          *,
          clubs:club_id (
            id,
            name,
            logo_url,
            slug
          ),
          associations:association_id (
            id,
            name
          ),
          profiles:author_id (
            id,
            first_name,
            last_name,
            role
          )
        `, { count: 'exact' });

      // Appliquer les filtres
      if (filters.club_id) {
        query = query.eq('club_id', filters.club_id);
      }

      if (filters.association_id) {
        query = query.eq('association_id', filters.association_id);
      }

      if (filters.visibility) {
        query = query.eq('visibility', filters.visibility);
      }

      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters.author_id) {
        query = query.eq('author_id', filters.author_id);
      }

      if (filters.is_pinned !== undefined) {
        query = query.eq('is_pinned', filters.is_pinned);
      }

      // Filtrer les communications expirées ou non
      if (filters.is_expired !== undefined) {
        const now = new Date().toISOString();
        if (filters.is_expired) {
          query = query.not('expires_at', 'is', null).lt('expires_at', now);
        } else {
          query = query.or(`expires_at.is.null,expires_at.gte.${now}`);
        }
      }

      // Pagination
      const offset = (page - 1) * perPage;
      query = query
        .order('is_pinned', { ascending: false }) // Communications épinglées en premier
        .order('created_at', { ascending: false }) // Puis par date de création
        .range(offset, offset + perPage - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        count: count || 0,
        has_more: (count || 0) > offset + perPage,
        page,
        per_page: perPage
      };

    } catch (error: any) {
      console.error('Error fetching communications:', error);
      throw new Error(`Impossible de récupérer les communications: ${error.message}`);
    }
  }

  /**
   * Récupérer une communication spécifique par ID
   */
  static async getCommunicationById(id: string): Promise<Communication | null> {
    try {
      const { data, error } = await supabase
        .from('communications')
        .select(`
          *,
          clubs:club_id (
            id,
            name,
            logo_url,
            slug
          ),
          associations:association_id (
            id,
            name
          ),
          profiles:author_id (
            id,
            first_name,
            last_name,
            role
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Row not found
        throw error;
      }

      return data;

    } catch (error: any) {
      console.error('Error fetching communication:', error);
      throw new Error(`Impossible de récupérer la communication: ${error.message}`);
    }
  }

  /**
   * Récupérer les statistiques des communications
   */
  static async getCommunicationStats(associationId: string, clubId?: string): Promise<CommunicationStats> {
    try {
      let query = supabase
        .from('communications')
        .select('id, priority, visibility, club_id, is_pinned, expires_at, created_at')
        .eq('association_id', associationId);

      if (clubId) {
        query = query.eq('club_id', clubId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const stats: CommunicationStats = {
        total: data?.length || 0,
        by_priority: { Low: 0, Normal: 0, High: 0, Urgent: 0 },
        by_visibility: { Public: 0, Private: 0 },
        by_club: {},
        pinned_count: 0,
        expired_count: 0,
        this_week: 0,
        this_month: 0
      };

      data?.forEach(comm => {
        // Compteurs par priorité
        stats.by_priority[comm.priority as keyof typeof stats.by_priority]++;

        // Compteurs par visibilité
        stats.by_visibility[comm.visibility as keyof typeof stats.by_visibility]++;

        // Compteurs par club
        const clubKey = comm.club_id || 'association';
        stats.by_club[clubKey] = (stats.by_club[clubKey] || 0) + 1;

        // Communications épinglées
        if (comm.is_pinned) stats.pinned_count++;

        // Communications expirées
        if (comm.expires_at && new Date(comm.expires_at) < now) {
          stats.expired_count++;
        }

        // Communications récentes
        const createdAt = new Date(comm.created_at);
        if (createdAt >= oneWeekAgo) stats.this_week++;
        if (createdAt >= oneMonthAgo) stats.this_month++;
      });

      return stats;

    } catch (error: any) {
      console.error('Error fetching communication stats:', error);
      throw new Error(`Impossible de récupérer les statistiques: ${error.message}`);
    }
  }

  // ============================================
  // CRÉATION DE COMMUNICATIONS
  // ============================================

  /**
   * Créer une nouvelle communication
   */
  static async createCommunication(input: CreateCommunicationInput): Promise<Communication> {
    try {
      const { data, error } = await supabase
        .from('communications')
        .insert([{
          title: input.title,
          content: input.content,
          visibility: input.visibility,
          priority: input.priority || 'Normal',
          club_id: input.club_id || null,
          association_id: input.association_id,
          author_id: input.author_id,
          target_clubs: input.target_clubs || null,
          image_url: input.image_url || null,
          expires_at: input.expires_at || null,
          is_pinned: input.is_pinned || false
        }])
        .select(`
          *,
          clubs:club_id (
            id,
            name,
            logo_url,
            slug
          ),
          associations:association_id (
            id,
            name
          ),
          profiles:author_id (
            id,
            first_name,
            last_name,
            role
          )
        `)
        .single();

      if (error) throw error;

      // Envoyer les notifications automatiquement
      await this.sendCommunicationNotifications(data);

      return data;

    } catch (error: any) {
      console.error('Error creating communication:', error);
      throw new Error(`Impossible de créer la communication: ${error.message}`);
    }
  }

  // ============================================
  // MISE À JOUR DE COMMUNICATIONS
  // ============================================

  /**
   * Mettre à jour une communication
   */
  static async updateCommunication(
    id: string, 
    updates: UpdateCommunicationInput
  ): Promise<Communication> {
    try {
      const { data, error } = await supabase
        .from('communications')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          clubs:club_id (
            id,
            name,
            logo_url,
            slug
          ),
          associations:association_id (
            id,
            name
          ),
          profiles:author_id (
            id,
            first_name,
            last_name,
            role
          )
        `)
        .single();

      if (error) throw error;

      return data;

    } catch (error: any) {
      console.error('Error updating communication:', error);
      throw new Error(`Impossible de mettre à jour la communication: ${error.message}`);
    }
  }

  /**
   * Épingler/désépingler une communication
   */
  static async togglePin(id: string): Promise<Communication> {
    try {
      // D'abord récupérer l'état actuel
      const current = await this.getCommunicationById(id);
      if (!current) throw new Error('Communication non trouvée');

      return await this.updateCommunication(id, {
        is_pinned: !current.is_pinned
      });

    } catch (error: any) {
      console.error('Error toggling pin:', error);
      throw new Error(`Impossible de modifier l'épinglage: ${error.message}`);
    }
  }

  // ============================================
  // SUPPRESSION DE COMMUNICATIONS
  // ============================================

  /**
   * Supprimer une communication
   */
  static async deleteCommunication(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('communications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Nettoyer les notifications associées
      await NotificationService.deleteCommunicationNotifications(id);

    } catch (error: any) {
      console.error('Error deleting communication:', error);
      throw new Error(`Impossible de supprimer la communication: ${error.message}`);
    }
  }

  // ============================================
  // SYSTÈME DE NOTIFICATIONS
  // ============================================

  /**
   * Envoyer les notifications pour une nouvelle communication
   */
  static async sendCommunicationNotifications(communication: Communication): Promise<void> {
    try {
      // Déterminer qui doit recevoir la notification
      const recipients = await this.getCommunicationRecipients(communication);

      if (recipients.length === 0) return;

      // Créer les notifications en masse
      const notifications = recipients.map(userId => ({
        user_id: userId,
        type: 'nouvelle_communication' as const,
        title: this.getNotificationTitle(communication),
        message: this.getNotificationMessage(communication),
        metadata: {
          communication_id: communication.id,
          communication_title: communication.title,
          communication_priority: communication.priority,
          communication_visibility: communication.visibility,
          communication_author: this.getAuthorName(communication),
          is_association_communication: communication.club_id === null,
          club_name: communication.clubs?.name,
          association_name: communication.associations?.name
        }
      }));

      await NotificationService.createBulkNotifications(notifications);

    } catch (error: any) {
      console.error('Error sending communication notifications:', error);
      // Ne pas faire échouer la création de communication si les notifications échouent
    }
  }

  /**
   * Déterminer qui doit recevoir les notifications
   */
  static async getCommunicationRecipients(communication: Communication): Promise<string[]> {
    try {
      const recipients: string[] = [];

      if (communication.club_id) {
        // Communication de club -> notifier les membres du club + followers
        await this.addClubRecipients(communication.club_id, recipients);
      } else {
        // Communication d'association
        if (communication.visibility === 'Public') {
          // Communication publique -> tous les membres de l'association
          await this.addAssociationRecipients(communication.association_id, recipients);
        } else if (communication.visibility === 'Private' && communication.target_clubs) {
          // Communication privée -> membres des clubs ciblés
          for (const clubId of communication.target_clubs) {
            await this.addClubRecipients(clubId, recipients);
          }
        }
      }

      // Supprimer les doublons et l'auteur (ne pas se notifier soi-même)
      return [...new Set(recipients)].filter(id => id !== communication.author_id);

    } catch (error: any) {
      console.error('Error getting communication recipients:', error);
      return [];
    }
  }

  /**
   * Ajouter les destinataires d'un club
   */
  static async addClubRecipients(clubId: string, recipients: string[]): Promise<void> {
    try {
      // Membres du club
      const { data: members } = await supabase
        .from('profiles')
        .select('id')
        .eq('club_id', clubId)
        .in('role', ['Club Admin', 'Member']);

      if (members) {
        recipients.push(...members.map(m => m.id));
      }

      // Followers du club (via user_clubs)
      const { data: followers } = await supabase
        .from('user_clubs')
        .select('user_id')
        .eq('club_id', clubId);

      if (followers) {
        recipients.push(...followers.map(f => f.user_id));
      }

    } catch (error: any) {
      console.error('Error adding club recipients:', error);
    }
  }

  /**
   * Ajouter les destinataires d'une association
   */
  static async addAssociationRecipients(associationId: string, recipients: string[]): Promise<void> {
    try {
      const { data: members } = await supabase
        .from('profiles')
        .select('id')
        .eq('association_id', associationId)
        .in('role', ['Super Admin', 'Club Admin', 'Member', 'Supporter']);

      if (members) {
        recipients.push(...members.map(m => m.id));
      }

    } catch (error: any) {
      console.error('Error adding association recipients:', error);
    }
  }

  // ============================================
  // HELPERS NOTIFICATIONS
  // ============================================

  /**
   * Générer le titre de notification
   */
  static getNotificationTitle(communication: Communication): string {
    const priorityPrefix = communication.priority === 'Urgent' ? '🔴 URGENT - ' :
                          communication.priority === 'High' ? '🟠 IMPORTANT - ' : '';
    
    return `${priorityPrefix}Nouvelle communication`;
  }

  /**
   * Générer le message de notification
   */
  static getNotificationMessage(communication: Communication): string {
    const source = communication.club_id 
      ? `Le club ${communication.clubs?.name}`
      : `L'association ${communication.associations?.name}`;
    
    return `${source} a publié : "${communication.title}"`;
  }

  /**
   * Obtenir le nom de l'auteur
   */
  static getAuthorName(communication: Communication): string {
    const profile = communication.profiles;
    if (!profile) return 'Utilisateur inconnu';
    
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Utilisateur';
  }

  // ============================================
  // FONCTIONS UTILITAIRES
  // ============================================

  /**
   * Recherche dans les communications
   */
  static async searchCommunications(
    query: string,
    associationId: string,
    clubId?: string,
    limit: number = 10
  ): Promise<Communication[]> {
    try {
      let supabaseQuery = supabase
        .from('communications')
        .select(`
          *,
          clubs:club_id (
            id,
            name,
            logo_url,
            slug
          ),
          associations:association_id (
            id,
            name
          ),
          profiles:author_id (
            id,
            first_name,
            last_name,
            role
          )
        `)
        .eq('association_id', associationId)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (clubId) {
        supabaseQuery = supabaseQuery.eq('club_id', clubId);
      }

      const { data, error } = await supabaseQuery;
      if (error) throw error;

      return data || [];

    } catch (error: any) {
      console.error('Error searching communications:', error);
      throw new Error(`Impossible de rechercher les communications: ${error.message}`);
    }
  }
}