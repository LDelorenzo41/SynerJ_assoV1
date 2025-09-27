// ============================================
// CONFIGURATION ET HELPERS - Système de Communications
// Fichier : src/config/communications.ts
// ============================================

import type { CommunicationPriority, CommunicationVisibility } from '../types/communication';

// ============================================
// CONSTANTES AFFICHAGE
// ============================================

/**
 * Configuration par défaut pour les communications
 */
export const COMMUNICATION_DEFAULTS = {
  priority: 'Normal' as CommunicationPriority,
  visibility: 'Public' as CommunicationVisibility,
  is_pinned: false,
  expires_in_days: 30, // Expiration par défaut à 30 jours
  image_max_size: 5 * 1024 * 1024, // 5MB max pour les images
  content_max_length: 5000, // Limite de caractères pour le contenu
  title_max_length: 200, // Limite de caractères pour le titre
} as const;

/**
 * Icônes pour chaque niveau de priorité
 */
export const PRIORITY_ICONS = {
  Low: 'Minus',
  Normal: 'Info',
  High: 'AlertTriangle',
  Urgent: 'AlertCircle',
} as const;

/**
 * Icônes pour chaque type de visibilité
 */
export const VISIBILITY_ICONS = {
  Public: 'Globe',
  Private: 'Lock',
} as const;

/**
 * Classes CSS pour les badges de priorité
 */
export const PRIORITY_BADGE_CLASSES = {
  Low: 'px-2 py-1 text-xs font-medium rounded-full text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800',
  Normal: 'px-2 py-1 text-xs font-medium rounded-full text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900',
  High: 'px-2 py-1 text-xs font-medium rounded-full text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900',
  Urgent: 'px-2 py-1 text-xs font-medium rounded-full text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900 animate-pulse',
} as const;

/**
 * Classes CSS pour les bordures de priorité
 */
export const PRIORITY_BORDER_CLASSES = {
  Low: 'border-l-4 border-gray-400',
  Normal: 'border-l-4 border-blue-400',
  High: 'border-l-4 border-orange-400',
  Urgent: 'border-l-4 border-red-400',
} as const;

/**
 * Emojis pour les priorités (pour notifications push)
 */
export const PRIORITY_EMOJIS = {
  Low: '📝',
  Normal: '📢',
  High: '⚠️',
  Urgent: '🚨',
} as const;

// ============================================
// CONSTANTES PAGINATION
// ============================================

export const COMMUNICATION_PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
  MOBILE_PAGE_SIZE: 5,
} as const;

// ============================================
// CONSTANTES FILTRES
// ============================================

export const COMMUNICATION_SORT_OPTIONS = [
  { value: 'created_at_desc', label: 'Plus récentes' },
  { value: 'created_at_asc', label: 'Plus anciennes' },
  { value: 'priority_desc', label: 'Priorité décroissante' },
  { value: 'priority_asc', label: 'Priorité croissante' },
  { value: 'title_asc', label: 'Titre A-Z' },
  { value: 'title_desc', label: 'Titre Z-A' },
] as const;

export const COMMUNICATION_FILTER_OPTIONS = {
  priority: [
    { value: 'all', label: 'Toutes les priorités' },
    { value: 'Urgent', label: 'Urgentes' },
    { value: 'High', label: 'Importantes' },
    { value: 'Normal', label: 'Normales' },
    { value: 'Low', label: 'Faibles' },
  ],
  visibility: [
    { value: 'all', label: 'Toutes les visibilités' },
    { value: 'Public', label: 'Publiques' },
    { value: 'Private', label: 'Privées' },
  ],
  status: [
    { value: 'all', label: 'Toutes' },
    { value: 'active', label: 'Actives' },
    { value: 'expired', label: 'Expirées' },
    { value: 'pinned', label: 'Épinglées' },
  ],
} as const;

// ============================================
// HELPERS PERMISSIONS
// ============================================

/**
 * Détermine les permissions d'un utilisateur pour les communications
 */
export function getCommunicationPermissions(
  userRole: 'Super Admin' | 'Club Admin' | 'Member' | 'Supporter'
) {
  const basePermissions = {
    can_create: false,
    can_edit: false,
    can_delete: false,
    can_pin: false,
    can_target_clubs: false,
    can_view_private: false,
    can_create_association: false,
    can_create_club: false,
  };

  switch (userRole) {
    case 'Super Admin':
      return {
        ...basePermissions,
        can_create: true,
        can_edit: true, // Ses propres communications
        can_delete: true, // Ses propres communications
        can_pin: true,
        can_target_clubs: true,
        can_view_private: false, // Ne voit que les publiques des clubs
        can_create_association: true,
        can_create_club: false,
      };

    case 'Club Admin':
      return {
        ...basePermissions,
        can_create: true,
        can_edit: true, // Ses propres communications
        can_delete: true, // Ses propres communications
        can_pin: true,
        can_target_clubs: false,
        can_view_private: true, // Voit les privées ciblées
        can_create_association: false,
        can_create_club: true,
      };

    case 'Member':
    case 'Supporter':
      return {
        ...basePermissions,
        can_view_private: false, // Voient que les publiques
      };

    default:
      return basePermissions;
  }
}

// ============================================
// HELPERS FORMATAGE
// ============================================

/**
 * Formate une date relative (il y a X temps)
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  
  if (seconds < 60) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  if (weeks < 4) return `Il y a ${weeks} sem.`;
  if (months < 12) return `Il y a ${months} mois`;
  
  return date.toLocaleDateString('fr-FR');
}

/**
 * Tronque le contenu d'une communication pour l'affichage en liste
 */
export function truncateContent(content: string, maxLength: number = 150): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + '...';
}

/**
 * Génère un slug pour une communication (pour les URLs)
 */
export function generateCommunicationSlug(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9\s-]/g, '') // Supprime les caractères spéciaux
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/-+/g, '-') // Supprime les tirets multiples
    .slice(0, 50); // Limite à 50 caractères
  
  return `${slug}-${id.slice(-8)}`; // Ajoute les 8 derniers caractères de l'ID
}

// ============================================
// HELPERS VALIDATION
// ============================================

/**
 * Valide les données d'un formulaire de communication
 */
export function validateCommunicationForm(data: {
  title: string;
  content: string;
  priority: CommunicationPriority;
  visibility: CommunicationVisibility;
  target_clubs?: string[];
  expires_at?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validation du titre
  if (!data.title.trim()) {
    errors.push('Le titre est obligatoire');
  } else if (data.title.length > COMMUNICATION_DEFAULTS.title_max_length) {
    errors.push(`Le titre ne peut pas dépasser ${COMMUNICATION_DEFAULTS.title_max_length} caractères`);
  }

  // Validation du contenu
  if (!data.content.trim()) {
    errors.push('Le contenu est obligatoire');
  } else if (data.content.length > COMMUNICATION_DEFAULTS.content_max_length) {
    errors.push(`Le contenu ne peut pas dépasser ${COMMUNICATION_DEFAULTS.content_max_length} caractères`);
  }

  // Validation de la visibilité privée
  if (data.visibility === 'Private' && (!data.target_clubs || data.target_clubs.length === 0)) {
    errors.push('Vous devez sélectionner au moins un club pour une communication privée');
  }

  // Validation de la date d'expiration
  if (data.expires_at) {
    const expirationDate = new Date(data.expires_at);
    const now = new Date();
    if (expirationDate <= now) {
      errors.push('La date d\'expiration doit être dans le futur');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Vérifie si une image est valide pour upload
 */
export function validateCommunicationImage(file: File): { isValid: boolean; error?: string } {
  // Vérification du type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Le fichier doit être une image' };
  }

  // Vérification de la taille
  if (file.size > COMMUNICATION_DEFAULTS.image_max_size) {
    const maxSizeMB = COMMUNICATION_DEFAULTS.image_max_size / (1024 * 1024);
    return { isValid: false, error: `L'image ne peut pas dépasser ${maxSizeMB}MB` };
  }

  // Types autorisés
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Format d\'image non supporté (JPEG, PNG, WebP, GIF uniquement)' };
  }

  return { isValid: true };
}

// ============================================
// HELPERS RECHERCHE
// ============================================

/**
 * Génère les termes de recherche pour une communication
 */
export function generateSearchTerms(communication: {
  title: string;
  content: string;
  club_name?: string;
  association_name?: string;
  author_name?: string;
}): string {
  return [
    communication.title,
    communication.content,
    communication.club_name,
    communication.association_name,
    communication.author_name
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Supprime les accents pour la recherche
}

/**
 * Filtre les communications selon une requête de recherche
 */
export function filterCommunicationsBySearch(
  communications: Array<{ title: string; content: string; searchTerms?: string }>,
  searchQuery: string
): Array<{ title: string; content: string; searchTerms?: string }> {
  if (!searchQuery.trim()) return communications;

  const query = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  return communications.filter(comm => {
    const searchableContent = comm.searchTerms || 
      `${comm.title} ${comm.content}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    return searchableContent.includes(query);
  });
}
// ============================================
// HELPERS COMMUNICATIONS SUPPLÉMENTAIRES
// AJOUTER CES FONCTIONS À LA FIN DU FICHIER src/config/communications.ts
// ============================================

import { supabase } from '../lib/supabase';
import type { Communication } from '../types/communication';

/**
 * Interface pour un club dans le sélecteur
 */
export interface ClubOption {
  id: string;
  name: string;
  logo_url?: string | null;
  member_count?: number;
}

/**
 * Récupérer la liste des clubs d'une association pour le ciblage
 */
export async function getAvailableClubsForTargeting(associationId: string): Promise<ClubOption[]> {
  try {
    const { data: clubs, error } = await supabase
      .from('clubs')
      .select(`
        id,
        name,
        logo_url
      `)
      .eq('association_id', associationId)
      .order('name');

    if (error) throw error;

    const clubOptions: ClubOption[] = await Promise.all(
      (clubs || []).map(async (club) => {
        const { count } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('club_id', club.id);

        return {
          id: club.id,
          name: club.name,
          logo_url: club.logo_url,
          member_count: count || 0
        };
      })
    );

    return clubOptions;

  } catch (error: any) {
    console.error('Error fetching clubs for targeting:', error);
    return [];
  }
}

/**
 * Récupérer les noms des clubs ciblés
 */
export async function getTargetClubNames(clubIds: string[]): Promise<Record<string, string>> {
  if (clubIds.length === 0) return {};

  try {
    const { data, error } = await supabase
      .from('clubs')
      .select('id, name')
      .in('id', clubIds);

    if (error) throw error;

    const clubNames: Record<string, string> = {};
    data?.forEach(club => {
      clubNames[club.id] = club.name;
    });

    return clubNames;

  } catch (error: any) {
    console.error('Error fetching target club names:', error);
    return {};
  }
}

/**
 * Vérifier si l'utilisateur peut créer des communications d'association
 */
export function canCreateAssociationCommunication(
  userRole: 'Super Admin' | 'Club Admin' | 'Member' | 'Supporter'
): boolean {
  return userRole === 'Super Admin';
}

/**
 * Vérifier si l'utilisateur peut créer des communications de club
 */
export function canCreateClubCommunication(
  userRole: 'Super Admin' | 'Club Admin' | 'Member' | 'Supporter',
  userClubId: string | null
): boolean {
  return userRole === 'Club Admin' && userClubId !== null;
}

/**
 * Vérifier si l'utilisateur peut modifier une communication
 */
export function canEditCommunication(
  communication: Communication,
  userId: string
): boolean {
  return communication.author_id === userId;
}

/**
 * Vérifier si l'utilisateur peut supprimer une communication
 */
export function canDeleteCommunication(
  communication: Communication,
  userId: string
): boolean {
  return communication.author_id === userId;
}

/**
 * Vérifier si l'utilisateur peut épingler une communication
 */
export function canPinCommunication(
  communication: Communication,
  userId: string,
  userRole: 'Super Admin' | 'Club Admin' | 'Member' | 'Supporter',
  userClubId: string | null
): boolean {
  switch (userRole) {
    case 'Super Admin':
      return communication.author_id === userId && communication.club_id === null;
    case 'Club Admin':
      return communication.author_id === userId && communication.club_id === userClubId;
    default:
      return false;
  }
}

/**
 * Formater les destinataires d'une communication
 */
export function formatCommunicationRecipients(
  communication: Communication,
  clubNames: Record<string, string> = {}
): string {
  if (communication.club_id) {
    const clubName = communication.clubs?.name || 'Club inconnu';
    return `Membres du club ${clubName}`;
  }

  if (communication.visibility === 'Public') {
    return 'Tous les membres de l\'association';
  }

  if (communication.visibility === 'Private' && communication.target_clubs) {
    const targetClubNames = communication.target_clubs
      .map(clubId => clubNames[clubId] || 'Club inconnu')
      .join(', ');
    
    return `Clubs sélectionnés : ${targetClubNames}`;
  }

  return 'Destinataires non définis';
}

/**
 * Obtenir l'icône de la priorité
 */
export function getPriorityIcon(priority: 'Low' | 'Normal' | 'High' | 'Urgent'): string {
  const icons = {
    Low: 'Minus',
    Normal: 'Info',
    High: 'AlertTriangle',
    Urgent: 'AlertCircle'
  };
  
  return icons[priority];
}

/**
 * Formater la date d'expiration de manière lisible
 */
export function formatExpirationStatus(expiresAt: string | null): {
  status: 'active' | 'expiring_soon' | 'expired';
  message: string;
  className: string;
} {
  if (!expiresAt) {
    return {
      status: 'active',
      message: 'Pas d\'expiration',
      className: 'text-gray-500'
    };
  }

  const expiration = new Date(expiresAt);
  const now = new Date();
  const diffMs = expiration.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    return {
      status: 'expired',
      message: 'Expirée',
      className: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
    };
  }

  if (diffDays <= 3) {
    return {
      status: 'expiring_soon',
      message: diffDays === 0 ? 'Expire aujourd\'hui' : 
               diffDays === 1 ? 'Expire demain' : 
               `Expire dans ${diffDays} jours`,
      className: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20'
    };
  }

  return {
    status: 'active',
    message: `Expire le ${expiration.toLocaleDateString('fr-FR')}`,
    className: 'text-gray-500'
  };
}

/**
 * Filtrer les communications par termes de recherche avancée
 */
export function filterCommunicationsBySearchAdvanced(
  communications: Communication[],
  searchQuery: string
): Communication[] {
  if (!searchQuery.trim()) return communications;

  const query = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  return communications.filter(comm => {
    const searchableContent = [
      comm.title,
      comm.content,
      comm.clubs?.name,
      comm.associations?.name,
      comm.profiles?.first_name,
      comm.profiles?.last_name
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return searchableContent.includes(query);
  });
}

/**
 * Trier les communications
 */
export function sortCommunications(
  communications: Communication[],
  sortBy: 'date_desc' | 'date_asc' | 'priority_desc' | 'title_asc' | 'pinned_first'
): Communication[] {
  return [...communications].sort((a, b) => {
    // Toujours prioriser les communications épinglées
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;

    switch (sortBy) {
      case 'date_desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'date_asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'priority_desc':
        const priorityOrder = { 'Urgent': 4, 'High': 3, 'Normal': 2, 'Low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'title_asc':
        return a.title.localeCompare(b.title, 'fr');
      case 'pinned_first':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });
}

/**
 * Valider une URL d'image
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    const validProtocols = ['http:', 'https:'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    return validProtocols.includes(urlObj.protocol) &&
           validExtensions.some(ext => urlObj.pathname.toLowerCase().includes(ext));
  } catch {
    return false;
  }
}

/**
 * Valider une date d'expiration
 */
export function isValidExpirationDate(dateString: string): boolean {
  if (!dateString) return true;

  const date = new Date(dateString);
  const now = new Date();
  
  return !isNaN(date.getTime()) && date > now;
}