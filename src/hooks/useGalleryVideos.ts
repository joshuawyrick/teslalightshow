import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { GalleryVideo } from '../types';

interface UseGalleryVideosOptions {
  vehicle?: string | null;
  occasion?: string | null;
  genre?: string | null;
  search?: string;
  sort?: 'newest' | 'views' | 'likes' | 'featured';
  pageSize?: number;
}

export function useGalleryVideos(options: UseGalleryVideosOptions = {}) {
  const { vehicle, occasion, genre, search, sort = 'newest', pageSize = 18 } = options;
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  const fetchVideos = useCallback(async (pageNum: number, append = false) => {
    setLoading(true);
    let query = supabase
      .from('gallery_videos')
      .select(`
        id, title, description, source_type, youtube_id, storage_path,
        cloudflare_video_uid, slug, song_title, artist_name, vehicle_model,
        occasion, genre, story, thumbnail_url, duration_seconds, input_width,
        input_height, featured, view_count, like_count, approved_at, created_at
      `)
      .eq('moderation_status', 'approved')
      .eq('is_public', true)
      .eq('upload_status', 'ready');

    if (vehicle) query = query.eq('vehicle_model', vehicle);
    if (occasion) query = query.eq('occasion', occasion);
    if (genre) query = query.eq('genre', genre);
    if (search) query = query.ilike('title', `%${search}%`);

    switch (sort) {
      case 'views': query = query.order('view_count', { ascending: false }); break;
      case 'likes': query = query.order('like_count', { ascending: false }); break;
      case 'featured': query = query.order('featured', { ascending: false }).order('created_at', { ascending: false }); break;
      default: query = query.order('created_at', { ascending: false });
    }

    query = query.range(pageNum * pageSize, (pageNum + 1) * pageSize - 1);

    const { data, error } = await query;
    if (!error && data) {
      setVideos(prev => append ? [...prev, ...data as GalleryVideo[]] : data as GalleryVideo[]);
      setHasMore(data.length === pageSize);
    }
    setLoading(false);
  }, [vehicle, occasion, genre, search, sort, pageSize]);

  useEffect(() => {
    setPage(0);
    fetchVideos(0, false);
  }, [fetchVideos]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchVideos(nextPage, true);
  }, [page, fetchVideos]);

  return { videos, loading, hasMore, loadMore, refetch: () => fetchVideos(0, false) };
}
