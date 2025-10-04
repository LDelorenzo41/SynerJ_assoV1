// src/components/CommentBadge.tsx

import React from 'react';
import { MessageCircle } from 'lucide-react';

interface CommentBadgeProps {
  count: number;
  onClick?: () => void;
  className?: string;
  showZero?: boolean;
}

/**
 * Badge affichant le nombre de commentaires
 * Peut être cliquable pour ouvrir la section commentaires
 */
export const CommentBadge: React.FC<CommentBadgeProps> = ({
  count,
  onClick,
  className = '',
  showZero = true,
}) => {
  // Ne rien afficher si count = 0 et showZero = false
  if (count === 0 && !showZero) {
    return null;
  }

  const baseClasses = `
    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
    transition-all duration-200
    ${onClick ? 'cursor-pointer hover:bg-opacity-80' : ''}
    ${count > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}
  `;

  return (
    <div
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyPress={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <MessageCircle className="w-4 h-4" />
      <span className="font-medium">
        {count}
      </span>
    </div>
  );
};

/**
 * Version compacte du badge (juste l'icône avec le nombre)
 */
export const CommentBadgeCompact: React.FC<CommentBadgeProps> = ({
  count,
  onClick,
  className = '',
  showZero = false,
}) => {
  if (count === 0 && !showZero) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`
        inline-flex items-center gap-1 text-gray-600 hover:text-indigo-600
        transition-colors disabled:cursor-default
        ${className}
      `}
      title={`${count} commentaire${count > 1 ? 's' : ''}`}
    >
      <MessageCircle className="w-5 h-5" />
      {count > 0 && (
        <span className="text-sm font-medium">{count}</span>
      )}
    </button>
  );
};