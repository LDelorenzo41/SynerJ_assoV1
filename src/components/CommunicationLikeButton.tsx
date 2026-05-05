// src/components/CommunicationLikeButton.tsx

import React from 'react';
import { Heart } from 'lucide-react';
import { useCommunicationLikes } from '../hooks/useCommunicationLikes';

interface CommunicationLikeButtonProps {
  communicationId: string;
  showCount?: boolean;
  variant?: 'default' | 'compact';
  className?: string;
}

export const CommunicationLikeButton: React.FC<CommunicationLikeButtonProps> = ({
  communicationId,
  showCount = true,
  variant = 'default',
  className = '',
}) => {
  const { stats, toggling, toggleLike } = useCommunicationLikes(communicationId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleLike();
  };

  const isCompact = variant === 'compact';

  return (
    <button
      onClick={handleClick}
      disabled={toggling}
      className={`
        inline-flex items-center gap-2 transition-all duration-200
        ${isCompact ? 'px-2 py-1 text-sm' : 'px-3 py-2'}
        rounded-lg
        ${stats.isLikedByUser 
          ? 'text-ds-danger dark:text-ds-danger bg-ds-danger-soft dark:bg-ds-danger-soft' 
          : 'text-encre-2 dark:text-encre-3 bg-papier-2 dark:bg-papier-2 hover:bg-papier-3 dark:hover:bg-papier-3'
        }
        ${toggling ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
        ${className}
      `}
      title={stats.isLikedByUser ? 'Retirer le like' : 'Liker cette communication'}
    >
      <Heart
        className={`${isCompact ? 'w-4 h-4' : 'w-5 h-5'} transition-all duration-200 ${
          stats.isLikedByUser ? 'fill-current' : ''
        }`}
      />
      {showCount && (
        <span className={`font-medium ${isCompact ? 'text-xs' : 'text-sm'}`}>
          {stats.totalLikes}
        </span>
      )}
    </button>
  );
};