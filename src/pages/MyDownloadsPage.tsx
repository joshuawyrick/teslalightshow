import { useState, useEffect, useCallback } from 'react';
import { Download, Scissors, Music, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Download as DownloadRow } from '../types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MyDownloadsPage() {
  const { user } = useAuth();
  const [downloads, setDownloads] = useState<DownloadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redownloading, setRedownloading] = useState<string | null>(null);

  const fetchDownloads = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    const { data, error: err } = await supabase
      .from('downloads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (err) {
      setError(err.message);
    } else {
      setDownloads(data ?? []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchDownloads(); }, [fetchDownloads]);

  const redownload = async (dl: DownloadRow) => {
    setRedownloading(dl.id);
    setError('');
    try {
      const { data, error: err } = await supabase.storage
        .from('downloads')
        .download(dl.storage_path);
      if (err || !data) throw new Error(err?.message || 'Could not retrieve file.');
      const bytes = new Uint8Array(await data.arrayBuffer());
      const blob = new Blob([bytes], { type: 'application/octet-stream' });
      const slug = dl.song_name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '_').slice(0, 40);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${slug}_${dl.rendition_id}${dl.is_snippet ? '_snippet' : ''}.fseq`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRedownloading(null);
    }
  };

  if (!user) {
    return (
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-text-secondary">Please log in to view your downloads.</p>
      </div>
    );
  }

  return (
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-text-primary font-heading">My Downloads</h1>
          <p className="text-text-secondary text-sm mt-1">All your generated shows. Re-downloads are always free.</p>
        </div>
        <button
          onClick={fetchDownloads}
          disabled={loading}
          className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-sm transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-accent-red/10 border border-accent-red/20 rounded-xl px-4 py-3 text-accent-red text-sm">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-text-secondary/50" />
        </div>
      ) : downloads.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-midnight border border-border flex items-center justify-center mx-auto">
            <Music size={24} className="text-text-secondary/50" />
          </div>
          <p className="text-text-secondary">No downloads yet. Generate your first show on the home page.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {downloads.map(dl => (
            <div
              key={dl.id}
              className="bg-steel border border-border hover:border-electric-blue/30 rounded-2xl p-4 flex items-center gap-4 transition-colors duration-150"
            >
              <div className="w-10 h-10 rounded-xl bg-midnight border border-border flex items-center justify-center shrink-0">
                {dl.is_snippet
                  ? <Scissors size={16} className="text-emerald-400" />
                  : <Download size={16} className="text-electric-blue" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-text-primary font-medium text-sm truncate max-w-[280px]">{dl.song_name}</p>
                  {dl.is_snippet && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full shrink-0">
                      snippet
                    </span>
                  )}
                </div>
                <p className="text-text-secondary text-xs mt-0.5">
                  {dl.rendition_name} · {dl.vehicle_model} · {formatDate(dl.created_at)}
                </p>
              </div>
              <button
                onClick={() => redownload(dl)}
                disabled={redownloading === dl.id}
                className="shrink-0 flex items-center gap-1.5 bg-charcoal hover:bg-slate border border-border hover:border-electric-blue/30 text-text-secondary hover:text-text-primary text-sm font-medium rounded-xl px-4 py-2 transition-colors duration-150"
              >
                {redownloading === dl.id
                  ? <><Loader2 size={13} className="animate-spin" /> Loading…</>
                  : <><Download size={13} /> Re-download</>
                }
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
