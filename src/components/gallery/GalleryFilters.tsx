import { Search } from 'lucide-react';
import { GALLERY_VEHICLE_MODELS, GALLERY_OCCASIONS, GALLERY_GENRES } from '../../lib/galleryTaxonomy';

interface GalleryFiltersProps {
  vehicle: string;
  occasion: string;
  genre: string;
  sort: string;
  search: string;
  onVehicleChange: (v: string) => void;
  onOccasionChange: (v: string) => void;
  onGenreChange: (v: string) => void;
  onSortChange: (v: string) => void;
  onSearchChange: (v: string) => void;
}

export default function GalleryFilters({
  vehicle, occasion, genre, sort, search,
  onVehicleChange, onOccasionChange, onGenreChange, onSortChange, onSearchChange,
}: GalleryFiltersProps) {
  const selectClass = "bg-midnight border border-border text-text-primary rounded-xl px-3 py-2 text-sm outline-none focus:border-electric-cyan/50 transition-colors appearance-none";

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[180px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50 pointer-events-none" />
        <input
          type="text"
          placeholder="Search shows..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full bg-midnight border border-border text-text-primary placeholder-text-secondary/50 rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-electric-cyan/50 transition-colors"
          aria-label="Search gallery"
        />
      </div>
      <select value={vehicle} onChange={e => onVehicleChange(e.target.value)} className={selectClass} aria-label="Filter by vehicle">
        <option value="">All Vehicles</option>
        {GALLERY_VEHICLE_MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
      </select>
      <select value={occasion} onChange={e => onOccasionChange(e.target.value)} className={selectClass} aria-label="Filter by occasion">
        <option value="">All Occasions</option>
        {GALLERY_OCCASIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <select value={genre} onChange={e => onGenreChange(e.target.value)} className={`${selectClass} hidden sm:block`} aria-label="Filter by genre">
        <option value="">All Genres</option>
        {GALLERY_GENRES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
      </select>
      <select value={sort} onChange={e => onSortChange(e.target.value)} className={selectClass} aria-label="Sort by">
        <option value="newest">Newest</option>
        <option value="views">Most Viewed</option>
        <option value="likes">Most Liked</option>
        <option value="featured">Featured</option>
      </select>
    </div>
  );
}
