import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Upload, Clock, CheckCircle2, XCircle, AlertTriangle, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import GalleryStatusBadge from '../components/gallery/GalleryStatusBadge';
import SeoHead from '../components/SeoHead';
import type { GalleryVideo } from '../types';

interface MyGallerySubmissionsPageProps {
  onOpenAuth: () => void;
}

export default function MyGallerySubmissionsPage({ onOpenAuth }: MyGallerySubmissionsPageProps) {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<GalleryVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { onOpenAuth(); return; }
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('gallery_videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setSubmissions((data as GalleryVideo[]) || []);
      setLoading(false);
    })();
  }, [user, onOpenAuth]);

  if (!user) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <SeoHead title="My Submissions | TeslaLightShows.com" description="Manage your submitted light show videos." canonical="https://teslalightshows.com/tesla-light-show-gallery/my-submissions" noindex />
        <p className="text-text-secondary">Please sign in to view your submissions.</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <SeoHead title="My Submissions | TeslaLightShows.com" description="Manage your submitted light show videos." canonical="https://teslalightshows.com/tesla-light-show-gallery/my-submissions" noindex />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-text-primary">My Submissions</h1>
        <Link
          to="/tesla-light-show-gallery/submit"
          className="inline-flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white text-xs sm:text-sm font-semibold rounded-xl px-4 py-2.5 transition-all glow-red"
        >
          <Upload size={14} />
          New Submission
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-text-secondary/50" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <Upload size={40} className="text-text-secondary/30 mx-auto" />
          <p className="text-text-secondary">You have not submitted any light show videos yet.</p>
          <Link to="/tesla-light-show-gallery/submit" className="text-electric-cyan text-sm font-medium hover:underline">
            Upload your first video
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map(s => <SubmissionRow key={s.id} submission={s} />)}
        </div>
      )}
    </main>
  );
}

function SubmissionRow({ submission }: { submission: GalleryVideo }) {
  const { title, upload_status, moderation_status, created_at, slug, like_count, view_count, rejection_reason, processing_error_message } = submission;

  const statusIcon = () => {
    if (upload_status === 'uploading' || upload_status === 'processing') return <Clock size={14} className="text-amber-400" />;
    if (upload_status === 'error') return <AlertTriangle size={14} className="text-accent-red" />;
    if (moderation_status === 'approved') return <CheckCircle2 size={14} className="text-emerald-400" />;
    if (moderation_status === 'rejected') return <XCircle size={14} className="text-accent-red" />;
    if (moderation_status === 'pending') return <Eye size={14} className="text-amber-400" />;
    return <EyeOff size={14} className="text-text-secondary/50" />;
  };

  return (
    <div className="bg-charcoal border border-border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:items-center">
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          {statusIcon()}
          <p className="text-text-primary text-sm font-medium truncate">{title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-text-secondary text-xs">
          <GalleryStatusBadge uploadStatus={upload_status!} moderationStatus={moderation_status!} />
          <span>{new Date(created_at).toLocaleDateString()}</span>
          {moderation_status === 'approved' && (
            <>
              {typeof view_count === 'number' && <span>{view_count} views</span>}
              {typeof like_count === 'number' && <span>{like_count} likes</span>}
            </>
          )}
        </div>
        {rejection_reason && (
          <p className="text-accent-red/80 text-xs mt-1">Rejection reason: {rejection_reason}</p>
        )}
        {processing_error_message && (
          <p className="text-amber-400/80 text-xs mt-1">Processing error: {processing_error_message}</p>
        )}
      </div>
      {moderation_status === 'approved' && slug && (
        <Link to={`/tesla-light-show-gallery/show/${slug}`} className="inline-flex items-center gap-1 text-electric-cyan text-xs font-medium hover:underline shrink-0">
          <ExternalLink size={12} /> View
        </Link>
      )}
    </div>
  );
}
