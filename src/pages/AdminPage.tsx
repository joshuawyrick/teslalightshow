import { useState, useEffect, useCallback } from 'react';
import { Users, DollarSign, Download, Loader2, AlertCircle, Search, Plus, Trash2, RefreshCw } from 'lucide-react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface AdminStats {
  totalRevenueCents: number;
  totalUsers: number;
  totalDownloads: number;
}

interface AdminUser {
  id: string;
  email: string;
  credits: number;
  snippet_used: boolean;
  is_admin: boolean;
  created_at: string;
}

interface AdminPurchase {
  id: string;
  email: string;
  package_name: string;
  credits_purchased: number;
  amount_cents: number;
  created_at: string;
}

interface AdminVideo {
  id: string;
  title: string;
  user_id: string;
  storage_path: string;
  created_at: string;
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white/3 border border-white/8 rounded-2xl p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-white/40 text-xs font-medium">{label}</p>
        <p className="text-white font-bold text-xl mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [purchases, setPurchases] = useState<AdminPurchase[]>([]);
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [grantEmail, setGrantEmail] = useState('');
  const [grantAmount, setGrantAmount] = useState(1);
  const [grantNote, setGrantNote] = useState('');
  const [granting, setGranting] = useState(false);
  const [grantMsg, setGrantMsg] = useState('');

  const fetchData = useCallback(async () => {
    if (!user || !profile?.is_admin) return;
    setLoading(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'Apikey': SUPABASE_ANON_KEY,
      };

      const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-grants?action=dashboard`, { headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setStats(data.stats);
      setUsers(data.users);
      setPurchases(data.purchases);
      setVideos(data.videos);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const grantCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !grantEmail.trim() || grantAmount < 1) return;
    setGranting(true);
    setGrantMsg('');
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-grants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'Apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ action: 'grant', email: grantEmail.trim(), credits: grantAmount, note: grantNote.trim() || null }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.error || 'Grant failed');
      setGrantMsg(`Granted ${grantAmount} credit${grantAmount !== 1 ? 's' : ''} to ${body.recipient_email}.`);
      setGrantEmail('');
      setGrantNote('');
      fetchData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGranting(false);
    }
  };

  const deleteVideo = async (video: AdminVideo) => {
    await supabase.storage.from('gallery').remove([video.storage_path]);
    await supabase.from('gallery_videos').delete().eq('id', video.id);
    setVideos(prev => prev.filter(v => v.id !== video.id));
  };

  if (!user || !profile?.is_admin) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-white/50">Access denied.</p>
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    userSearch ? u.email.toLowerCase().includes(userSearch.toLowerCase()) : true
  );

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">TeslaLightShows.com management.</p>
        </div>
        <button onClick={fetchData} disabled={loading} className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-tesla-500/10 border border-tesla-500/20 rounded-xl px-4 py-3 text-tesla-300 text-sm">
          <AlertCircle size={15} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-white/30" />
        </div>
      ) : (
        <>
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={<DollarSign size={18} className="text-emerald-400" />} label="Total Revenue" value={`$${(stats.totalRevenueCents / 100).toFixed(2)}`} />
              <StatCard icon={<Users size={18} className="text-tesla-400" />} label="Total Users" value={stats.totalUsers.toLocaleString()} />
              <StatCard icon={<Download size={18} className="text-sky-400" />} label="Total Downloads" value={stats.totalDownloads.toLocaleString()} />
            </div>
          )}

          {/* Grant credits */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-semibold text-sm">Grant Credits</h2>
            <form onSubmit={grantCredits} className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px] space-y-1">
                <label className="text-white/40 text-xs">User email</label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={grantEmail}
                  onChange={e => setGrantEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/12 text-white placeholder-white/25 rounded-xl px-3 py-2 text-sm outline-none focus:border-tesla-500/50 transition-colors"
                />
              </div>
              <div className="w-24 space-y-1">
                <label className="text-white/40 text-xs">Credits</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={grantAmount}
                  onChange={e => setGrantAmount(parseInt(e.target.value) || 1)}
                  className="w-full bg-white/5 border border-white/12 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-tesla-500/50 transition-colors"
                />
              </div>
              <div className="flex-1 min-w-[140px] space-y-1">
                <label className="text-white/40 text-xs">Note (optional)</label>
                <input
                  type="text"
                  placeholder="Contest winner"
                  value={grantNote}
                  onChange={e => setGrantNote(e.target.value)}
                  className="w-full bg-white/5 border border-white/12 text-white placeholder-white/25 rounded-xl px-3 py-2 text-sm outline-none focus:border-tesla-500/50 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={granting}
                className="flex items-center gap-2 bg-tesla-600 hover:bg-tesla-500 disabled:bg-white/5 disabled:text-white/30 text-white text-sm font-semibold rounded-xl px-4 py-2 transition-colors"
              >
                {granting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Grant
              </button>
            </form>
            {grantMsg && <p className="text-emerald-400 text-sm">{grantMsg}</p>}
          </div>

          {/* Recent purchases */}
          <div className="space-y-3">
            <h2 className="text-white font-semibold text-sm">Recent Purchases (last 20)</h2>
            <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8">
                      <th className="text-left text-white/30 font-medium px-4 py-3">User</th>
                      <th className="text-left text-white/30 font-medium px-4 py-3">Package</th>
                      <th className="text-left text-white/30 font-medium px-4 py-3">Credits</th>
                      <th className="text-left text-white/30 font-medium px-4 py-3">Amount</th>
                      <th className="text-left text-white/30 font-medium px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.length === 0 ? (
                      <tr><td colSpan={5} className="text-center text-white/20 px-4 py-6">No purchases yet.</td></tr>
                    ) : purchases.map(p => (
                      <tr key={p.id} className="border-b border-white/5 last:border-0">
                        <td className="px-4 py-3 text-white/60 font-mono text-xs truncate max-w-[160px]">{p.email}</td>
                        <td className="px-4 py-3 text-white/70">{p.package_name}</td>
                        <td className="px-4 py-3 text-emerald-400 font-semibold">+{p.credits_purchased}</td>
                        <td className="px-4 py-3 text-white/70">${(p.amount_cents / 100).toFixed(2)}</td>
                        <td className="px-4 py-3 text-white/40 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Users table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-white font-semibold text-sm">All Users ({users.length})</h2>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search email…"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="bg-white/5 border border-white/12 text-white placeholder-white/25 rounded-xl pl-8 pr-3 py-1.5 text-sm outline-none focus:border-tesla-500/50 w-48 transition-colors"
                />
              </div>
            </div>
            <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8">
                      <th className="text-left text-white/30 font-medium px-4 py-3">Email</th>
                      <th className="text-left text-white/30 font-medium px-4 py-3">Credits</th>
                      <th className="text-left text-white/30 font-medium px-4 py-3">Snippet</th>
                      <th className="text-left text-white/30 font-medium px-4 py-3">Admin</th>
                      <th className="text-left text-white/30 font-medium px-4 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={5} className="text-center text-white/20 px-4 py-6">No users found.</td></tr>
                    ) : filteredUsers.map(u => (
                      <tr key={u.id} className="border-b border-white/5 last:border-0">
                        <td className="px-4 py-3 text-white/70 font-mono text-xs max-w-[200px] truncate">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${u.credits > 0 ? 'text-emerald-400' : 'text-white/30'}`}>{u.credits}</span>
                        </td>
                        <td className="px-4 py-3 text-white/40">{u.snippet_used ? 'Used' : 'Available'}</td>
                        <td className="px-4 py-3 text-white/40">{u.is_admin ? <span className="text-tesla-400 font-semibold">Yes</span> : '—'}</td>
                        <td className="px-4 py-3 text-white/40 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Gallery videos */}
          <div className="space-y-3">
            <h2 className="text-white font-semibold text-sm">Gallery Videos ({videos.length})</h2>
            {videos.length === 0 ? (
              <p className="text-white/30 text-sm">No gallery videos.</p>
            ) : (
              <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/8">
                        <th className="text-left text-white/30 font-medium px-4 py-3">Title</th>
                        <th className="text-left text-white/30 font-medium px-4 py-3">Uploaded</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {videos.map(v => (
                        <tr key={v.id} className="border-b border-white/5 last:border-0">
                          <td className="px-4 py-3 text-white/70 max-w-[280px] truncate">{v.title}</td>
                          <td className="px-4 py-3 text-white/40 text-xs">{new Date(v.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => deleteVideo(v)} className="text-white/30 hover:text-tesla-400 transition-colors p-1.5 hover:bg-tesla-500/10 rounded-lg">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
