// src/types/comments.ts

/**
 * Interface représentant un commentaire sur un événement
 */
export interface EventComment {
  id: string;
  event_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string | null;
}

/**
 * Interface pour un commentaire enrichi avec les informations de l'utilisateur
 */
export interface EventCommentWithUser extends EventComment {
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
export interface CreateCommentInput {
  event_id: string;
  user_id: string;
  content: string;
}

/**
 * Interface pour mettre à jour un commentaire
 */
export interface UpdateCommentInput {
  content: string;
}

/**
 * Interface pour les statistiques de commentaires
 */
export interface CommentStats {
  totalComments: number;
  userHasCommented: boolean;
}

/**
 * Constantes de validation
 */
export const COMMENT_VALIDATION = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 2000,
} as const;

/**
 * Messages d'erreur pour les commentaires
 */
export const COMMENT_ERROR_MESSAGES = {
  TOO_SHORT: 'Le commentaire ne peut pas être vide',
  TOO_LONG: `Le commentaire ne peut pas dépasser ${COMMENT_VALIDATION.MAX_LENGTH} caractères`,
  NOT_FOUND: 'Commentaire introuvable',
  UNAUTHORIZED: 'Vous n\'êtes pas autorisé à effectuer cette action',
  CREATION_FAILED: 'Erreur lors de la création du commentaire',
  UPDATE_FAILED: 'Erreur lors de la modification du commentaire',
  DELETE_FAILED: 'Erreur lors de la suppression du commentaire',
  FETCH_FAILED: 'Erreur lors du chargement des commentaires',
} as const;