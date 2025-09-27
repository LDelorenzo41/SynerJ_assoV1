// ============================================
// TYPES TYPESCRIPT - Système de Communications
// Fichier : // ============================================
// TYPES TYPESCRIPT - Système de Communications
// Fichier : src/types/communication.ts
// ============================================
// ============================================

// ============================================
// INTERFACE PRINCIPALE COMMUNICATION
// ============================================

export interface Communication {
  id: string;
  title: string;
  content: string;
  visibility: 'Public' | 'Private';
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  club_id: string | null;
  association_id: string;
  author_id: string;
  target_clubs: string[] | null; // Array d'IDs clubs pour communications privées
  image_url: string | null;
  expires_at: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  // Relations populées par les requêtes
  clubs?: {
    id: string;
    name: string;
    logo_url?: string | null;
    slug?: string;
  };
  associations?: {
    id: string;
    name: string;
  };
  profiles?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    role: 'Super Admin' | 'Club Admin' | 'Member' | 'Supporter';
  };
}

// ============================================
// INTERFACE FORMULAIRE COMMUNICATION
// ============================================

export interface CommunicationForm {
  title: string;
  content: string;
  visibility: 'Public' | 'Private';
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  target_clubs: string[]; // IDs des clubs ciblés (pour communications privées d'association)
  image_url: string;
  expires_at: string; // Format datetime-local
  is_pinned: boolean;
}

// ============================================
// INTERFACE CRÉATION COMMUNICATION
// ============================================

export interface CreateCommunicationInput {
  title: string;
  content: string;
  visibility: 'Public' | 'Private';
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  club_id?: string | null; // null = communication d'association
  association_id: string;
  author_id: string;
  target_clubs?: string[] | null;
  image_url?: string | null;
  expires_at?: string | null;
  is_pinned?: boolean;
}

// ============================================
// INTERFACE MISE À JOUR COMMUNICATION
// ============================================

export interface UpdateCommunicationInput {
  title?: string;
  content?: string;
  visibility?: 'Public' | 'Private';
  priority?: 'Low' | 'Normal' | 'High' | 'Urgent';
  target_clubs?: string[] | null;
  image_url?: string | null;
  expires_at?: string | null;
  is_pinned?: boolean;
}

// ============================================
// TYPES POUR LES FILTRES
// ============================================

export interface CommunicationFilters {
  club_id?: string;
  association_id?: string;
  visibility?: 'Public' | 'Private';
  priority?: 'Low' | 'Normal' | 'High' | 'Urgent';
  author_id?: string;
  is_pinned?: boolean;
  is_expired?: boolean;
  limit?: number;
  offset?: number;
}

// ============================================
// TYPES POUR LA GESTION DES PRIORITÉS
// ============================================

export type CommunicationPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export const COMMUNICATION_PRIORITY_LABELS: Record<CommunicationPriority, string> = {
  Low: 'Faible',
  Normal: 'Normal',
  High: 'Importante',
  Urgent: 'Urgente'
};

export const COMMUNICATION_PRIORITY_COLORS: Record<CommunicationPriority, string> = {
  Low: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800',
  Normal: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900',
  High: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900',
  Urgent: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900'
};

// ============================================
// TYPES POUR LA VISIBILITÉ
// ============================================

export type CommunicationVisibility = 'Public' | 'Private';

export const COMMUNICATION_VISIBILITY_LABELS: Record<CommunicationVisibility, string> = {
  Public: 'Publique',
  Private: 'Privée'
};

export const COMMUNICATION_VISIBILITY_DESCRIPTIONS: Record<CommunicationVisibility, string> = {
  Public: 'Visible par tous les membres autorisés',
  Private: 'Visible uniquement par les clubs sélectionnés'
};

// ============================================
// INTERFACE POUR LES STATISTIQUES
// ============================================

export interface CommunicationStats {
  total: number;
  by_priority: Record<CommunicationPriority, number>;
  by_visibility: Record<CommunicationVisibility, number>;
  by_club: Record<string, number>; // club_id -> count
  pinned_count: number;
  expired_count: number;
  this_week: number;
  this_month: number;
}

// ============================================
// TYPES POUR LES ACTIONS BULK
// ============================================

export interface BulkCommunicationAction {
  action: 'delete' | 'pin' | 'unpin' | 'archive' | 'change_priority';
  communication_ids: string[];
  new_priority?: CommunicationPriority;
}

// ============================================
// INTERFACE POUR LES RÉSULTATS PAGINÉS
// ============================================

export interface PaginatedCommunications {
  data: Communication[];
  count: number;
  has_more: boolean;
  page: number;
  per_page: number;
}

// ============================================
// TYPES POUR LES PERMISSIONS
// ============================================

export interface CommunicationPermissions {
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_pin: boolean;
  can_target_clubs: boolean; // Pour les Super Admins
  can_view_private: boolean;
}

// ============================================
// HELPER FUNCTIONS TYPES
// ============================================

/**
 * Type guard pour vérifier si une communication est expirée
 */
export function isCommunicationExpired(communication: Communication): boolean {
  if (!communication.expires_at) return false;
  return new Date(communication.expires_at) < new Date();
}

/**
 * Type guard pour vérifier si l'utilisateur peut voir une communication
 */
export function canViewCommunication(
  communication: Communication,
  userRole: 'Super Admin' | 'Club Admin' | 'Member' | 'Supporter',
  userId: string,
  userClubId: string | null,
  userAssociationId: string | null,
  followedClubIds: string[] = []
): boolean {
  // Vérification de base - user doit appartenir à la même association
  if (!userAssociationId || communication.association_id !== userAssociationId) {
    return false;
  }

  // Logique de vérification des permissions basée sur les politiques RLS
  switch (userRole) {
    case 'Super Admin':
      // Peut voir ses propres communications + communications publiques des clubs de son association
      return communication.author_id === userId || 
             (communication.club_id !== null && communication.visibility === 'Public');
    
    case 'Club Admin':
      // Peut voir son club + communications publiques/privées ciblées de l'association
      if (communication.club_id === userClubId) {
        return true;
      }
      if (communication.club_id === null && communication.visibility === 'Public') {
        return true;
      }
      if (communication.club_id === null && 
          communication.visibility === 'Private' && 
          userClubId && 
          communication.target_clubs?.includes(userClubId)) {
        return true;
      }
      return false;
    
    case 'Member':
      // Peut voir son club + communications publiques des clubs suivis + publiques association
      if (communication.club_id === userClubId) {
        return true;
      }
      if (communication.club_id && 
          followedClubIds.includes(communication.club_id) && 
          communication.visibility === 'Public') {
        return true;
      }
      if (communication.club_id === null && communication.visibility === 'Public') {
        return true;
      }
      return false;
    
    case 'Supporter':
      // Peut voir communications publiques association + clubs suivis
      if (communication.club_id && 
          followedClubIds.includes(communication.club_id) && 
          communication.visibility === 'Public') {
        return true;
      }
      if (communication.club_id === null && communication.visibility === 'Public') {
        return true;
      }
      return false;
    
    default:
      return false;
  }
}

/**
 * Obtenir le libellé de priorité avec couleur
 */
export function getPriorityDisplay(priority: CommunicationPriority): {
  label: string;
  className: string;
} {
  return {
    label: COMMUNICATION_PRIORITY_LABELS[priority],
    className: COMMUNICATION_PRIORITY_COLORS[priority]
  };
}

/**
 * Formater la date d'expiration
 */
export function formatExpirationDate(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  
  const expiration = new Date(expiresAt);
  const now = new Date();
  const diffMs = expiration.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Expirée';
  if (diffDays === 0) return 'Expire aujourd\'hui';
  if (diffDays === 1) return 'Expire demain';
  if (diffDays <= 7) return `Expire dans ${diffDays} jours`;
  
  return expiration.toLocaleDateString('fr-FR');
}