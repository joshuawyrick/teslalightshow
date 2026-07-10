import { useState, useEffect, useCallback } from 'react';
import { Download, Scissors, Music, Loader2, RefreshCw, AlertCircle, Trash2, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Download as DownloadRow } from '../types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysUntil(iso: string): number {
  const now = new Date();
  const target = new Date(iso);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function expirationLabel(iso: string): { text: string; urgent: boolean } {
  const days = daysUntil(iso);
  if (days === 0) return { text: 'Expires today', urgent: true };
  if (days === 1) return { text: 'Expires tomorrow', urgent: true };
  if (days <= 7) return { text: `Expires in ${days} days`, urgent: true };
  return { text: `Expires ${formatDate(iso)}`, urgent: false };
}

export default function MyDownloadsPage() {
  const { user } = useAuth();
  const [downloads, setDownloads] = useState<DownloadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redownloading, setRedownloading] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  const deleteDownload = async (dl: DownloadRow) => {
    setDeletingId(dl.id);
    setError('');
    try {
      const { error: storageErr } = await supabase.storage
        .from('downloads')
        .remove([dl.storage_path]);
      if (storageErr) throw new Error(`Storage: ${storageErr.message}`);

      const { error: dbErr } = await supabase
        .from('downloads')
        .delete()
        .eq('id', dl.id);
      if (dbErr) throw new Error(`Database: ${dbErr.message}`);

      setDownloads(prev => prev.filter(d => d.id !== dl.id));
      setConfirmDeleteId(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeletingId(null);
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
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 sm:space-y-8">
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl text-text-primary font-heading">My Downloads</h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">Re-downloads are free. Files expire after 30 days.</p>
        </div>
        <button
          onClick={fetchDownloads}
          disabled={loading}
          className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-sm transition-colors shrink-0"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
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
          {downloads.map(dl => {
            const expiry = dl.expires_at ? expirationLabel(dl.expires_at) : null;
            const isConfirming = confirmDeleteId === dl.id;
            const isDeleting = deletingId === dl.id;

            return (
              <div
                key={dl.id}
                className="bg-steel border border-border hover:border-electric-cyan/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 transition-colors duration-150"
              >
                <div className="w-10 h-10 rounded-xl bg-midnight border border-border flex items-center justify-center shrink-0">
                  {dl.is_snippet
                    ? <Scissors size={16} className="text-electric-cyan" />
                    : <Download size={16} className="text-electric-cyan" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-text-primary font-medium text-sm truncate max-w-[200px] sm:max-w-[280px]">{dl.song_name}</p>
                    {dl.is_snippet && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-electric-cyan/15 text-electric-cyan border border-electric-cyan/25 px-2 py-0.5 rounded-full shrink-0">
                        snippet
                      </span>
                    )}
                  </div>
                  <p className="text-text-secondary text-xs mt-0.5">
                    {dl.rendition_name} · {dl.vehicle_model} · {formatDate(dl.created_at)}
                  </p>
                  {expiry && (
                    <p className={`text-xs mt-1 flex items-center gap-1 ${expiry.urgent ? 'text-amber-400' : 'text-text-secondary/60'}`}>
                      <Clock size={11} className="shrink-0" />
                      {expiry.text}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {isConfirming ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => deleteDownload(dl)}
                        disabled={isDeleting}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-accent-red/15 hover:bg-accent-red/25 border border-accent-red/30 text-accent-red text-sm font-medium rounded-xl px-3 py-2.5 transition-colors duration-150"
                      >
                        {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        {isDeleting ? 'Deleting...' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        disabled={isDeleting}
                        className="flex-1 sm:flex-none flex items-center justify-center text-text-secondary hover:text-text-primary text-sm font-medium rounded-xl px-3 py-2.5 border border-border hover:border-electric-cyan/30 transition-colors duration-150"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => redownload(dl)}
                        disabled={redownloading === dl.id}
                        className="shrink-0 flex items-center gap-1.5 bg-charcoal hover:bg-slate border border-border hover:border-electric-cyan/30 text-text-secondary hover:text-text-primary text-sm font-medium rounded-xl px-4 py-2.5 transition-colors duration-150 flex-1 sm:flex-none justify-center"
                      >
                        {redownloading === dl.id
                          ? <><Loader2 size={13} className="animate-spin" /> Loading...</>
                          : <><Download size={13} /> Re-download</>
                        }
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(dl.id)}
                        className="shrink-0 flex items-center justify-center gap-1.5 bg-charcoal hover:bg-accent-red/10 border border-border hover:border-accent-red/30 text-text-secondary hover:text-accent-red text-sm font-medium rounded-xl px-3 py-2.5 transition-colors duration-150"
                        title="Delete download"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
