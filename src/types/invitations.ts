// ============================================================
// TYPES POUR LES INVITATIONS DE MEMBRES
// ============================================================

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export type InvitationRole = 'Member' | 'Club Admin';

// ============================================================
// INVITATION PAR EMAIL
// ============================================================

export interface ClubInvitation {
  id: string;
  club_id: string;
  invited_by: string;
  email: string;
  role: InvitationRole;
  personal_message?: string;
  token: string;
  status: InvitationStatus;
  expires_at: string;
  accepted_at?: string;
  accepted_by?: string;
  created_at: string;
  updated_at: string;
}

// Vue avec détails enrichis
export interface ClubInvitationWithDetails extends ClubInvitation {
  club_name: string;
  invited_by_name: string;
  status_display: string;
}

// Données pour créer une nouvelle invitation par email
export interface CreateEmailInvitationData {
  club_id: string;
  emails: string[]; // Plusieurs emails à la fois
  role: InvitationRole;
  personal_message?: string;
}

// ============================================================
// LIEN D'INVITATION PARTAGÉ
// ============================================================

export interface ClubInvitationLink {
  id: string;
  club_id: string;
  created_by: string;
  code: string;
  default_role: InvitationRole;
  max_uses?: number; // null = illimité
  current_uses: number;
  is_active: boolean;
  expires_at?: string; // null = pas d'expiration
  created_at: string;
  updated_at: string;
}

// Vue avec détails enrichis
export interface ClubInvitationLinkWithDetails extends ClubInvitationLink {
  club_name: string;
  creator_name: string;
  uses_count: number;
}

// Données pour créer un nouveau lien d'invitation
export interface CreateInvitationLinkData {
  club_id: string;
  default_role: InvitationRole;
  max_uses?: number; // undefined = illimité
  expires_at?: string; // undefined = pas d'expiration
}

// ============================================================
// UTILISATION DE LIEN D'INVITATION
// ============================================================

export interface ClubInvitationLinkUse {
  id: string;
  invitation_link_id: string;
  user_id: string;
  used_at: string;
}

// ============================================================
// STATISTIQUES D'INVITATIONS
// ============================================================

export interface InvitationStats {
  totalInvitations: number;
  pendingInvitations: number;
  acceptedInvitations: number;
  expiredInvitations: number;
  revokedInvitations: number;
  acceptanceRate: number; // Pourcentage
  
  // Pour les liens
  totalLinks: number;
  activeLinks: number;
  totalLinkUses: number;
}

// ============================================================
// RÉPONSES API
// ============================================================

export interface SendInvitationEmailsResponse {
  success: boolean;
  sent: number;
  failed: number;
  errors?: Array<{
    email: string;
    error: string;
  }>;
}

export interface AcceptInvitationResponse {
  success: boolean;
  club_id: string;
  club_name: string;
  role: InvitationRole;
}

export interface UseInvitationLinkResponse {
  success: boolean;
  club_id: string;
  club_name: string;
  role: InvitationRole;
  already_member?: boolean;
}

// ============================================================
// PARAMÈTRES DE REQUÊTE
// ============================================================

export interface GetInvitationsParams {
  club_id: string;
  status?: InvitationStatus;
  limit?: number;
  offset?: number;
}

export interface GetInvitationLinksParams {
  club_id: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

// ============================================================
// DONNÉES DE FORMULAIRE
// ============================================================

export interface InviteByEmailFormData {
  emails: string; // Textarea avec emails séparés par virgules ou lignes
  role: InvitationRole;
  personalMessage: string;
}

export interface InviteByLinkFormData {
  defaultRole: InvitationRole;
  maxUses: string; // String car vient d'un input, convertir en number
  hasExpiration: boolean;
  expiresAt?: string;
}

// ============================================================
// HELPERS DE VALIDATION
// ============================================================

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const parseEmailList = (emailsText: string): string[] => {
  // Parse les emails séparés par virgules, points-virgules ou retours à la ligne
  return emailsText
    .split(/[\n,;]+/)
    .map(email => email.trim())
    .filter(email => email.length > 0);
};

export const validateEmailList = (emailsText: string): { 
  valid: string[]; 
  invalid: string[]; 
} => {
  const emails = parseEmailList(emailsText);
  const valid: string[] = [];
  const invalid: string[] = [];
  
  emails.forEach(email => {
    if (isValidEmail(email)) {
      valid.push(email);
    } else {
      invalid.push(email);
    }
  });
  
  return { valid, invalid };
};

// ============================================================
// HELPERS DE FORMATAGE
// ============================================================

export const getInvitationStatusColor = (status: InvitationStatus): string => {
  switch (status) {
    case 'pending':
      return 'blue';
    case 'accepted':
      return 'green';
    case 'expired':
      return 'gray';
    case 'revoked':
      return 'red';
    default:
      return 'gray';
  }
};

export const getInvitationStatusLabel = (status: InvitationStatus): string => {
  switch (status) {
    case 'pending':
      return 'En attente';
    case 'accepted':
      return 'Acceptée';
    case 'expired':
      return 'Expirée';
    case 'revoked':
      return 'Révoquée';
    default:
      return status;
  }
};

export const getRoleLabel = (role: InvitationRole): string => {
  switch (role) {
    case 'Member':
      return 'Membre';
    case 'Club Admin':
      return 'Administrateur';
    default:
      return role;
  }
};

export const isInvitationExpired = (invitation: ClubInvitation): boolean => {
  return new Date(invitation.expires_at) < new Date();
};

export const isInvitationLinkValid = (link: ClubInvitationLink): boolean => {
  // Vérifier si actif
  if (!link.is_active) return false;
  
  // Vérifier l'expiration
  if (link.expires_at && new Date(link.expires_at) < new Date()) return false;
  
  // Vérifier le nombre d'utilisations
  if (link.max_uses && link.current_uses >= link.max_uses) return false;
  
  return true;
};

export const getInvitationLinkUrl = (code: string): string => {
  return `${window.location.origin}/invitation/link/${code}`;
};