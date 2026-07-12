import { Video } from 'lucide-react';

export default function GalleryEmptyState({ message }: { message?: string }) {
  return (
    <div className="text-center py-16 space-y-3">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-charcoal border border-border flex items-center justify-center">
        <Video size={24} className="text-text-secondary/40" />
      </div>
      <p className="text-text-secondary/60 text-sm">{message || 'No videos found. Try adjusting your filters.'}</p>
    </div>
  );
}
