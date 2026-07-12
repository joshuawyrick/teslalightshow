import { Upload, X, Pause, Play } from 'lucide-react';
import type { UploadState } from '../../hooks/useGalleryUpload';

interface GalleryUploadProgressProps {
  state: UploadState;
  percent: number;
  bytesUploaded: number;
  bytesTotal: number;
  error: string | null;
  onCancel: () => void;
  onPause: () => void;
  onResume: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
}

export default function GalleryUploadProgress({
  state, percent, bytesUploaded, bytesTotal, error, onCancel, onPause, onResume,
}: GalleryUploadProgressProps) {
  const isActive = state === 'uploading' || state === 'retrying';
  const isPaused = state === 'paused';

  return (
    <div className="bg-charcoal border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Upload size={16} className="text-electric-cyan" />
          <span className="text-text-primary text-sm font-medium">
            {state === 'retrying' && 'Reconnecting...'}
            {state === 'uploading' && 'Uploading'}
            {state === 'paused' && 'Paused'}
            {state === 'processing' && 'Processing video...'}
            {state === 'submitted' && 'Submitted for review'}
            {state === 'error' && 'Upload failed'}
            {state === 'creating_submission' && 'Creating submission...'}
            {state === 'validating' && 'Validating...'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <button onClick={onPause} className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors" aria-label="Pause upload">
              <Pause size={14} />
            </button>
          )}
          {isPaused && (
            <button onClick={onResume} className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors" aria-label="Resume upload">
              <Play size={14} />
            </button>
          )}
          {(isActive || isPaused) && (
            <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-accent-red/10 text-text-secondary hover:text-accent-red transition-colors" aria-label="Cancel upload">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {(isActive || isPaused) && (
        <>
          <div className="w-full h-2 bg-midnight rounded-full overflow-hidden">
            <div
              className="h-full bg-electric-cyan rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>{formatBytes(bytesUploaded)} / {formatBytes(bytesTotal)}</span>
            <span className="font-medium text-electric-cyan">{percent}%</span>
          </div>
        </>
      )}

      {state === 'processing' && (
        <p className="text-text-secondary text-xs">
          Your video is being processed by Cloudflare. This usually takes 1-3 minutes. You can close this page safely.
        </p>
      )}

      {state === 'submitted' && (
        <p className="text-emerald-400 text-xs">
          Your light show has been submitted for review. You will be able to see it once approved.
        </p>
      )}

      {state === 'error' && error && (
        <p className="text-accent-red text-xs">{error}</p>
      )}
    </div>
  );
}
