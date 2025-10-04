import { useState, useEffect } from 'react';
import { LikesService, LikeStats } from '../services/likesService';

export function useEventLikes(eventId: string, userId?: string) {
  const [stats, setStats] = useState<LikeStats>({ totalLikes: 0, isLikedByUser: false });
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    loadStats();
  }, [eventId, userId]);

  const loadStats = async () => {
    setLoading(true);
    const newStats = await LikesService.getLikeStats(eventId, userId);
    setStats(newStats);
    setLoading(false);
  };

  const toggleLike = async () => {
    if (!userId || toggling) return;

    setToggling(true);

    // Optimistic update
    const newIsLiked = !stats.isLikedByUser;
    setStats({
      totalLikes: stats.totalLikes + (newIsLiked ? 1 : -1),
      isLikedByUser: newIsLiked,
    });

    const result = await LikesService.toggleLike(eventId, userId);

    if (!result.success) {
      // Rollback en cas d'erreur
      setStats({
        totalLikes: stats.totalLikes,
        isLikedByUser: stats.isLikedByUser,
      });
    }

    setToggling(false);
  };

  return {
    totalLikes: stats.totalLikes,
    isLikedByUser: stats.isLikedByUser,
    loading,
    toggling,
    toggleLike,
  };
}