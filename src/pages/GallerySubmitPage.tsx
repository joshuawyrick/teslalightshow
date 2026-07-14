import { useState, useRef, useEffect } from 'react';
import { Upload, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGalleryUpload } from '../hooks/useGalleryUpload';
import { GALLERY_VEHICLE_MODELS, GALLERY_OCCASIONS, GALLERY_GENRES } from '../lib/galleryTaxonomy';
import GalleryUploadProgress from '../components/gallery/GalleryUploadProgress';
import SeoHead from '../components/SeoHead';
import type { TeslaVehicleModel } from '../types';

interface GallerySubmitPageProps {
  onOpenAuth: () => void;
}

export default function GallerySubmitPage({ onOpenAuth }: GallerySubmitPageProps) {
  const { user } = useAuth();
  const { state, progress, error, startUpload, cancel, pause, resume, reset } = useGalleryUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [vehicleModel, setVehicleModel] = useState<TeslaVehicleModel | ''>('');
  const [occasion, setOccasion] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [genre, setGenre] = useState('');
  const [story, setStory] = useState('');
  const [attested, setAttested] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!user) onOpenAuth();
  }, [user, onOpenAuth]);

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state === 'uploading' || state === 'retrying' || state === 'paused') {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setValidationError('');

    if (selected.size > 3 * 1024 * 1024 * 1024) {
      setValidationError('File too large. Maximum size is 3 GB.');
      return;
    }

    if (filePreview) URL.revokeObjectURL(filePreview);
    setFile(selected);
    setFilePreview(URL.createObjectURL(selected));

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      setDuration(video.duration);
      if (video.duration > 300) {
        setValidationError('Video too long. Maximum duration is 5 minutes.');
      }
      URL.revokeObjectURL(video.src);
    };
    video.src = URL.createObjectURL(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!file) { setValidationError('Please select a video'); return; }
    if (!title.trim() || title.trim().length < 2) { setValidationError('Title must be at least 2 characters'); return; }
    if (!vehicleModel) { setValidationError('Please select a vehicle model'); return; }
    if (!attested) { setValidationError('You must agree to the terms'); return; }
    if (duration && duration > 300) { setValidationError('Video too long (max 5 minutes)'); return; }

    await startUpload(file, {
      title: title.trim(),
      vehicleModel: vehicleModel as TeslaVehicleModel,
      occasion: occasion || null,
      songTitle: songTitle.trim() || null,
      artistName: artistName.trim() || null,
      genre: genre || null,
      story: story.trim() || null,
      rightsAttested: true,
    });
  };

  const isUploading = ['creating_submission', 'uploading', 'paused', 'retrying', 'processing', 'validating'].includes(state);
  const isDone = state === 'submitted';

  if (!user) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <SeoHead title="Submit Your Tesla Light Show | EVLightShows.com" description="Upload a video of your Tesla playing a custom light show." canonical="https://evlightshows.com/tesla-light-show-gallery/submit" noindex />
        <p className="text-text-secondary">Please sign in to submit a video.</p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <SeoHead title="Submit Your Tesla Light Show | EVLightShows.com" description="Upload a video of your Tesla playing a custom light show." canonical="https://evlightshows.com/tesla-light-show-gallery/submit" noindex />

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-text-primary">Share Your Tesla Light Show</h1>
        <p className="text-text-secondary text-sm">Upload a video of your vehicle playing a show generated with EVLightShows.com.</p>
      </div>

      {isDone ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-3">
          <CheckCircle2 size={32} className="text-emerald-400 mx-auto" />
          <p className="text-text-primary font-medium">Submitted successfully</p>
          <p className="text-text-secondary text-sm">Your video is being processed by Cloudflare and will be reviewed by our team. You can track status in My Submissions.</p>
          <button onClick={reset} className="text-electric-cyan text-sm font-medium hover:underline">Submit another</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File input */}
          <div className="space-y-2">
            <label className="text-text-primary text-sm font-medium">Video</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-electric-cyan/40 rounded-2xl p-8 text-center cursor-pointer transition-colors"
            >
              {file ? (
                <div className="space-y-2">
                  <p className="text-text-primary text-sm font-medium truncate">{file.name}</p>
                  <p className="text-text-secondary text-xs">
                    {(file.size / 1048576).toFixed(1)} MB
                    {duration ? ` | ${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}` : ''}
                  </p>
                  <p className="text-electric-cyan text-xs">Click to change</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload size={24} className="text-text-secondary/50 mx-auto" />
                  <p className="text-text-secondary text-sm">Tap to select a video</p>
                  <p className="text-text-secondary/50 text-xs">Max 5 minutes, up to 3 GB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Select video file"
            />
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label htmlFor="gallery-title" className="text-text-primary text-sm font-medium">Light Show Title</label>
            <input
              id="gallery-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={100}
              placeholder="e.g. Happy Birthday EDM Light Show"
              className="w-full bg-midnight border border-border text-text-primary placeholder-text-secondary/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-electric-cyan/50 transition-colors"
              disabled={isUploading}
            />
          </div>

          {/* Vehicle model */}
          <div className="space-y-1">
            <label htmlFor="gallery-vehicle" className="text-text-primary text-sm font-medium">Vehicle Model</label>
            <select
              id="gallery-vehicle"
              value={vehicleModel}
              onChange={e => setVehicleModel(e.target.value as TeslaVehicleModel)}
              className="w-full bg-midnight border border-border text-text-primary rounded-xl px-4 py-3 text-sm outline-none focus:border-electric-cyan/50 transition-colors appearance-none"
              disabled={isUploading}
            >
              <option value="">Select your vehicle</option>
              {GALLERY_VEHICLE_MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          {/* Optional details disclosure */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-electric-cyan text-sm font-medium"
          >
            <ChevronDown size={14} className={`transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            {showDetails ? 'Hide details' : 'Add occasion or song details'}
          </button>

          {showDetails && (
            <div className="space-y-4 pl-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="gallery-occasion" className="text-text-secondary text-xs">Occasion</label>
                  <select id="gallery-occasion" value={occasion} onChange={e => setOccasion(e.target.value)} className="w-full bg-midnight border border-border text-text-primary rounded-xl px-3 py-2 text-sm outline-none focus:border-electric-cyan/50 transition-colors appearance-none" disabled={isUploading}>
                    <option value="">None</option>
                    {GALLERY_OCCASIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="gallery-genre" className="text-text-secondary text-xs">Music Genre</label>
                  <select id="gallery-genre" value={genre} onChange={e => setGenre(e.target.value)} className="w-full bg-midnight border border-border text-text-primary rounded-xl px-3 py-2 text-sm outline-none focus:border-electric-cyan/50 transition-colors appearance-none" disabled={isUploading}>
                    <option value="">None</option>
                    {GALLERY_GENRES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="gallery-song" className="text-text-secondary text-xs">Song Title</label>
                  <input id="gallery-song" type="text" value={songTitle} onChange={e => setSongTitle(e.target.value)} maxLength={120} placeholder="Song name" className="w-full bg-midnight border border-border text-text-primary placeholder-text-secondary/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-electric-cyan/50 transition-colors" disabled={isUploading} />
                </div>
                <div className="space-y-1">
                  <label htmlFor="gallery-artist" className="text-text-secondary text-xs">Artist / Remix</label>
                  <input id="gallery-artist" type="text" value={artistName} onChange={e => setArtistName(e.target.value)} maxLength={120} placeholder="Artist name" className="w-full bg-midnight border border-border text-text-primary placeholder-text-secondary/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-electric-cyan/50 transition-colors" disabled={isUploading} />
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="gallery-story" className="text-text-secondary text-xs">Short Story / Description</label>
                <textarea id="gallery-story" value={story} onChange={e => setStory(e.target.value)} maxLength={500} rows={3} placeholder="What makes this show special?" className="w-full bg-midnight border border-border text-text-primary placeholder-text-secondary/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-electric-cyan/50 transition-colors resize-none" disabled={isUploading} />
              </div>
            </div>
          )}

          {/* Upload progress */}
          {isUploading && (
            <GalleryUploadProgress
              state={state}
              percent={progress.percent}
              bytesUploaded={progress.bytesUploaded}
              bytesTotal={progress.bytesTotal}
              error={error}
              onCancel={cancel}
              onPause={pause}
              onResume={resume}
            />
          )}

          {/* Attestation */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={attested}
              onChange={e => setAttested(e.target.checked)}
              className="mt-0.5 accent-electric-cyan w-4 h-4"
              disabled={isUploading}
            />
            <span className="text-text-secondary text-xs leading-relaxed">
              I confirm that I recorded this video or have permission to submit it, and that I have the rights needed for the video and audio to be displayed on EVLightShows.com. I agree to the{' '}
              <a href="/terms" className="text-electric-cyan hover:underline">Terms</a> and{' '}
              <a href="/copyright-music-upload-policy" className="text-electric-cyan hover:underline">Copyright & Music Upload Policy</a>.
            </span>
          </label>

          {/* Errors */}
          {(validationError || (state === 'error' && error)) && (
            <div className="flex items-start gap-2 bg-accent-red/10 border border-accent-red/20 rounded-xl px-4 py-3">
              <AlertCircle size={14} className="shrink-0 mt-0.5 text-accent-red" />
              <p className="text-accent-red text-xs">{validationError || error}</p>
            </div>
          )}

          {/* Submit */}
          {!isUploading && (
            <button
              type="submit"
              disabled={!file || !title.trim() || !vehicleModel || !attested}
              className="w-full bg-accent-red hover:bg-accent-red/90 disabled:bg-steel disabled:text-text-secondary/30 text-white text-sm font-semibold rounded-xl px-6 py-3.5 transition-all glow-red"
            >
              Upload Light Show
            </button>
          )}
        </form>
      )}
    </main>
  );
}
