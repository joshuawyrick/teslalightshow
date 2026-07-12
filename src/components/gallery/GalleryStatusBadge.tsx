import type { GalleryUploadStatus, GalleryModerationStatus } from '../../types';

interface GalleryStatusBadgeProps {
  uploadStatus: GalleryUploadStatus;
  moderationStatus: GalleryModerationStatus;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  'pending_upload': { label: 'Ready to upload', color: 'bg-slate text-text-secondary' },
  'uploading': { label: 'Uploading', color: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
  'processing': { label: 'Processing video', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  'error': { label: 'Upload failed', color: 'bg-accent-red/15 text-accent-red border-accent-red/30' },
  'cancelled': { label: 'Cancelled', color: 'bg-slate text-text-secondary/60' },
  'pending': { label: 'Awaiting review', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  'approved': { label: 'Published', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  'rejected': { label: 'Needs changes', color: 'bg-accent-red/15 text-accent-red border-accent-red/30' },
  'removed': { label: 'Removed', color: 'bg-slate text-text-secondary/60' },
};

export default function GalleryStatusBadge({ uploadStatus, moderationStatus }: GalleryStatusBadgeProps) {
  let key: string;
  if (uploadStatus !== 'ready') {
    key = uploadStatus;
  } else {
    key = moderationStatus;
  }

  const config = STATUS_CONFIG[key] || { label: key, color: 'bg-slate text-text-secondary' };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
}
