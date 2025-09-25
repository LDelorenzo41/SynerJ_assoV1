// ============================================
// HOOK REACT - NOTIFICATIONS
// Fichier : src/hooks/useNotifications.ts
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '../services/notificationService';
import { useAuthNew } from './useAuthNew';
import type { 
  Notification, 
  NotificationCount, 
  NotificationFilters,
  NotificationType 
} from '../types/notifications';

interface UseNotificationsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // en millisecondes
  initialFilters?: NotificationFilters;
}

interface UseNotificationsReturn {
  // Données
  notifications: Notification[];
  unreadCount: number;
  notificationCounts: NotificationCount;
  
  // États
  loading: boolean;
  error: string | null;
  
  // Actions
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markAllAsReadByType: (type: NotificationType) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearError: () => void;
  
  // Filtres
  filters: NotificationFilters;
  setFilters: (filters: NotificationFilters) => void;
}

/**
 * Hook principal pour gérer les notifications
 * S'intègre automatiquement avec le système d'auth existant
 */
export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const { profile } = useAuthNew();
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 secondes par défaut
    initialFilters = {}
  } = options;

  // États locaux
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationCounts, setNotificationCounts] = useState<NotificationCount>({
    total: 0,
    by_type: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<NotificationFilters>(initialFilters);

  // Fonction de chargement des données
  const loadNotifications = useCallback(async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Charger en parallèle pour optimiser
      const [notificationsData, unreadCountData, countsData] = await Promise.all([
        NotificationService.getUserNotifications(profile.id, filters),
        NotificationService.getUnreadCount(profile.id),
        NotificationService.getNotificationCounts(profile.id)
      ]);

      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
      setNotificationCounts(countsData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des notifications');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?.id, filters]);

  // Charger les notifications au montage et quand les dépendances changent
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Auto-refresh optionnel
  useEffect(() => {
    if (!autoRefresh || !profile?.id) return;

    const interval = setInterval(loadNotifications, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadNotifications, profile?.id]);

  // Actions
  const refresh = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!profile?.id) return;

    try {
      await NotificationService.markAsRead(notificationId);
      
      // Mise à jour optimiste de l'état local
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true, updated_at: new Date().toISOString() }
            : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Recalculer les comptes par type
      const targetNotification = notifications.find(n => n.id === notificationId);
      if (targetNotification && !targetNotification.is_read) {
        setNotificationCounts(prev => ({
          ...prev,
          total: prev.total - 1,
          by_type: {
            ...prev.by_type,
            [targetNotification.type]: Math.max(0, (prev.by_type[targetNotification.type] || 0) - 1)
          }
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du marquage comme lu');
      console.error('Error marking notification as read:', err);
    }
  }, [profile?.id, notifications]);

  const markAllAsRead = useCallback(async () => {
    if (!profile?.id) return;

    try {
      await NotificationService.markAllAsRead(profile.id);
      
      // Mise à jour optimiste
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          is_read: true, 
          updated_at: new Date().toISOString() 
        }))
      );
      setUnreadCount(0);
      setNotificationCounts(prev => ({ 
        ...prev, 
        total: 0, 
        by_type: {} 
      }));
    } catch (err: any) {
      setError(err.message || 'Erreur lors du marquage global comme lu');
      console.error('Error marking all notifications as read:', err);
    }
  }, [profile?.id]);

  const markAllAsReadByType = useCallback(async (type: NotificationType) => {
    if (!profile?.id) return;

    try {
      await NotificationService.markAllAsReadByType(profile.id, type);
      
      // Mise à jour optimiste
      setNotifications(prev => 
        prev.map(notif => 
          notif.type === type 
            ? { ...notif, is_read: true, updated_at: new Date().toISOString() }
            : notif
        )
      );
      
      const typeCount = notificationCounts.by_type[type] || 0;
      setUnreadCount(prev => Math.max(0, prev - typeCount));
      setNotificationCounts(prev => ({
        ...prev,
        total: prev.total - typeCount,
        by_type: { ...prev.by_type, [type]: 0 }
      }));
    } catch (err: any) {
      setError(err.message || 'Erreur lors du marquage par type comme lu');
      console.error('Error marking notifications as read by type:', err);
    }
  }, [profile?.id, notificationCounts]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!profile?.id) return;

    try {
      await NotificationService.deleteNotification(notificationId);
      
      // Mise à jour optimiste
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotificationCounts(prev => ({
          ...prev,
          total: prev.total - 1,
          by_type: {
            ...prev.by_type,
            [deletedNotification.type]: Math.max(0, (prev.by_type[deletedNotification.type] || 0) - 1)
          }
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
      console.error('Error deleting notification:', err);
    }
  }, [profile?.id, notifications]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Données
    notifications,
    unreadCount,
    notificationCounts,
    
    // États
    loading,
    error,
    
    // Actions
    refresh,
    markAsRead,
    markAllAsRead,
    markAllAsReadByType,
    deleteNotification,
    clearError,
    
    // Filtres
    filters,
    setFilters
  };
}

// ============================================
// HOOK SPÉCIALISÉ POUR LES BADGES
// ============================================

interface UseNotificationBadgesReturn {
  // Badges par type (pour la sidebar)
  badges: {
    nouveau_club: number;
    nouvel_event: number;
    demande_materiel: number;
    reponse_materiel: number;
  };
  totalUnread: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markTypeAsRead: (type: NotificationType) => Promise<void>;
}

/**
 * Hook simplifié spécialement pour les badges dans la sidebar
 * Plus léger et optimisé pour l'affichage des compteurs uniquement
 */
export function useNotificationBadges(): UseNotificationBadgesReturn {
  const { profile } = useAuthNew();
  const [badges, setBadges] = useState({
    nouveau_club: 0,
    nouvel_event: 0,
    demande_materiel: 0,
    reponse_materiel: 0
  });
  const [totalUnread, setTotalUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadBadges = useCallback(async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      const counts = await NotificationService.getNotificationCounts(profile.id);
      
      setBadges({
        nouveau_club: counts.by_type.nouveau_club || 0,
        nouvel_event: counts.by_type.nouvel_event || 0,
        demande_materiel: counts.by_type.demande_materiel || 0,
        reponse_materiel: counts.by_type.reponse_materiel || 0
      });
      
      setTotalUnread(counts.total);
    } catch (err) {
      console.error('Error loading notification badges:', err);
      // En cas d'erreur, réinitialiser les badges
      setBadges({
        nouveau_club: 0,
        nouvel_event: 0,
        demande_materiel: 0,
        reponse_materiel: 0
      });
      setTotalUnread(0);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadBadges();
    
    // Auto-refresh toutes les 60 secondes pour les badges
    const interval = setInterval(loadBadges, 60000);
    return () => clearInterval(interval);
  }, [loadBadges]);

  const markTypeAsRead = useCallback(async (type: NotificationType) => {
    if (!profile?.id) return;
    
    try {
      await NotificationService.markAllAsReadByType(profile.id, type);
      
      // Mise à jour optimiste
      setBadges(prev => ({ ...prev, [type]: 0 }));
      setTotalUnread(prev => Math.max(0, prev - badges[type]));
    } catch (err) {
      console.error('Error marking type as read:', err);
    }
  }, [profile?.id, badges]);

  return {
    badges,
    totalUnread,
    loading,
    refresh: loadBadges,
    markTypeAsRead
  };
}