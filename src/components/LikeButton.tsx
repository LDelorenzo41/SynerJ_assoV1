import React from 'react';
import { Heart } from 'lucide-react';
import { useEventLikes } from '../hooks/useEventLikes';

interface LikeButtonProps {
  eventId: string;
  userId?: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export default function LikeButton({ eventId, userId, size = 'md', showCount = true }: LikeButtonProps) {
  const { totalLikes, isLikedByUser, toggling, toggleLike } = useEventLikes(eventId, userId);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher la propagation si le bouton est dans une card cliquable
    if (userId) {
      toggleLike();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!userId || toggling}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
        isLikedByUser
          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
      } ${!userId ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${
        toggling ? 'opacity-70' : ''
      }`}
      title={!userId ? 'Connectez-vous pour liker' : isLikedByUser ? 'Retirer le like' : 'Liker cet événement'}
    >
      <Heart
        className={`${sizeClasses[size]} transition-all duration-200 ${
          isLikedByUser ? 'fill-current scale-110' : ''
        }`}
      />
      {showCount && (
        <span className={`font-medium ${textSizeClasses[size]}`}>
          {totalLikes}
        </span>
      )}
    </button>
  );
}