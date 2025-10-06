// src/components/CommunicationCommentSection.tsx

import React, { useState } from 'react';
import { MessageCircle, Send, Edit2, Trash2, X, Check } from 'lucide-react';
import { useCommunicationComments } from '../hooks/useCommunicationComments';
import { useAuthNew } from '../hooks/useAuthNew';
import { CommunicationCommentWithUser } from '../types/communicationInteractions';
import { COMMUNICATION_COMMENT_VALIDATION } from '../types/communicationInteractions';

interface CommunicationCommentSectionProps {
  communicationId: string;
  isCommunicationOwner?: boolean;
}

export const CommunicationCommentSection: React.FC<CommunicationCommentSectionProps> = ({ 
  communicationId, 
  isCommunicationOwner = false 
}) => {
  const { user, profile } = useAuthNew();
  const {
    comments,
    stats,
    loading,
    error,
    createComment,
    updateComment,
    deleteComment,
  } = useCommunicationComments(communicationId);

  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile) {
      return;
    }

    const trimmedContent = newComment.trim();
    if (trimmedContent.length < COMMUNICATION_COMMENT_VALIDATION.MIN_LENGTH) {
      return;
    }

    try {
      setSubmitting(true);
      const success = await createComment(trimmedContent);
      if (success) {
        setNewComment('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = (comment: CommunicationCommentWithUser) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!user) return;

    const trimmedContent = editContent.trim();
    if (trimmedContent.length < COMMUNICATION_COMMENT_VALIDATION.MIN_LENGTH) {
      return;
    }

    try {
      setSubmitting(true);
      const success = await updateComment(commentId, trimmedContent);
      if (success) {
        setEditingCommentId(null);
        setEditContent('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }

    try {
      setSubmitting(true);
      await deleteComment(commentId);
    } finally {
      setSubmitting(false);
    }
  };

  const getDisplayName = (comment: CommunicationCommentWithUser): string => {
    if (comment.profiles.pseudo) {
      return comment.profiles.pseudo;
    }
    if (comment.profiles.first_name && comment.profiles.last_name) {
      return `${comment.profiles.first_name} ${comment.profiles.last_name}`;
    }
    return 'Utilisateur';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const canEditComment = (comment: CommunicationCommentWithUser): boolean => {
    return user?.id === comment.user_id;
  };

  const canDeleteComment = (comment: CommunicationCommentWithUser): boolean => {
    return user?.id === comment.user_id || isCommunicationOwner || profile?.role === 'Club Admin';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">Chargement des commentaires...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête avec statistiques */}
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <MessageCircle className="w-5 h-5" />
        <span className="font-medium">
          {stats.totalComments} {stats.totalComments > 1 ? 'commentaires' : 'commentaire'}
        </span>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Formulaire de nouveau commentaire */}
      {user && (
        <form onSubmit={handleSubmitComment} className="space-y-2">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ajouter un commentaire..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       resize-none transition-all"
              rows={3}
              maxLength={COMMUNICATION_COMMENT_VALIDATION.MAX_LENGTH}
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || newComment.trim().length === 0}
              className="absolute bottom-3 right-3 p-2 rounded-lg
                       bg-blue-600 text-white
                       hover:bg-blue-700 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all"
              title="Envoyer le commentaire"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span>
              {newComment.length}/{COMMUNICATION_COMMENT_VALIDATION.MAX_LENGTH} caractères
            </span>
          </div>
        </form>
      )}

      {/* Liste des commentaires */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun commentaire pour le moment</p>
            {user && <p className="text-xs mt-1">Soyez le premier à commenter !</p>}
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2"
            >
              {/* En-tête du commentaire */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {comment.profiles.avatar_url ? (
                    <img
                      src={comment.profiles.avatar_url}
                      alt={getDisplayName(comment)}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {getDisplayName(comment).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {getDisplayName(comment)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(comment.created_at)}
                      {comment.updated_at && ' (modifié)'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {user && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {canEditComment(comment) && editingCommentId !== comment.id && (
                      <button
                        onClick={() => handleEditComment(comment)}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {canDeleteComment(comment) && editingCommentId !== comment.id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Contenu du commentaire */}
              {editingCommentId === comment.id ? (
                <div className="space-y-2 mt-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             resize-none"
                    rows={3}
                    maxLength={COMMUNICATION_COMMENT_VALIDATION.MAX_LENGTH}
                    disabled={submitting}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveEdit(comment.id)}
                      disabled={submitting || editContent.trim().length === 0}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                               disabled:opacity-50 disabled:cursor-not-allowed
                               flex items-center gap-1 text-sm transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Enregistrer
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={submitting}
                      className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                               rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600
                               flex items-center gap-1 text-sm transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};