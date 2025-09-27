// ============================================
// TYPES TYPESCRIPT - Système de Notifications
// Fichier : src/types/notifications.ts
// SANS MODIFICATION des types Supabase existants
// ============================================

export type NotificationType =
  | 'nouveau_club'         // Super Admin : nouveau club créé
  | 'nouvel_event'         // Members/Supporters : nouvel événement d'un club suivi
  | 'demande_materiel'     // Super Admin : nouvelle demande de matériel
  | 'reponse_materiel'     // Club Admin : réponse à une demande de matériel
  | 'nouvelle_communication'; // NOUVEAU : nouvelle communication

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
  request_event_name?: string;
  
  // Pour reponse_materiel
  status?: 'approved' | 'rejected' | 'partially_approved';
  admin_notes?: string;
  response_event_name?: string;
  
  // NOUVEAU : Pour nouvelle_communication
  communication_id?: string;
  communication_title?: string;
  communication_priority?: 'Low' | 'Normal' | 'High' | 'Urgent';
  communication_visibility?: 'Public' | 'Private';
  communication_author?: string;
  is_association_communication?: boolean; // true si communication d'association
  source_name?: string; // Nom du club ou association
  
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
  by_type: Partial<Record<NotificationType, number>>;
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

export function isValidNotificationType(type: any): type is NotificationType {
  return [
    'nouveau_club',
    'nouvel_event', 
    'demande_materiel',
    'reponse_materiel',
    'nouvelle_communication' // NOUVEAU
  ].includes(type);
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
  reponse_materiel: 'Réponses aux demandes',
  nouvelle_communication: 'Nouvelles communications' // NOUVEAU
};

export const NOTIFICATION_COLORS: Record<NotificationType, 'red' | 'blue' | 'green' | 'orange' | 'purple'> = {
  nouveau_club: 'blue',
  nouvel_event: 'green', 
  demande_materiel: 'orange',
  reponse_materiel: 'red',
  nouvelle_communication: 'purple' // NOUVEAU
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
  reponse_materiel: ['/equipment-reservation'],
  nouvelle_communication: ['/communications', '/dashboard'] // NOUVEAU
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

// ============================================
// NOUVELLES FONCTIONS HELPER
// ============================================

/**
 * Obtenir l'icône appropriée pour chaque type de notification
 */
export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'nouveau_club':
      return 'Building';
    case 'nouvel_event':
      return 'Calendar';
    case 'demande_materiel':
      return 'Package';
    case 'reponse_materiel':
      return 'CheckCircle';
    case 'nouvelle_communication':
      return 'MessageSquare'; // NOUVEAU
    default:
      return 'Bell';
  }
}

/**
 * Obtenir la couleur du badge pour chaque type
 */
export function getNotificationBadgeColor(type: NotificationType): string {
  const colors = {
    nouveau_club: 'bg-blue-500',
    nouvel_event: 'bg-green-500',
    demande_materiel: 'bg-orange-500',
    reponse_materiel: 'bg-red-500',
    nouvelle_communication: 'bg-purple-500' // NOUVEAU
  };
  
  return colors[type] || 'bg-gray-500';
}

/**
 * Obtenir le message de notification formaté
 */
export function formatNotificationMessage(
  type: NotificationType,
  metadata: NotificationMetadata
): string {
  switch (type) {
    case 'nouvelle_communication':
      const priority = metadata.communication_priority === 'Urgent' ? ' (URGENT)' :
                      metadata.communication_priority === 'High' ? ' (IMPORTANT)' : '';
      const source = metadata.is_association_communication ? 'Association' : metadata.source_name;
      return `${source} : ${metadata.communication_title}${priority}`;
    
    case 'nouvel_event':
      return `Nouvel événement : ${metadata.event_name}`;
    
    case 'nouveau_club':
      return `Nouveau club : ${metadata.club_name}`;
    
    case 'demande_materiel':
      return `Demande de matériel pour : ${metadata.request_event_name}`;
    
    case 'reponse_materiel':
      const status = metadata.status === 'approved' ? 'approuvée' :
                    metadata.status === 'rejected' ? 'refusée' : 'partiellement approuvée';
      return `Demande ${status} : ${metadata.response_event_name}`;
    
    default:
      return 'Nouvelle notification';
  }
}