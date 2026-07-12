import { useState, useCallback } from 'react';
import { toggleGalleryLike } from '../lib/gallery';
import { useAuth } from '../contexts/AuthContext';

export function useGalleryLikes(initialLikeCount: number, videoId: string) {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [liked, setLiked] = useState(false);
  const [toggling, setToggling] = useState(false);

  const toggle = useCallback(async () => {
    if (!user || toggling) return false;
    setToggling(true);

    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const result = await toggleGalleryLike(videoId);
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setToggling(false);
    }
    return true;
  }, [user, toggling, liked, likeCount, videoId]);

  return { liked, likeCount, toggle, requiresAuth: !user };
}
