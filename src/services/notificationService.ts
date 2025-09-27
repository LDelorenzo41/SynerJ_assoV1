// = an===========================================
// SERVICE DE NOTIFICATIONS
// Fichier : src/services/notificationService.ts
// ============================================

import { supabase } from '../lib/supabase';
import type { 
  Notification, 
  CreateNotificationInput, 
  NotificationFilters, 
  NotificationCount,
  NotificationType 
} from '../types/notifications';
// L'import de la fonction de validation est déjà présent, ce qui est parfait.
import { isValidNotificationType } from '../types/notifications';

export class NotificationService {
  
  // ============================================
  // CRÉATION DE NOTIFICATIONS
  // ============================================
  
  /**
   * Créer une nouvelle notification
   * SÉCURITÉ: Utilise les politiques RLS existantes
   */
  static async createNotification(input: CreateNotificationInput): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: input.user_id,
        type: input.type,
        title: input.title,
        message: input.message,
        metadata: input.metadata || {}
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      throw new Error(`Impossible de créer la notification: ${error.message}`);
    }

    return data;
  }

  /**
   * Créer des notifications en masse (efficace)
   * Utile pour notifier plusieurs utilisateurs d'un même événement
   */
  static async createBulkNotifications(inputs: CreateNotificationInput[]): Promise<Notification[]> {
    if (inputs.length === 0) return [];

    const { data, error } = await supabase
      .from('notifications')
      .insert(inputs.map(input => ({
        user_id: input.user_id,
        type: input.type,
        title: input.title,
        message: input.message,
        metadata: input.metadata || {}
      })))
      .select();

    if (error) {
      console.error('Error creating bulk notifications:', error);
      throw new Error(`Impossible de créer les notifications: ${error.message}`);
    }

    return data || [];
  }

  // ============================================
  // LECTURE DES NOTIFICATIONS
  // ============================================
  
  /**
   * Récupérer les notifications d'un utilisateur
   * SÉCURITÉ: RLS garantit qu'on ne voit que ses propres notifications
   */
  static async getUserNotifications(
    userId: string, 
    filters: NotificationFilters = {}
  ): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    // Filtres optionnels
    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (typeof filters.is_read === 'boolean') {
      query = query.eq('is_read', filters.is_read);
    }

    // Pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    // Tri par date (plus récentes en premier)
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      throw new Error(`Impossible de récupérer les notifications: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Compter les notifications non lues
   * Utilise la fonction PostgreSQL optimisée
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const { data, error } = await supabase.rpc('count_unread_notifications', {
      user_uuid: userId
    });

    if (error) {
      console.error('Error counting unread notifications:', error);
      return 0;
    }

    return data || 0;
  }

  /**
   * Compter les notifications par type (VERSION MISE À JOUR)
   * Utile pour les badges spécifiques
   */
  static async getNotificationCounts(userId: string): Promise<NotificationCount> {
    const { data, error } = await supabase
      .from('notifications')
      .select('type, is_read')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching notification counts:', error);
      return { total: 0, by_type: {} };
    }

    const counts: NotificationCount = {
      total: 0,
      by_type: {
        nouveau_club: 0,
        nouvel_event: 0,
        demande_materiel: 0,
        reponse_materiel: 0,
        nouvelle_communication: 0
      }
    };

    data?.forEach(notification => {
      if (!notification.is_read && isValidNotificationType(notification.type)) {
        counts.total++;
        counts.by_type[notification.type] = (counts.by_type[notification.type] || 0) + 1;
      }
    });

    return counts;
  }

  // ============================================
  // MISE À JOUR DES NOTIFICATIONS
  // ============================================
  
  /**
   * Marquer une notification comme lue
   */
  static async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw new Error(`Impossible de marquer la notification comme lue: ${error.message}`);
    }
  }

  /**
   * Marquer toutes les notifications d'un type comme lues
   * Utilise la fonction PostgreSQL optimisée
   */
  static async markAllAsReadByType(userId: string, type: NotificationType): Promise<void> {
    const { error } = await supabase.rpc('mark_notifications_read_by_type', {
      user_uuid: userId,
      notification_type: type
    });

    if (error) {
      console.error('Error marking notifications as read by type:', error);
      throw new Error(`Impossible de marquer les notifications comme lues: ${error.message}`);
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  static async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error(`Impossible de marquer toutes les notifications comme lues: ${error.message}`);
    }
  }

  // ============================================
  // SUPPRESSION DES NOTIFICATIONS
  // ============================================
  
  /**
   * Supprimer une notification
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      throw new Error(`Impossible de supprimer la notification: ${error.message}`);
    }
  }

  /**
   * Supprimer les anciennes notifications (nettoyage)
   * Supprime les notifications lues de plus de 30 jours
   */
  static async deleteOldNotifications(userId: string, daysBefore: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBefore);

    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('is_read', true)
      .lt('created_at', cutoffDate.toISOString())
      .select('id');

    if (error) {
      console.error('Error deleting old notifications:', error);
      throw new Error(`Impossible de supprimer les anciennes notifications: ${error.message}`);
    }

    return data?.length || 0;
  }
  
  // ============================================
  // MÉTHODES AJOUTÉES
  // ============================================

  /**
   * Supprimer toutes les notifications d'un type pour un utilisateur
   */
  static async deleteNotificationsByType(userId: string, type: NotificationType): Promise<number> {
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('type', type)
      .eq('is_read', false) // Note: La consigne indique `is_read`, mais logiquement on supprime aussi les lues. A adapter si besoin.
      .select('id');

    if (error) {
      console.error('Error deleting notifications by type:', error);
      throw new Error(`Impossible de supprimer les notifications: ${error.message}`);
    }

    return data?.length || 0;
  }

  /**
   * Nettoyer les notifications d'un événement supprimé
   */
  static async cleanupEventNotifications(eventId: string): Promise<number> {
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('type', 'nouvel_event')
      .eq('metadata->>event_id', eventId)
      .select('id');

    if (error) {
      console.error('Error cleaning up event notifications:', error);
      return 0; // Retourne 0 en cas d'erreur pour ne pas bloquer le flux
    }

    return data?.length || 0;
  }

  // ============================================
  // MÉTHODES SPÉCIFIQUES AUX COMMUNICATIONS
  // ============================================

  /**
   * Nettoyer les notifications d'une communication supprimée
   */
  static async deleteCommunicationNotifications(communicationId: string): Promise<number> {
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('type', 'nouvelle_communication')
      .eq('metadata->>communication_id', communicationId)
      .select('id');

    if (error) {
      console.error('Error cleaning up communication notifications:', error);
      return 0;
    }

    return data?.length || 0;
  }

  /**
   * Marquer toutes les notifications de communication comme lues
   */
  static async markAllCommunicationNotificationsRead(userId: string): Promise<void> {
    await this.markAllAsReadByType(userId, 'nouvelle_communication');
  }

  /**
   * Récupérer les notifications de communication pour un utilisateur
   */
  static async getCommunicationNotifications(
    userId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'nouvelle_communication')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching communication notifications:', error);
        throw new Error(`Impossible de récupérer les notifications: ${error.message}`);
      }

      return data || [];
    } catch (error: any) {
      console.error('Error in getCommunicationNotifications:', error);
      throw error;
    }
  }

  /**
   * Compter les notifications de communication non lues
   */
  static async getUnreadCommunicationNotificationsCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type', 'nouvelle_communication')
        .eq('is_read', false);

      if (error) {
        console.error('Error counting unread communication notifications:', error);
        return 0;
      }

      return count || 0;
    } catch (error: any) {
      console.error('Error in getUnreadCommunicationNotificationsCount:', error);
      return 0;
    }
  }

  /**
   * Marquer une notification de communication spécifique comme lue
   */
  static async markCommunicationNotificationRead(
    userId: string, 
    communicationId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('type', 'nouvelle_communication')
        .contains('metadata', { communication_id: communicationId });

      if (error) {
        console.error('Error marking communication notification as read:', error);
        throw new Error(`Impossible de marquer la notification comme lue: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error in markCommunicationNotificationRead:', error);
      throw error;
    }
  }

  /**
   * Créer des notifications de communication en masse (optimisée)
   */
  static async createBulkCommunicationNotifications(
    userIds: string[],
    communicationId: string,
    communicationTitle: string,
    communicationPriority: 'Low' | 'Normal' | 'High' | 'Urgent',
    isAssociationCommunication: boolean,
    sourceName: string,
    authorName: string
  ): Promise<Notification[]> {
    const priorityPrefix = communicationPriority === 'Urgent' ? '🔴 URGENT - ' :
                          communicationPriority === 'High' ? '🟠 IMPORTANT - ' : '';
    
    const sourceType = isAssociationCommunication ? 'L\'association' : 'Le club';
    const title = `${priorityPrefix}Nouvelle communication`;
    const message = `${sourceType} ${sourceName} a publié : "${communicationTitle}"`;

    const notifications = userIds.map(userId => ({
      user_id: userId,
      type: 'nouvelle_communication' as const,
      title,
      message,
      metadata: {
        communication_id: communicationId,
        communication_title: communicationTitle,
        communication_priority: communicationPriority,
        communication_author: authorName,
        is_association_communication: isAssociationCommunication,
        source_name: sourceName
      }
    }));

    return await this.createBulkNotifications(notifications);
  }

  // ============================================
  // MÉTHODES UTILITAIRES POUR LES CRÉATEURS
  // ============================================

  /**
   * Créer une notification "nouveau club"
   */
  static async notifyNewClub(
    superAdminId: string, 
    clubName: string, 
    clubId: string,
    associationId: string
  ): Promise<void> {
    await this.createNotification({
      user_id: superAdminId,
      type: 'nouveau_club',
      title: 'Nouveau club créé',
      message: `Le club "${clubName}" vient d'être créé dans votre association.`,
      metadata: {
        club_id: clubId,
        club_name: clubName,
        association_id: associationId
      }
    });
  }

  /**
   * Créer une notification "nouvel événement"
   */
  static async notifyNewEvent(
    userIds: string[], 
    eventName: string, 
    eventId: string,
    eventDate: string,
    clubName: string
  ): Promise<void> {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      type: 'nouvel_event' as NotificationType,
      title: 'Nouvel événement',
      message: `"${eventName}" organisé par ${clubName}`,
      metadata: {
        event_id: eventId,
        event_name: eventName,
        event_date: eventDate,
        club_name: clubName
      }
    }));

    await this.createBulkNotifications(notifications);
  }

  /**
   * Créer une notification "demande matériel"
   */
  static async notifyMaterialRequest(
    superAdminId: string,
    requestId: string,
    clubName: string,
    requesterName: string,
    eventName: string
  ): Promise<void> {
    await this.createNotification({
      user_id: superAdminId,
      type: 'demande_materiel',
      title: 'Nouvelle demande de matériel',
      message: `${clubName} demande du matériel pour "${eventName}"`,
      metadata: {
        request_id: requestId,
        club_name: clubName,
        requester_name: requesterName,
        request_event_name: eventName
      }
    });
  }

  /**
   * Créer une notification "réponse matériel"
   */
  static async notifyMaterialResponse(
    clubAdminId: string,
    requestId: string,
    status: 'approved' | 'rejected' | 'partially_approved',
    eventName: string,
    adminNotes?: string
  ): Promise<void> {
    const statusMessages = {
      approved: 'approuvée',
      rejected: 'refusée',
      partially_approved: 'partiellement approuvée'
    };

    await this.createNotification({
      user_id: clubAdminId,
      type: 'reponse_materiel',
      title: `Demande de matériel ${statusMessages[status]}`,
      message: `Votre demande pour "${eventName}" a été ${statusMessages[status]}.`,
      metadata: {
        request_id: requestId,
        status: status,
        response_event_name: eventName,
        admin_notes: adminNotes
      }
    });
  }

  /**
   * Créer une notification "nouvelle communication"
   */
  static async notifyNewCommunication(
    userIds: string[], 
    communicationTitle: string, 
    communicationId: string,
    priority: 'Low' | 'Normal' | 'High' | 'Urgent',
    visibility: 'Public' | 'Private',
    authorName: string,
    isAssociationCommunication: boolean,
    sourceName: string
  ): Promise<void> {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      type: 'nouvelle_communication' as NotificationType,
      title: 'Nouvelle communication',
      message: `${sourceName}: ${communicationTitle}${priority === 'Urgent' ? ' (URGENT)' : priority === 'High' ? ' (IMPORTANT)' : ''}`,
      metadata: {
        communication_id: communicationId,
        communication_title: communicationTitle,
        communication_priority: priority,
        communication_visibility: visibility,
        communication_author: authorName,
        is_association_communication: isAssociationCommunication,
        source_name: sourceName
      }
    }));

    await this.createBulkNotifications(notifications);
  }
}