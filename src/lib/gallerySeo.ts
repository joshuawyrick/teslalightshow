import type { GalleryVideo } from '../types';

const SITE = 'https://teslalightshows.com';

export function buildVideoPageTitle(video: GalleryVideo): string {
  const parts: string[] = [];
  if (video.song_title) parts.push(video.song_title);
  if (video.genre) parts.push(video.genre.toUpperCase());
  if (video.vehicle_model) {
    const modelNames: Record<string, string> = {
      'model-3': 'Tesla Model 3',
      'model-y': 'Tesla Model Y',
      'model-s': 'Tesla Model S',
      'model-x': 'Tesla Model X',
      'cybertruck': 'Cybertruck',
      'other': 'Tesla',
    };
    parts.push(modelNames[video.vehicle_model] || 'Tesla');
  }
  parts.push('Light Show');
  return `${parts.join(' ')} | TeslaLightShows.com`;
}

export function buildVideoPageDescription(video: GalleryVideo): string {
  const model = video.vehicle_model
    ? { 'model-3': 'Model 3', 'model-y': 'Model Y', 'model-s': 'Model S', 'model-x': 'Model X', 'cybertruck': 'Cybertruck', 'other': 'Tesla' }[video.vehicle_model] || 'Tesla'
    : 'Tesla';
  const song = video.song_title ? ` featuring "${video.song_title}"` : '';
  return `Watch a custom ${model} light show${song} submitted by the TeslaLightShows.com community. Explore more AI-generated Tesla light shows.`;
}

export function buildVideoCanonical(slug: string): string {
  return `${SITE}/tesla-light-show-gallery/show/${slug}`;
}

export function buildVideoJsonLd(video: GalleryVideo): Record<string, unknown> {
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: buildVideoPageDescription(video),
    uploadDate: video.approved_at || video.created_at,
  };

  if (video.thumbnail_url) {
    ld.thumbnailUrl = [video.thumbnail_url];
  }

  if (video.duration_seconds) {
    const mins = Math.floor(video.duration_seconds / 60);
    const secs = Math.round(video.duration_seconds % 60);
    ld.duration = `PT${mins}M${secs}S`;
  }

  if (video.slug) {
    ld.url = buildVideoCanonical(video.slug);
  }

  if (video.view_count > 0) {
    ld.interactionStatistic = {
      '@type': 'InteractionCounter',
      interactionType: { '@type': 'WatchAction' },
      userInteractionCount: video.view_count,
    };
  }

  return ld;
}

export function buildBreadcrumbJsonLd(videoTitle: string, slug: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Gallery', item: `${SITE}/tesla-light-show-gallery` },
      { '@type': 'ListItem', position: 3, name: videoTitle, item: buildVideoCanonical(slug) },
    ],
  };
}
