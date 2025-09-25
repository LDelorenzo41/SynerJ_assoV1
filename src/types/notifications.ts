// ============================================
// TYPES TYPESCRIPT - Système de Notifications
// Fichier : src/types/notifications.ts
// SANS MODIFICATION des types Supabase existants
// ============================================

export type NotificationType = 
  | 'nouveau_club'      // Super Admin : nouveau club créé
  | 'nouvel_event'      // Members/Supporters : nouvel événement d'un club suivi
  | 'demande_materiel'  // Super Admin : nouvelle demande de matériel
  | 'reponse_materiel'; // Club Admin : réponse à une demande de matériel

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  metadata: NotificationMetadata;
  created_at: string;
  updated_at: string;
}

// Métadonnées spécifiques par type de notification
export type NotificationMetadata = {
  // Pour nouveau_club
  club_id?: string;
  club_name?: string;
  association_id?: string;
  
  // Pour nouvel_event
  event_id?: string;
  event_name?: string;
  event_date?: string;
  
  // Pour demande_materiel
  request_id?: string;
  requester_name?: string;
  request_event_name?: string;  // Renommé pour éviter le conflit
  
  // Pour reponse_materiel
  status?: 'approved' | 'rejected' | 'partially_approved';
  admin_notes?: string;
  response_event_name?: string; // Ajouté pour les réponses
  
  // Champs communs
  [key: string]: any;
};

// Interface pour créer une notification
export interface CreateNotificationInput {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: NotificationMetadata;
}

// Interface pour la réponse de comptage
export interface NotificationCount {
  total: number;
  by_type: Partial<Record<NotificationType, number>>; // Retour au type flexible
}

// Interface pour les paramètres de requête
export interface NotificationFilters {
  type?: NotificationType;
  is_read?: boolean;
  limit?: number;
  offset?: number;
}

// Interface pour les badges de notification dans l'UI
export interface NotificationBadge {
  count: number;
  hasNew: boolean;
  lastCheck?: string;
}

// Types pour les actions de notification
export type NotificationAction = 
  | { type: 'mark_read'; id: string }
  | { type: 'mark_all_read'; notification_type?: NotificationType }
  | { type: 'delete'; id: string }
  | { type: 'bulk_delete'; ids: string[] };

// Interface pour les préférences utilisateur (futur)
export interface NotificationPreferences {
  user_id: string;
  nouveau_club: boolean;
  nouvel_event: boolean;
  demande_materiel: boolean;
  reponse_materiel: boolean;
  email_notifications: boolean;
}

// Types d'erreur spécifiques
export class NotificationError extends Error {
  constructor(
    message: string,
    public code: 'PERMISSION_DENIED' | 'NOT_FOUND' | 'INVALID_TYPE' | 'DATABASE_ERROR'
  ) {
    super(message);
    this.name = 'NotificationError';
  }
}

// ============================================
// HELPERS DE VALIDATION
// ============================================

export function isValidNotificationType(type: string): type is NotificationType {
  return ['nouveau_club', 'nouvel_event', 'demande_materiel', 'reponse_materiel'].includes(type);
}

export function validateNotificationInput(input: CreateNotificationInput): boolean {
  return !!(
    input.user_id &&
    input.title &&
    input.message &&
    isValidNotificationType(input.type)
  );
}

// ============================================
// MAPPING POUR L'INTERFACE UTILISATEUR
// ============================================

export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  nouveau_club: 'Nouveaux clubs',
  nouvel_event: 'Nouveaux événements',
  demande_materiel: 'Demandes de matériel',
  reponse_materiel: 'Réponses aux demandes'
};

export const NOTIFICATION_COLORS: Record<NotificationType, 'red' | 'blue' | 'green' | 'orange'> = {
  nouveau_club: 'blue',
  nouvel_event: 'green', 
  demande_materiel: 'orange',
  reponse_materiel: 'red'
};

// ============================================
// HELPERS POUR NAVIGATION ITEMS
// ============================================

/**
 * Mappe les types de notifications vers les pages correspondantes
 * Utilisé pour savoir quel badge afficher sur quelle page
 */
export const NOTIFICATION_TO_PAGE_MAP: Record<NotificationType, string[]> = {
  nouveau_club: ['/clubs', '/dashboard'],
  nouvel_event: ['/events', '/dashboard'],
  demande_materiel: ['/equipment-management'],
  reponse_materiel: ['/equipment-reservation']
};

/**
 * Détermine si une notification doit être affichée sur une page donnée
 */
export function shouldShowNotificationOnPage(notificationType: NotificationType, currentPath: string): boolean {
  const relevantPages = NOTIFICATION_TO_PAGE_MAP[notificationType];
  return relevantPages.some(page => currentPath.startsWith(page));
}

/**
 * Obtient le badge approprié pour un item de navigation
 */
export function getBadgeForNavigationItem(
  itemPath: string, 
  notificationCounts: NotificationCount
): number {
  let totalBadgeCount = 0;

  // Parcourir tous les types de notifications
  Object.entries(NOTIFICATION_TO_PAGE_MAP).forEach(([type, pages]) => {
    if (pages.some(page => itemPath.startsWith(page))) {
      const count = notificationCounts.by_type[type as NotificationType] || 0;
      totalBadgeCount += count;
    }
  });

  return totalBadgeCount;
}

// ============================================
// HELPER SÛRE POUR INDEXATION
// ============================================

/**
 * Helper sûre pour incrémenter un compteur de notification
 */
export function incrementNotificationCount(
  counts: NotificationCount, 
  type: NotificationType
): void {
  counts.by_type[type] = (counts.by_type[type] || 0) + 1;
}