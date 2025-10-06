// src/types/communicationInteractions.ts

/**
 * Interface représentant un like sur une communication
 */
export interface CommunicationLike {
  id: string;
  user_id: string;
  communication_id: string;
  created_at: string;
}

/**
 * Interface pour les statistiques de likes d'une communication
 */
export interface CommunicationLikeStats {
  totalLikes: number;
  isLikedByUser: boolean;
}

/**
 * Interface représentant un commentaire sur une communication
 */
export interface CommunicationComment {
  id: string;
  communication_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string | null;
}

/**
 * Interface pour un commentaire enrichi avec les informations de l'utilisateur
 */
export interface CommunicationCommentWithUser extends CommunicationComment {
  profiles: {
    id: string;
    pseudo: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

/**
 * Interface pour créer un nouveau commentaire
 */
export interface CreateCommunicationCommentInput {
  communication_id: string;
  user_id: string;
  content: string;
}

/**
 * Interface pour mettre à jour un commentaire
 */
export interface UpdateCommunicationCommentInput {
  content: string;
}

/**
 * Interface pour les statistiques de commentaires
 */
export interface CommunicationCommentStats {
  totalComments: number;
  userHasCommented: boolean;
}

/**
 * Constantes de validation
 */
export const COMMUNICATION_COMMENT_VALIDATION = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 2000,
} as const;

/**
 * Messages d'erreur pour les commentaires
 */
export const COMMUNICATION_COMMENT_ERROR_MESSAGES = {
  TOO_SHORT: 'Le commentaire ne peut pas être vide',
  TOO_LONG: `Le commentaire ne peut pas dépasser ${COMMUNICATION_COMMENT_VALIDATION.MAX_LENGTH} caractères`,
  NOT_FOUND: 'Commentaire introuvable',
  UNAUTHORIZED: 'Vous n\'êtes pas autorisé à effectuer cette action',
  CREATION_FAILED: 'Erreur lors de la création du commentaire',
  UPDATE_FAILED: 'Erreur lors de la modification du commentaire',
  DELETE_FAILED: 'Erreur lors de la suppression du commentaire',
  FETCH_FAILED: 'Erreur lors du chargement des commentaires',
} as const;