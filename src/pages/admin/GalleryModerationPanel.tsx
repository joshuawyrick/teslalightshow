import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, Trash2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { moderateGallerySubmission } from '../../lib/gallery';
import GalleryStatusBadge from '../../components/gallery/GalleryStatusBadge';
import { getVehicleLabel } from '../../lib/galleryTaxonomy';
import { getStreamPlayerUrl } from '../../lib/cloudflareStream';
import { getYouTubeEmbedUrl } from '../../lib/youtube';
import type { GalleryVideo } from '../../types';

type Tab = 'pending' | 'approved' | 'rejected';

export default function GalleryModerationPanel() {
  const [tab, setTab] = useState<Tab>('pending');
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const fetchVideos = async () => {
    setLoading(true);
    let query = supabase
      .from('gallery_videos')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (tab === 'pending') {
      query = query.eq('moderation_status', 'pending').eq('upload_status', 'ready');
    } else if (tab === 'approved') {
      query = query.eq('moderation_status', 'approved');
    } else {
      query = query.eq('moderation_status', 'rejected');
    }

    const { data, count } = await query;
    setVideos((data as GalleryVideo[]) || []);
    setTotal(count || 0);
    setLoading(false);
  };

  useEffect(() => { fetchVideos(); }, [tab, page]);

  const handleModerate = async (videoId: string, action: 'approve' | 'reject' | 'delete', reason?: string) => {
    try {
      await moderateGallerySubmission(videoId, action, reason);
      setVideos(v => v.filter(vid => vid.id !== videoId));
      setTotal(t => t - 1);
    } catch (err) {
      alert(`Moderation failed: ${err instanceof Error ? err.message : 'unknown error'}`);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display font-bold text-text-primary">Gallery Moderation</h2>

      <div className="flex items-center gap-1 bg-charcoal border border-border rounded-xl p-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setPage(0); }}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key ? 'bg-electric-cyan/15 text-electric-cyan' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={20} className="animate-spin text-text-secondary/50" />
        </div>
      ) : videos.length === 0 ? (
        <p className="text-text-secondary text-center py-12 text-sm">No videos in this queue.</p>
      ) : (
        <div className="space-y-4">
          {videos.map(v => (
            <ModerationCard key={v.id} video={v} tab={tab} onModerate={handleModerate} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="flex items-center gap-1 hover:text-text-primary disabled:opacity-30">
            <ChevronLeft size={14} /> Prev
          </button>
          <span>Page {page + 1} of {Math.ceil(total / pageSize)}</span>
          <button disabled={(page + 1) * pageSize >= total} onClick={() => setPage(p => p + 1)} className="flex items-center gap-1 hover:text-text-primary disabled:opacity-30">
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function ModerationCard({ video, tab, onModerate }: {
  video: GalleryVideo; tab: Tab;
  onModerate: (id: string, action: 'approve' | 'reject' | 'delete', reason?: string) => void;
}) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const renderPreview = () => {
    if (video.source_type === 'youtube' && video.youtube_id) {
      return <iframe src={getYouTubeEmbedUrl(video.youtube_id)} className="w-full h-full" title={video.title} allowFullScreen />;
    }
    if (video.source_type === 'cloudflare_stream' && video.cloudflare_video_uid) {
      const url = getStreamPlayerUrl(video.cloudflare_video_uid);
      if (url) return <iframe src={url} className="w-full h-full" title={video.title} allowFullScreen />;
    }
    return <div className="w-full h-full bg-steel flex items-center justify-center text-text-secondary text-xs">No preview</div>;
  };

  return (
    <div className="bg-charcoal border border-border rounded-2xl overflow-hidden">
      {/* Video Preview */}
      <div className="aspect-video w-full max-h-[280px]">
        {renderPreview()}
      </div>

      <div className="p-4 space-y-3">
        {/* Title and metadata */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <GalleryStatusBadge uploadStatus={video.upload_status!} moderationStatus={video.moderation_status!} />
            <h3 className="text-text-primary text-sm font-medium truncate">{video.title}</h3>
          </div>
          <div className="flex flex-wrap gap-2 text-text-secondary text-xs">
            {video.vehicle_model && <span>{getVehicleLabel(video.vehicle_model)}</span>}
            {video.song_title && <span>Song: {video.song_title}</span>}
            {video.artist_name && <span>Artist: {video.artist_name}</span>}
            <span>Submitted: {new Date(video.created_at).toLocaleDateString()}</span>
            {video.slug && (
              <a href={`/tesla-light-show-gallery/show/${video.slug}`} target="_blank" rel="noreferrer" className="text-electric-cyan flex items-center gap-0.5 hover:underline">
                <ExternalLink size={10} /> View
              </a>
            )}
          </div>
          {video.story && <p className="text-text-secondary text-xs line-clamp-2">{video.story}</p>}
          {video.rejection_reason && <p className="text-accent-red/80 text-xs">Reason: {video.rejection_reason}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          {tab === 'pending' && (
            <>
              <button
                onClick={() => onModerate(video.id, 'approve')}
                className="flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 text-xs font-medium rounded-lg px-3 py-2 transition-colors"
              >
                <CheckCircle2 size={12} /> Approve
              </button>
              <button
                onClick={() => setShowReject(!showReject)}
                className="flex items-center gap-1.5 bg-amber-500/15 text-amber-400 border border-amber-500/25 hover:bg-amber-500/25 text-xs font-medium rounded-lg px-3 py-2 transition-colors"
              >
                <XCircle size={12} /> Reject
              </button>
            </>
          )}
          <button
            onClick={() => setShowDelete(!showDelete)}
            className="flex items-center gap-1.5 bg-accent-red/15 text-accent-red border border-accent-red/25 hover:bg-accent-red/25 text-xs font-medium rounded-lg px-3 py-2 transition-colors ml-auto"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>

        {/* Reject form */}
        {showReject && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="Rejection reason..."
              className="flex-1 bg-midnight border border-border text-text-primary placeholder-text-secondary/50 rounded-lg px-3 py-2 text-xs outline-none focus:border-electric-cyan/50"
            />
            <button
              disabled={!rejectionReason.trim()}
              onClick={() => { onModerate(video.id, 'reject', rejectionReason.trim()); setShowReject(false); setRejectionReason(''); }}
              className="bg-amber-500/20 text-amber-400 text-xs font-medium rounded-lg px-3 py-2 hover:bg-amber-500/30 disabled:opacity-30"
            >
              Confirm
            </button>
          </div>
        )}

        {/* Delete confirm */}
        {showDelete && (
          <div className="flex items-center gap-2">
            <span className="text-accent-red text-xs">Permanently delete?</span>
            <button
              onClick={() => { onModerate(video.id, 'delete'); setShowDelete(false); }}
              className="bg-accent-red/20 text-accent-red text-xs font-medium rounded-lg px-3 py-2 hover:bg-accent-red/30"
            >
              Yes, Delete
            </button>
            <button onClick={() => setShowDelete(false)} className="text-text-secondary text-xs hover:text-text-primary">Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}
