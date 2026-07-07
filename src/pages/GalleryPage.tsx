import { useState, useEffect, useCallback } from 'react';
import { Loader2, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getYouTubeThumbnail, getYouTubeEmbedUrl } from '../lib/youtube';
import type { GalleryVideo } from '../types';

function YouTubeCard({ video }: { video: GalleryVideo }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="bg-steel border border-border rounded-2xl overflow-hidden hover:border-electric-cyan/30 transition-colors duration-200">
      <div className="relative aspect-video bg-black">
        {playing ? (
          <iframe
            src={getYouTubeEmbedUrl(video.youtube_id!)}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="relative w-full h-full group"
          >
            <img
              src={getYouTubeThumbnail(video.youtube_id!)}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <Play size={24} className="text-white ml-0.5" />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-200">
              <div className="w-14 h-14 rounded-full bg-accent-red/90 flex items-center justify-center shadow-lg">
                <Play size={24} className="text-white ml-0.5" />
              </div>
            </div>
          </button>
        )}
      </div>
      <div className="p-4 space-y-1">
        <p className="text-text-primary font-medium text-sm truncate">{video.title}</p>
        {video.description && (
          <p className="text-text-secondary/70 text-xs line-clamp-2">{video.description}</p>
        )}
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gallery_videos')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setVideos(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const youtubeVideos = videos.filter(v => v.youtube_id);

  return (
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-text-primary font-heading">Gallery</h1>
        <p className="text-text-secondary text-sm mt-1">Tesla light shows from the community.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-text-secondary/50" />
        </div>
      ) : youtubeVideos.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-secondary/60">No videos yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {youtubeVideos.map(v => (
            <YouTubeCard key={v.id} video={v} />
          ))}
        </div>
      )}
    </main>
  );
}
