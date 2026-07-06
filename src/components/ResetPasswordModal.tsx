import { useState } from 'react';
import { X, Lock, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ResetPasswordModalProps {
  onClose: () => void;
}

export default function ResetPasswordModal({ onClose }: ResetPasswordModalProps) {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: err } = await updatePassword(password);
    if (err) {
      setError(err);
    } else {
      setSuccess(true);
      setTimeout(onClose, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#13151b] border border-white/15 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/8">
          <div>
            <h2 className="text-white font-bold text-lg">Set new password</h2>
            <p className="text-white/40 text-sm mt-0.5">Choose a new password for your account.</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={20} className="text-emerald-400" />
            </div>
            <p className="text-white font-semibold">Password updated!</p>
            <p className="text-white/40 text-sm mt-1">You can now log in with your new password.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="px-6 pt-5 pb-6 space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input
                  type="password"
                  placeholder="New password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-white/5 border border-white/12 text-white placeholder-white/25 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-tesla-500/50 transition-colors"
                />
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-white/5 border border-white/12 text-white placeholder-white/25 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-tesla-500/50 transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-tesla-500/10 border border-tesla-500/20 rounded-xl px-3 py-2.5 text-tesla-300 text-sm">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-tesla-600 hover:bg-tesla-500 disabled:bg-white/5 disabled:text-white/30 text-white font-semibold rounded-xl py-3 text-sm transition-colors duration-150"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Update password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
