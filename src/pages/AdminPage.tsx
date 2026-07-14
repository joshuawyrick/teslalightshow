import GalleryModerationPanel from './admin/GalleryModerationPanel';
import { useState, useEffect, useCallback } from 'react';
import { Users, DollarSign, Download, Loader2, AlertCircle, Search, Plus, Minus, Trash2, RefreshCw, ShieldCheck, UserPlus, X, Video, ExternalLink } from 'lucide-react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { extractYouTubeId, getYouTubeThumbnail } from '../lib/youtube';

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
  admin_role: string | null;
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
  storage_path: string | null;
  youtube_id: string | null;
  description: string | null;
  created_at: string;
}

interface AdminEntry {
  id: string;
  email: string;
  admin_role: string;
  created_at: string;
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-steel border border-border rounded-2xl p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-midnight border border-border flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-text-secondary/60 text-xs font-medium">{label}</p>
        <p className="text-text-primary font-bold text-xl mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    owner: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    editor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    viewer: 'bg-white/5 text-white/50 border-white/15',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${colors[role] ?? colors.viewer}`}>
      {role}
    </span>
  );
}

export default function AdminPage() {
  const { user, profile } = useAuth();
  const [callerRole, setCallerRole] = useState<string>('viewer');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [purchases, setPurchases] = useState<AdminPurchase[]>([]);
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [admins, setAdmins] = useState<AdminEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Adjust credits state
  const [grantEmail, setGrantEmail] = useState('');
  const [grantAmount, setGrantAmount] = useState(1);
  const [grantNote, setGrantNote] = useState('');
  const [granting, setGranting] = useState(false);
  const [grantMsg, setGrantMsg] = useState('');
  const [quickAdjusting, setQuickAdjusting] = useState<string | null>(null);

  // Manage admins state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminRole, setAdminRole] = useState<string>('viewer');
  const [managingAdmin, setManagingAdmin] = useState(false);
  const [adminMsg, setAdminMsg] = useState('');

  // YouTube video management state
  const [ytUrl, setYtUrl] = useState('');
  const [ytTitle, setYtTitle] = useState('');
  const [ytDescription, setYtDescription] = useState('');
  const [addingVideo, setAddingVideo] = useState(false);
  const [videoMsg, setVideoMsg] = useState('');

  const canEdit = callerRole === 'owner' || callerRole === 'editor';
  const isOwner = callerRole === 'owner';

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
      setCallerRole(data.callerRole ?? 'viewer');
      setStats(data.stats);
      setUsers(data.users);
      setPurchases(data.purchases);
      setVideos(data.videos);
      setAdmins(data.admins ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const callAdminAction = async (body: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');
    const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-grants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'Apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    });
    const result = await res.json();
    if (!res.ok || result.error) throw new Error(result.error || 'Request failed');
    return result;
  };

  const grantCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !grantEmail.trim() || grantAmount === 0) return;
    setGranting(true);
    setGrantMsg('');
    setError('');
    try {
      const result = await callAdminAction({ action: 'grant', email: grantEmail.trim(), credits: grantAmount, note: grantNote.trim() || null });
      const abs = Math.abs(grantAmount);
      const verb = grantAmount > 0 ? 'Granted' : 'Deducted';
      setGrantMsg(`${verb} ${abs} credit${abs !== 1 ? 's' : ''} ${grantAmount > 0 ? 'to' : 'from'} ${result.recipient_email || grantEmail}.`);
      setGrantEmail('');
      setGrantNote('');
      fetchData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGranting(false);
    }
  };

  const quickAdjust = async (email: string, amount: number) => {
    if (!canEdit) return;
    setQuickAdjusting(email);
    setError('');
    try {
      await callAdminAction({ action: 'grant', email, credits: amount, note: `Quick ${amount > 0 ? '+1' : '-1'} from admin` });
      fetchData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setQuickAdjusting(null);
    }
  };

  const deleteVideo = async (video: AdminVideo) => {
    setError('');
    try {
      await callAdminAction({ action: 'delete_video', video_id: video.id, storage_path: video.storage_path || null });
      setVideos(prev => prev.filter(v => v.id !== video.id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const addYouTubeVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVideoMsg('');
    const youtubeId = extractYouTubeId(ytUrl.trim());
    if (!youtubeId) {
      setError('Invalid YouTube URL. Paste a full youtube.com or youtu.be link.');
      return;
    }
    if (!ytTitle.trim()) {
      setError('Title is required.');
      return;
    }
    setAddingVideo(true);
    try {
      await callAdminAction({
        action: 'add_youtube_video',
        title: ytTitle.trim(),
        youtube_id: youtubeId,
        description: ytDescription.trim() || null,
      });
      setVideoMsg(`Added "${ytTitle.trim()}" to the gallery.`);
      setYtUrl('');
      setYtTitle('');
      setYtDescription('');
      fetchData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAddingVideo(false);
    }
  };

  const manageAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim()) return;
    setManagingAdmin(true);
    setAdminMsg('');
    setError('');
    try {
      const result = await callAdminAction({ action: 'manage_admin', email: adminEmail.trim(), role: adminRole });
      if (result.success === false) throw new Error(result.error);
      setAdminMsg(`Set ${adminEmail} to ${adminRole} role.`);
      setAdminEmail('');
      fetchData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setManagingAdmin(false);
    }
  };

  const revokeAdmin = async (email: string) => {
    setError('');
    setAdminMsg('');
    try {
      const result = await callAdminAction({ action: 'manage_admin', email, role: null });
      if (result.success === false) throw new Error(result.error);
      setAdminMsg(`Revoked admin access for ${email}.`);
      fetchData();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (!user || !profile?.is_admin) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-text-secondary/50">Access denied.</p>
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    userSearch ? u.email.toLowerCase().includes(userSearch.toLowerCase()) : true
  );

  return (
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl text-text-primary font-heading">Admin Dashboard</h1>
            <p className="text-text-secondary text-sm mt-1">EVLightShows.com management</p>
          </div>
          <RoleBadge role={callerRole} />
        </div>
        <button onClick={fetchData} disabled={loading} className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-sm transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-accent-red/10 border border-accent-red/20 rounded-xl px-4 py-3 text-accent-red text-sm">
          <AlertCircle size={15} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-text-secondary/50" />
        </div>
      ) : (
        <>
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={<DollarSign size={18} className="text-emerald-400" />} label="Total Revenue" value={`$${(stats.totalRevenueCents / 100).toFixed(2)}`} />
              <StatCard icon={<Users size={18} className="text-electric-cyan" />} label="Total Users" value={stats.totalUsers.toLocaleString()} />
              <StatCard icon={<Download size={18} className="text-sky-400" />} label="Total Downloads" value={stats.totalDownloads.toLocaleString()} />
            </div>
          )}

          {/* Adjust credits — hidden for viewers */}
          {canEdit && (
            <div className="bg-charcoal border border-border rounded-2xl p-6 space-y-4">
              <h2 className="text-text-primary font-semibold text-sm">Adjust Credits</h2>
              <form onSubmit={grantCredits} className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[200px] space-y-1">
                  <label className="text-text-secondary text-xs">User email</label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={grantEmail}
                    onChange={e => setGrantEmail(e.target.value)}
                    required
                    className="w-full bg-midnight border border-border text-text-primary placeholder-text-secondary/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-electric-cyan/50 transition-colors"
                  />
                </div>
                <div className="w-28 space-y-1">
                  <label className="text-text-secondary text-xs">Amount</label>
                  <input
                    type="number"
                    min={-100}
                    max={100}
                    value={grantAmount}
                    onChange={e => setGrantAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-midnight border border-border text-text-primary rounded-xl px-3 py-2 text-sm outline-none focus:border-electric-cyan/50 transition-colors"
                  />
                </div>
                <div className="flex-1 min-w-[140px] space-y-1">
                  <label className="text-text-secondary text-xs">Note (optional)</label>
                  <input
                    type="text"
                    placeholder="Reason for adjustment"
                    value={grantNote}
                    onChange={e => setGrantNote(e.target.value)}
                    className="w-full bg-midnight border border-border text-text-primary placeholder-text-secondary/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-electric-cyan/50 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={granting || grantAmount === 0}
                  className={`flex items-center gap-2 text-white text-sm font-semibold rounded-xl px-4 py-2 transition-colors disabled:bg-steel disabled:text-text-secondary/30 ${
                    grantAmount < 0
                      ? 'bg-orange-600 hover:bg-orange-500'
                      : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  {granting ? <Loader2 size={14} className="animate-spin" /> : grantAmount < 0 ? <Minus size={14} /> : <Plus size={14} />}
                  {grantAmount < 0 ? 'Deduct' : 'Grant'}
                </button>
              </form>
              {grantMsg && <p className="text-emerald-400 text-sm">{grantMsg}</p>}
            </div>
          )}

          {/* Recent purchases */}
          <div className="space-y-3">
            <h2 className="text-text-primary font-semibold text-sm">Recent Purchases (last 20)</h2>
            <div className="bg-steel border border-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-text-secondary/60 font-medium px-4 py-3">User</th>
                      <th className="text-left text-text-secondary/60 font-medium px-4 py-3">Package</th>
                      <th className="text-left text-text-secondary/60 font-medium px-4 py-3">Credits</th>
                      <th className="text-left text-text-secondary/60 font-medium px-4 py-3">Amount</th>
                      <th className="text-left text-text-secondary/60 font-medium px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.length === 0 ? (
                      <tr><td colSpan={5} className="text-center text-text-secondary/30 px-4 py-6">No purchases yet.</td></tr>
                    ) : purchases.map(p => (
                      <tr key={p.id} className="border-b border-border/50 last:border-0">
                        <td className="px-4 py-3 text-text-secondary font-mono text-xs truncate max-w-[160px]">{p.email}</td>
                        <td className="px-4 py-3 text-text-primary">{p.package_name}</td>
                        <td className="px-4 py-3 text-emerald-400 font-semibold">+{p.credits_purchased}</td>
                        <td className="px-4 py-3 text-text-primary">${(p.amount_cents / 100).toFixed(2)}</td>
                        <td className="px-4 py-3 text-text-secondary text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
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
              <h2 className="text-text-primary font-semibold text-sm">All Users ({users.length})</h2>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search email..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="bg-midnight border border-border text-text-primary placeholder-text-secondary/50 rounded-xl pl-8 pr-3 py-1.5 text-sm outline-none focus:border-electric-cyan/50 w-48 transition-colors"
                />
              </div>
            </div>
            <div className="bg-steel border border-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-text-secondary/60 font-medium px-4 py-3">Email</th>
                      <th className="text-left text-text-secondary/60 font-medium px-4 py-3">Credits</th>
                      <th className="text-left text-text-secondary/60 font-medium px-4 py-3">Snippet</th>
                      <th className="text-left text-text-secondary/60 font-medium px-4 py-3">Role</th>
                      <th className="text-left text-text-secondary/60 font-medium px-4 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={5} className="text-center text-text-secondary/30 px-4 py-6">No users found.</td></tr>
                    ) : filteredUsers.map(u => (
                      <tr key={u.id} className="border-b border-border/50 last:border-0">
                        <td className="px-4 py-3 text-text-secondary font-mono text-xs max-w-[200px] truncate">{u.email}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${u.credits > 0 ? 'text-emerald-400' : 'text-text-secondary/30'}`}>{u.credits}</span>
                            {canEdit && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => quickAdjust(u.email, 1)}
                                  disabled={quickAdjusting === u.email}
                                  className="w-6 h-6 flex items-center justify-center rounded-md bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 transition-colors disabled:opacity-30"
                                  title="Add 1 credit"
                                >
                                  {quickAdjusting === u.email ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                                </button>
                                <button
                                  onClick={() => quickAdjust(u.email, -1)}
                                  disabled={quickAdjusting === u.email || u.credits < 1}
                                  className="w-6 h-6 flex items-center justify-center rounded-md bg-orange-600/20 text-orange-400 hover:bg-orange-600/40 transition-colors disabled:opacity-30"
                                  title="Remove 1 credit"
                                >
                                  {quickAdjusting === u.email ? <Loader2 size={12} className="animate-spin" /> : <Minus size={12} />}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-text-secondary/60">{u.snippet_used ? 'Used' : 'Available'}</td>
                        <td className="px-4 py-3">
                          {u.admin_role ? <RoleBadge role={u.admin_role} /> : <span className="text-text-secondary/30">--</span>}
                        </td>
                        <td className="px-4 py-3 text-text-secondary text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Gallery Video Management */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Video size={16} className="text-accent-red" />
              <h2 className="text-text-primary font-semibold text-sm">Gallery Videos ({videos.length})</h2>
            </div>

            {/* Add YouTube Video form — editors/owners only */}
            {canEdit && (
              <div className="bg-charcoal border border-border rounded-2xl p-6 space-y-4">
                <h3 className="text-text-primary font-semibold text-sm">Add YouTube Video</h3>
                <form onSubmit={addYouTubeVideo} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-text-secondary text-xs">YouTube URL</label>
                      <input
                        type="url"
                        placeholder="https://youtube.com/watch?v=..."
                        value={ytUrl}
                        onChange={e => setYtUrl(e.target.value)}
                        required
                        className="w-full bg-midnight border border-border text-text-primary placeholder-text-secondary/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-electric-cyan/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-text-secondary text-xs">Title</label>
                      <input
                        type="text"
                        placeholder="My Tesla Light Show"
                        value={ytTitle}
                        onChange={e => setYtTitle(e.target.value)}
                        maxLength={80}
                        required
                        className="w-full bg-midnight border border-border text-text-primary placeholder-text-secondary/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-electric-cyan/50 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-text-secondary text-xs">Description (optional)</label>
                    <input
                      type="text"
                      placeholder="Short description shown in the gallery"
                      value={ytDescription}
                      onChange={e => setYtDescription(e.target.value)}
                      maxLength={200}
                      className="w-full bg-midnight border border-border text-text-primary placeholder-text-secondary/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-electric-cyan/50 transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="submit"
                      disabled={addingVideo}
                      className="flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 disabled:bg-steel disabled:text-text-secondary/30 text-white text-sm font-semibold rounded-xl px-4 py-2 transition-colors"
                    >
                      {addingVideo ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                      Add to Gallery
                    </button>
                    {ytUrl && extractYouTubeId(ytUrl) && (
                      <img
                        src={getYouTubeThumbnail(extractYouTubeId(ytUrl)!)}
                        alt="Thumbnail preview"
                        className="h-10 rounded-md border border-border"
                      />
                    )}
                  </div>
                </form>
                {videoMsg && <p className="text-emerald-400 text-sm">{videoMsg}</p>}
              </div>
            )}

            {/* Video list */}
            {videos.length === 0 ? (
              <p className="text-text-secondary/50 text-sm">No gallery videos.</p>
            ) : (
              <div className="bg-steel border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-text-secondary/60 font-medium px-4 py-3">Preview</th>
                        <th className="text-left text-text-secondary/60 font-medium px-4 py-3">Title</th>
                        <th className="text-left text-text-secondary/60 font-medium px-4 py-3">Type</th>
                        <th className="text-left text-text-secondary/60 font-medium px-4 py-3">Added</th>
                        {canEdit && <th className="px-4 py-3"></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {videos.map(v => (
                        <tr key={v.id} className="border-b border-border/50 last:border-0">
                          <td className="px-4 py-3">
                            {v.youtube_id ? (
                              <img
                                src={getYouTubeThumbnail(v.youtube_id)}
                                alt=""
                                className="w-16 h-9 rounded object-cover border border-border"
                              />
                            ) : (
                              <div className="w-16 h-9 rounded bg-midnight border border-border flex items-center justify-center">
                                <Video size={12} className="text-text-secondary/40" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-text-primary max-w-[240px] truncate">{v.title}</td>
                          <td className="px-4 py-3">
                            {v.youtube_id ? (
                              <a
                                href={`https://youtube.com/watch?v=${v.youtube_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-accent-red hover:text-accent-red/80 transition-colors"
                              >
                                YouTube <ExternalLink size={10} />
                              </a>
                            ) : (
                              <span className="text-xs text-text-secondary/50">Upload</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-text-secondary text-xs">{new Date(v.created_at).toLocaleDateString()}</td>
                          {canEdit && (
                            <td className="px-4 py-3 text-right">
                              <button onClick={() => deleteVideo(v)} className="text-text-secondary/50 hover:text-accent-red hover:bg-accent-red/10 transition-colors p-1.5 rounded-lg">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Manage Admins — owner only */}
          {isOwner && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-amber-400" />
                <h2 className="text-text-primary font-semibold text-sm">Manage Admins</h2>
              </div>

              <div className="bg-charcoal border border-border rounded-2xl p-6 space-y-4">
                <form onSubmit={manageAdmin} className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[200px] space-y-1">
                    <label className="text-text-secondary text-xs">User email</label>
                    <input
                      type="email"
                      placeholder="user@example.com"
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      required
                      className="w-full bg-midnight border border-border text-text-primary placeholder-text-secondary/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-electric-cyan/50 transition-colors"
                    />
                  </div>
                  <div className="w-32 space-y-1">
                    <label className="text-text-secondary text-xs">Role</label>
                    <select
                      value={adminRole}
                      onChange={e => setAdminRole(e.target.value)}
                      className="w-full bg-midnight border border-border text-text-primary rounded-xl px-3 py-2 text-sm outline-none focus:border-electric-cyan/50 transition-colors appearance-none"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={managingAdmin}
                    className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:bg-steel disabled:text-text-secondary/30 text-white text-sm font-semibold rounded-xl px-4 py-2 transition-colors"
                  >
                    {managingAdmin ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                    Add Admin
                  </button>
                </form>
                {adminMsg && <p className="text-emerald-400 text-sm">{adminMsg}</p>}
              </div>

              {/* Current admins list */}
              {admins.length > 0 && (
                <div className="bg-steel border border-border rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-text-secondary/60 font-medium px-4 py-3">Email</th>
                          <th className="text-left text-text-secondary/60 font-medium px-4 py-3">Role</th>
                          <th className="text-left text-text-secondary/60 font-medium px-4 py-3">Added</th>
                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {admins.map(a => (
                          <tr key={a.id} className="border-b border-border/50 last:border-0">
                            <td className="px-4 py-3 text-text-secondary font-mono text-xs">{a.email}</td>
                            <td className="px-4 py-3"><RoleBadge role={a.admin_role} /></td>
                            <td className="px-4 py-3 text-text-secondary text-xs">{new Date(a.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-right">
                              {a.admin_role !== 'owner' && (
                                <button
                                  onClick={() => revokeAdmin(a.email)}
                                  className="text-text-secondary/50 hover:text-accent-red hover:bg-accent-red/10 transition-colors p-1.5 rounded-lg"
                                  title="Revoke admin access"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Gallery Moderation */}
      <div className="mt-12 border-t border-border pt-8">
        <GalleryModerationPanel />
      </div>
    </main>
  );
}
