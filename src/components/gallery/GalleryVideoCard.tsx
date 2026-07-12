import { useState } from 'react';
import { Play, Eye, Heart, Star } from 'lucide-react';
import type { GalleryVideo } from '../../types';
import { getYouTubeThumbnail, getYouTubeEmbedUrl } from '../../lib/youtube';
import { getStreamPlayerUrl, getStreamThumbnailUrl } from '../../lib/cloudflareStream';
import { getVehicleLabel } from '../../lib/galleryTaxonomy';

interface GalleryVideoCardProps {
  video: GalleryVideo;
  onNavigate?: (path: string) => void;
}

export default function GalleryVideoCard({ video, onNavigate }: GalleryVideoCardProps) {
  const [playing, setPlaying] = useState(false);

  const thumbnailUrl = video.source_type === 'youtube' && video.youtube_id
    ? getYouTubeThumbnail(video.youtube_id)
    : video.thumbnail_url || (video.cloudflare_video_uid ? getStreamThumbnailUrl(video.cloudflare_video_uid) : null);

  const handleClick = () => {
    if (video.slug && onNavigate) {
      onNavigate(`/tesla-light-show-gallery/show/${video.slug}`);
    } else {
      setPlaying(true);
    }
  };

  const renderPlayer = () => {
    if (video.source_type === 'youtube' && video.youtube_id) {
      return (
        <iframe
          src={getYouTubeEmbedUrl(video.youtube_id)}
          className="absolute inset-0 w-full h-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={video.title}
        />
      );
    }
    if (video.source_type === 'cloudflare_stream' && video.cloudflare_video_uid) {
      const playerUrl = getStreamPlayerUrl(video.cloudflare_video_uid);
      if (playerUrl) {
        return (
          <iframe
            src={playerUrl}
            className="absolute inset-0 w-full h-full"
            loading="lazy"
            allowFullScreen
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            title={video.title}
          />
        );
      }
    }
    return null;
  };

  return (
    <div className="bg-steel border border-border rounded-2xl overflow-hidden hover:border-electric-cyan/30 transition-colors duration-200 group">
      <div className="relative aspect-video bg-black">
        {playing ? (
          renderPlayer()
        ) : (
          <button
            onClick={handleClick}
            className="relative w-full h-full"
            aria-label={`Play ${video.title}`}
          >
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={video.title}
                loading="lazy"
                width={320}
                height={180}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-charcoal flex items-center justify-center">
                <Play size={32} className="text-text-secondary/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <Play size={20} className="text-white ml-0.5" />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-200">
              <div className="w-12 h-12 rounded-full bg-accent-red/90 flex items-center justify-center shadow-lg">
                <Play size={20} className="text-white ml-0.5" />
              </div>
            </div>
            {video.featured && (
              <div className="absolute top-2 left-2 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star size={10} /> Featured
              </div>
            )}
          </button>
        )}
      </div>
      <div className="p-4 space-y-2">
        <p className="text-text-primary font-medium text-sm truncate">{video.title}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-text-secondary/60 text-xs">
            {video.vehicle_model && (
              <span className="bg-charcoal border border-border px-2 py-0.5 rounded text-[10px]">
                {getVehicleLabel(video.vehicle_model)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-text-secondary/50 text-xs">
            {video.view_count > 0 && (
              <span className="flex items-center gap-1"><Eye size={11} />{video.view_count}</span>
            )}
            {video.like_count > 0 && (
              <span className="flex items-center gap-1"><Heart size={11} />{video.like_count}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
