import { useState } from 'react';
import { getStreamPlayerUrl, getSignedStreamPlayerUrl, isStreamConfigured, getVideoLayout } from '../../lib/cloudflareStream';

interface CloudflareStreamPlayerProps {
  videoUid: string;
  signedToken?: string | null;
  width?: number | null;
  height?: number | null;
  title?: string;
}

export default function CloudflareStreamPlayer({ videoUid, signedToken, width, height, title }: CloudflareStreamPlayerProps) {
  const [loadError, setLoadError] = useState(false);

  if (!isStreamConfigured()) {
    return (
      <div className="w-full flex justify-center">
        <div className="w-full aspect-video bg-midnight border border-border rounded-xl flex items-center justify-center" style={{ maxWidth: '960px' }}>
          <p className="text-text-secondary text-sm">Stream player not configured</p>
        </div>
      </div>
    );
  }

  const playerUrl = signedToken
    ? getSignedStreamPlayerUrl(signedToken)
    : getStreamPlayerUrl(videoUid);

  const { aspectRatio, maxWidth } = getVideoLayout(width, height);

  if (!playerUrl || loadError) {
    return (
      <div className="w-full flex justify-center">
        <div className="w-full bg-midnight border border-border rounded-xl flex items-center justify-center" style={{ aspectRatio, maxWidth }}>
          <p className="text-text-secondary text-sm">Video unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div className="w-full rounded-xl overflow-hidden bg-black" style={{ aspectRatio, maxWidth }}>
        <iframe
          src={playerUrl}
          loading="lazy"
          allowFullScreen
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          title={title || 'EV Light Show Video'}
          className="w-full h-full border-0"
          onError={() => setLoadError(true)}
        />
      </div>
    </div>
  );
}
