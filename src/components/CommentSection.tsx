// src/components/CommentSection.tsx

import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Trash2, Edit2, X, Check } from 'lucide-react';
import { CommentsService } from '../services/commentsService';
import { EventCommentWithUser, COMMENT_VALIDATION } from '../types/comments';
import { useAuthNew } from '../hooks/useAuthNew';

interface CommentSectionProps {
  eventId: string;
  isEventOwner?: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ 
  eventId, 
  isEventOwner = false 
}) => {
  const { user, profile } = useAuthNew();
  const [comments, setComments] = useState<EventCommentWithUser[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les commentaires au montage
  useEffect(() => {
    loadComments();
  }, [eventId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CommentsService.getEventComments(eventId);
      setComments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile) {
      setError('Vous devez être connecté pour commenter');
      return;
    }

    const trimmedContent = newComment.trim();
    if (trimmedContent.length < COMMENT_VALIDATION.MIN_LENGTH) {
      setError('Le commentaire ne peut pas être vide');
      return;
    }

    if (trimmedContent.length > COMMENT_VALIDATION.MAX_LENGTH) {
      setError(`Le commentaire ne peut pas dépasser ${COMMENT_VALIDATION.MAX_LENGTH} caractères`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const newCommentData = await CommentsService.createComment({
        event_id: eventId,
        user_id: user.id,
        content: trimmedContent,
      });

      setComments(prev => [...prev, newCommentData]);
      setNewComment('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = (comment: EventCommentWithUser) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
    setError(null);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!user) return;

    const trimmedContent = editContent.trim();
    if (trimmedContent.length < COMMENT_VALIDATION.MIN_LENGTH) {
      setError('Le commentaire ne peut pas être vide');
      return;
    }

    if (trimmedContent.length > COMMENT_VALIDATION.MAX_LENGTH) {
      setError(`Le commentaire ne peut pas dépasser ${COMMENT_VALIDATION.MAX_LENGTH} caractères`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const updatedComment = await CommentsService.updateComment(
        commentId,
        { content: trimmedContent },
        user.id
      );

      setComments(prev =>
        prev.map(c => (c.id === commentId ? updatedComment : c))
      );
      setEditingCommentId(null);
      setEditContent('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
    setError(null);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }

    try {
      setError(null);
      const isAdmin = profile?.role === 'Club Admin' && isEventOwner;
      await CommentsService.deleteComment(commentId, user.id, isAdmin);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const canDeleteComment = (comment: EventCommentWithUser): boolean => {
    if (!user || !profile) return false;
    return comment.user_id === user.id || (profile.role === 'Club Admin' && isEventOwner);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getUserDisplayName = (comment: EventCommentWithUser): string => {
    if (comment.profiles.pseudo) {
      return `@${comment.profiles.pseudo}`;
    }
    if (comment.profiles.first_name && comment.profiles.last_name) {
      return `${comment.profiles.first_name} ${comment.profiles.last_name}`;
    }
    return 'Utilisateur';
  };

  const getCharacterCount = () => {
    const content = editingCommentId ? editContent : newComment;
    return content.length;
  };

  const isOverLimit = () => getCharacterCount() > COMMENT_VALIDATION.MAX_LENGTH;

  if (loading) {
    return (
      <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
          <MessageCircle className="w-4 h-4 animate-pulse" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
      {/* En-tête compact */}
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Commentaires {comments.length > 0 && `(${comments.length})`}
        </h3>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Liste des commentaires */}
      {comments.length > 0 && (
        <div className="space-y-3 mb-4">
          {comments.map(comment => (
            <div key={comment.id} className="pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
              {editingCommentId === comment.id ? (
                /* Mode édition */
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className={`w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      isOverLimit() ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    rows={2}
                    disabled={submitting}
                  />
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${isOverLimit() ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {getCharacterCount()} / {COMMENT_VALIDATION.MAX_LENGTH}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(comment.id)}
                        disabled={submitting || isOverLimit()}
                        className="flex items-center gap-1 px-2 py-1 bg-indigo-600 dark:bg-indigo-700 text-white rounded hover:bg-indigo-700 dark:hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                      >
                        <Check className="w-3 h-3" />
                        <span>Enregistrer</span>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={submitting}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 text-xs"
                      >
                        <X className="w-3 h-3" />
                        <span>Annuler</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Mode affichage */
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {/* Avatar */}
                      {comment.profiles.avatar_url ? (
                        <img
                          src={comment.profiles.avatar_url}
                          alt={getUserDisplayName(comment)}
                          className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-xs">
                            {getUserDisplayName(comment).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      
                      {/* Nom et date */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {getUserDisplayName(comment)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(comment.created_at)}
                            {comment.updated_at && ' • Modifié'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {user && (
                      <div className="flex gap-1 flex-shrink-0">
                        {comment.user_id === user.id && (
                          <button
                            onClick={() => handleEditComment(comment)}
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                        {canDeleteComment(comment) && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Contenu du commentaire */}
                  <p className="text-gray-700 dark:text-gray-300 text-sm ml-8 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout de commentaire */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className={`w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
              isOverLimit() ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
            }`}
            rows={2}
            disabled={submitting}
          />
          <div className="flex items-center justify-between">
            <span className={`text-xs ${isOverLimit() ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {getCharacterCount()} / {COMMENT_VALIDATION.MAX_LENGTH}
            </span>
            <button
              type="submit"
              disabled={submitting || newComment.trim().length === 0 || isOverLimit()}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 dark:bg-indigo-700 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <Send className="w-3 h-3" />
              <span>{submitting ? 'Envoi...' : 'Commenter'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
          <p className="text-gray-600 dark:text-gray-400 text-xs">
            Connectez-vous pour commenter
          </p>
        </div>
      )}
    </div>
  );
};