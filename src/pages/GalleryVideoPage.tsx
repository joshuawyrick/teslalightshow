import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Heart, Flag, Calendar, Clock, Car } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useGalleryLikes } from '../hooks/useGalleryLikes';
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from '../lib/youtube';
import { getStreamPlayerUrl } from '../lib/cloudflareStream';
import { getVehicleLabel, getOccasionLabel, getGenreLabel } from '../lib/galleryTaxonomy';
import { buildVideoPageTitle, buildVideoPageDescription, buildVideoCanonical, buildVideoJsonLd, buildBreadcrumbJsonLd } from '../lib/gallerySeo';
import SeoHead from '../components/SeoHead';
import JsonLd from '../components/JsonLd';
import ReportVideoModal from '../components/gallery/ReportVideoModal';
import type { GalleryVideo } from '../types';

export default function GalleryVideoPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [video, setVideo] = useState<GalleryVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery_videos')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
      } else {
        setVideo(data as GalleryVideo);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <main className="max-w-[1320px] mx-auto px-4 sm:px-6 py-20 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-text-secondary/50" />
      </main>
    );
  }

  if (notFound || !video) {
    return (
      <main className="max-w-[1320px] mx-auto px-4 sm:px-6 py-20 text-center">
        <SeoHead title="Video Not Found | EVLightShows.com" description="This video could not be found." canonical={`https://evlightshows.com/tesla-light-show-gallery/show/${slug}`} noindex />
        <p className="text-text-secondary">This video is not available.</p>
      </main>
    );
  }

  return <VideoDetail video={video} showReport={showReport} setShowReport={setShowReport} playing={playing} setPlaying={setPlaying} user={user} />;
}

function VideoDetail({ video, showReport, setShowReport, playing, setPlaying, user }: {
  video: GalleryVideo; showReport: boolean; setShowReport: (v: boolean) => void; playing: boolean; setPlaying: (v: boolean) => void; user: unknown;
}) {
  const { liked, likeCount, toggle, requiresAuth } = useGalleryLikes(video.like_count, video.id);
  const seoTitle = buildVideoPageTitle(video);
  const seoDesc = buildVideoPageDescription(video);
  const canonical = buildVideoCanonical(video.slug!);

  const handleLike = () => {
    if (requiresAuth) return;
    toggle();
  };

  const handleReport = async (videoId: string, reason: string, details: string) => {
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = await import('../lib/supabase').then(m => ({ SUPABASE_URL: m.SUPABASE_URL, SUPABASE_ANON_KEY: m.SUPABASE_ANON_KEY }));
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Apikey': SUPABASE_ANON_KEY };
    const { data: { session } } = await supabase.auth.getSession();
    if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
    const res = await fetch(`${SUPABASE_URL}/functions/v1/report-gallery-video`, {
      method: 'POST', headers, body: JSON.stringify({ videoId, reason, details }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit report');
  };

  const renderPlayer = () => {
    if (video.source_type === 'youtube' && video.youtube_id) {
      if (!playing) {
        return (
          <button onClick={() => setPlaying(true)} className="relative w-full h-full group">
            <img src={getYouTubeThumbnail(video.youtube_id)} alt={video.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-accent-red/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white ml-1" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </button>
        );
      }
      return <iframe src={getYouTubeEmbedUrl(video.youtube_id)} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={video.title} />;
    }
    if (video.source_type === 'cloudflare_stream' && video.cloudflare_video_uid) {
      const url = getStreamPlayerUrl(video.cloudflare_video_uid);
      if (url) return <iframe src={url} className="w-full h-full" allowFullScreen allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" title={video.title} loading="lazy" />;
    }
    return <div className="w-full h-full bg-charcoal flex items-center justify-center"><p className="text-text-secondary">Video unavailable</p></div>;
  };

  return (
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <SeoHead title={seoTitle} description={seoDesc} canonical={canonical} />
      <JsonLd data={buildVideoJsonLd(video)} />
      <JsonLd data={buildBreadcrumbJsonLd(video.title, video.slug!)} />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="text-xs text-text-secondary/80">
        <a href="/" className="hover:text-text-primary transition-colors">Home</a>
        <span className="mx-1.5">/</span>
        <a href="/tesla-light-show-gallery" className="hover:text-text-primary transition-colors">Gallery</a>
        <span className="mx-1.5">/</span>
        <span className="text-text-secondary">{video.title}</span>
      </nav>

      {/* Video Player */}
      <div className="w-full rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: video.input_width && video.input_height ? `${video.input_width}/${video.input_height}` : '16/9' }}>
        {renderPlayer()}
      </div>

      {/* Title and actions */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-display font-bold text-text-primary">{video.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-text-secondary text-xs">
            {video.vehicle_model && (
              <span className="flex items-center gap-1"><Car size={12} />{getVehicleLabel(video.vehicle_model)}</span>
            )}
            {video.occasion && (
              <span className="flex items-center gap-1"><Calendar size={12} />{getOccasionLabel(video.occasion)}</span>
            )}
            {video.duration_seconds && (
              <span className="flex items-center gap-1"><Clock size={12} />{Math.floor(video.duration_seconds / 60)}:{String(Math.floor(video.duration_seconds % 60)).padStart(2, '0')}</span>
            )}
            {video.approved_at && (
              <span>{new Date(video.approved_at).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            disabled={requiresAuth}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
              liked
                ? 'bg-accent-red/15 border-accent-red/30 text-accent-red'
                : 'bg-steel border-border text-text-secondary hover:text-text-primary hover:border-border/80'
            }`}
            title={requiresAuth ? 'Sign in to like' : undefined}
          >
            <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
            {likeCount}
          </button>
          <button
            onClick={() => setShowReport(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary bg-steel border border-border hover:border-border/80 transition-all"
          >
            <Flag size={14} />
          </button>
        </div>
      </div>

      {/* Metadata */}
      {(video.song_title || video.artist_name || video.genre || video.story) && (
        <div className="bg-charcoal border border-border rounded-2xl p-5 space-y-3">
          {(video.song_title || video.artist_name) && (
            <div className="flex flex-wrap gap-4 text-sm">
              {video.song_title && <span className="text-text-primary"><span className="text-text-secondary/60">Song:</span> {video.song_title}</span>}
              {video.artist_name && <span className="text-text-primary"><span className="text-text-secondary/60">Artist:</span> {video.artist_name}</span>}
              {video.genre && <span className="text-text-primary"><span className="text-text-secondary/60">Genre:</span> {getGenreLabel(video.genre)}</span>}
            </div>
          )}
          {video.story && <p className="text-text-secondary text-sm leading-relaxed">{video.story}</p>}
        </div>
      )}

      {/* CTA */}
      <div className="bg-charcoal border border-border rounded-2xl p-6 text-center space-y-3">
        <p className="text-text-primary font-display font-bold">Create Your Own Tesla Light Show</p>
        <p className="text-text-secondary text-sm">Upload any song and generate a custom FSEQ file for your Tesla.</p>
        <a href="/tesla-light-show-generator#upload" className="inline-flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white text-sm font-semibold rounded-xl px-6 py-3 transition-all glow-red">
          Generate My Light Show
        </a>
      </div>

      {showReport && (
        <ReportVideoModal videoId={video.id} onClose={() => setShowReport(false)} onSubmit={handleReport} />
      )}
    </main>
  );
}
