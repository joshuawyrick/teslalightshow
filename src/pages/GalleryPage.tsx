import { useState, useEffect, useCallback, useRef } from 'react';
import { Upload, Trash2, Loader2, AlertCircle, Play, Pause } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { GalleryVideo } from '../types';

function VideoCard({ video, canDelete, onDelete }: {
  video: GalleryVideo;
  canDelete: boolean;
  onDelete: (id: string) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [url, setUrl] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const { data } = supabase.storage.from('gallery').getPublicUrl(video.storage_path);
    setUrl(data.publicUrl);
  }, [video.storage_path]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); setPlaying(false); }
    else { videoRef.current.play(); setPlaying(true); }
  };

  return (
    <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-colors duration-200">
      <div className="relative aspect-video bg-black group">
        {url && (
          <video
            ref={videoRef}
            src={url}
            className="w-full h-full object-cover"
            onEnded={() => setPlaying(false)}
            preload="metadata"
          />
        )}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
            {playing ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white ml-0.5" />}
          </div>
        </button>
      </div>
      <div className="p-4 flex items-center justify-between gap-3">
        <p className="text-white font-medium text-sm truncate">{video.title}</p>
        {canDelete && (
          <button
            onClick={() => onDelete(video.id)}
            className="shrink-0 text-white/30 hover:text-tesla-400 transition-colors duration-150 p-1.5 hover:bg-tesla-500/10 rounded-lg"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const { user, profile } = useAuth();
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('gallery_videos')
      .select('*')
      .order('created_at', { ascending: false });
    if (!err) setVideos(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 100 * 1024 * 1024) {
      setError('Video must be under 100 MB.');
      return;
    }
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowed.includes(f.type)) {
      setError('Only MP4, WebM, or MOV files are supported.');
      return;
    }
    setFile(f);
    setError('');
  };

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim() || !user) return;
    setUploading(true);
    setError('');
    try {
      const ext = file.name.split('.').pop() || 'mp4';
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('gallery')
        .upload(path, file, { contentType: file.type });
      if (uploadErr) throw new Error(uploadErr.message);

      const { error: insertErr } = await supabase
        .from('gallery_videos')
        .insert({ user_id: user.id, title: title.trim(), storage_path: path });
      if (insertErr) {
        await supabase.storage.from('gallery').remove([path]);
        throw new Error(insertErr.message);
      }
      setTitle('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 2000);
      fetchVideos();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const deleteVideo = async (id: string) => {
    const video = videos.find(v => v.id === id);
    if (!video) return;
    const { error: storageErr } = await supabase.storage.from('gallery').remove([video.storage_path]);
    if (storageErr) { setError(storageErr.message); return; }
    const { error: dbErr } = await supabase.from('gallery_videos').delete().eq('id', id);
    if (dbErr) { setError(dbErr.message); return; }
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Gallery</h1>
        <p className="text-white/40 text-sm mt-1">Tesla light shows from the community.</p>
      </div>

      {user && (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-sm">Share your show</h2>
          <form onSubmit={upload} className="space-y-3">
            <input
              type="text"
              placeholder="Show title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={80}
              required
              className="w-full bg-white/5 border border-white/12 text-white placeholder-white/25 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-tesla-500/50 transition-colors"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center gap-3 bg-white/5 border border-dashed rounded-xl px-4 py-3 cursor-pointer transition-colors duration-150 ${file ? 'border-emerald-500/40' : 'border-white/15 hover:border-white/30'}`}
            >
              <Upload size={16} className="text-white/30 shrink-0" />
              <span className="text-sm text-white/50 truncate">{file ? file.name : 'Upload MP4, WebM, or MOV — max 100 MB'}</span>
              <input ref={fileInputRef} type="file" accept="video/mp4,video/webm,video/quicktime,.mov" onChange={handleFileChange} className="sr-only" />
            </div>
            {error && (
              <div className="flex items-start gap-2 bg-tesla-500/10 border border-tesla-500/20 rounded-xl px-3 py-2.5 text-tesla-300 text-sm">
                <AlertCircle size={14} className="shrink-0 mt-0.5" /> {error}
              </div>
            )}
            {uploadSuccess && (
              <p className="text-emerald-400 text-sm">Video uploaded successfully!</p>
            )}
            <button
              type="submit"
              disabled={uploading || !file || !title.trim()}
              className="flex items-center gap-2 bg-tesla-600 hover:bg-tesla-500 disabled:bg-white/5 disabled:text-white/30 text-white text-sm font-semibold rounded-xl px-5 py-2.5 transition-colors duration-150"
            >
              {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : <><Upload size={14} /> Upload video</>}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-white/30" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/30">No videos yet. Be the first to share your show!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map(v => (
            <VideoCard
              key={v.id}
              video={v}
              canDelete={user?.id === v.user_id || profile?.is_admin === true}
              onDelete={deleteVideo}
            />
          ))}
        </div>
      )}
    </main>
  );
}
