import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGalleryVideos } from '../hooks/useGalleryVideos';
import GalleryVideoCard from '../components/gallery/GalleryVideoCard';
import GalleryFilters from '../components/gallery/GalleryFilters';
import GalleryEmptyState from '../components/gallery/GalleryEmptyState';
import SeoHead from '../components/SeoHead';

interface GalleryPageProps {
  onNavigate?: (path: string) => void;
}

export default function GalleryPage({ onNavigate }: GalleryPageProps) {
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState('');
  const [occasion, setOccasion] = useState('');
  const [genre, setGenre] = useState('');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');

  const { videos, loading, hasMore, loadMore } = useGalleryVideos({
    vehicle: vehicle || null,
    occasion: occasion || null,
    genre: genre || null,
    search: search || undefined,
    sort: sort as 'newest' | 'views' | 'likes' | 'featured',
  });

  return (
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <SeoHead
        title="Tesla Light Show Gallery - Community Videos | EVLightShows.com"
        description="Watch real Tesla light shows created by the EVLightShows.com community. Browse by vehicle, occasion, and genre. Share your own custom light show video."
        canonical="https://evlightshows.com/tesla-light-show-gallery"
      />

      {/* Hero section */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-text-primary">Community Gallery</h1>
          <p className="text-text-secondary text-sm max-w-lg">Real Tesla light shows created with our AI generator. Watch the community's best submissions or share your own.</p>
        </div>
        {user && (
          <Link
            to="/tesla-light-show-gallery/submit"
            className="inline-flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white text-sm font-semibold rounded-xl px-5 py-2.5 transition-all glow-red shrink-0"
          >
            <Upload size={14} />
            Submit Video
          </Link>
        )}
      </div>

      {/* Filters */}
      <GalleryFilters
        vehicle={vehicle}
        occasion={occasion}
        genre={genre}
        sort={sort}
        search={search}
        onVehicleChange={setVehicle}
        onOccasionChange={setOccasion}
        onGenreChange={setGenre}
        onSortChange={setSort}
        onSearchChange={setSearch}
      />

      {/* Video grid */}
      {loading && videos.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-text-secondary/50" />
        </div>
      ) : videos.length === 0 ? (
        <GalleryEmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {videos.map(v => (
              <GalleryVideoCard key={v.id} video={v} onNavigate={onNavigate} />
            ))}
          </div>

          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-steel hover:bg-charcoal border border-border text-text-secondary hover:text-text-primary text-sm font-medium rounded-xl px-6 py-3 transition-all disabled:opacity-50"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Load More
              </button>
            </div>
          )}
        </>
      )}

      {/* CTA for non-signed-in users */}
      {!user && (
        <div className="bg-charcoal border border-border rounded-2xl p-6 sm:p-8 text-center space-y-4">
          <p className="text-text-primary font-display font-bold text-lg">Have a Tesla Light Show to Share?</p>
          <p className="text-text-secondary text-sm max-w-md mx-auto">Sign in to submit a video of your Tesla playing a custom AI-generated light show.</p>
          <a
            href="/tesla-light-show-generator#upload"
            onClick={e => { if (onNavigate) { e.preventDefault(); onNavigate('/tesla-light-show-generator#upload'); } }}
            className="inline-flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white text-sm font-semibold rounded-xl px-6 py-3 transition-all glow-red"
          >
            Generate My Light Show
          </a>
        </div>
      )}
    </main>
  );
}
