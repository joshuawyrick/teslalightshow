import { useState } from 'react';
import { getStreamPlayerUrl, getSignedStreamPlayerUrl, isStreamConfigured } from '../../lib/cloudflareStream';

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
      <div className="aspect-video bg-midnight border border-border rounded-xl flex items-center justify-center">
        <p className="text-text-secondary text-sm">Stream player not configured</p>
      </div>
    );
  }

  const playerUrl = signedToken
    ? getSignedStreamPlayerUrl(signedToken)
    : getStreamPlayerUrl(videoUid);

  if (!playerUrl || loadError) {
    return (
      <div className="aspect-video bg-midnight border border-border rounded-xl flex items-center justify-center">
        <p className="text-text-secondary text-sm">Video unavailable</p>
      </div>
    );
  }

  const aspectRatio = width && height ? `${width} / ${height}` : '16 / 9';

  return (
    <div className="w-full rounded-xl overflow-hidden bg-black" style={{ aspectRatio }}>
      <iframe
        src={playerUrl}
        loading="lazy"
        allowFullScreen
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        title={title || 'Tesla Light Show Video'}
        className="w-full h-full border-0"
      />
    </div>
  );
}
