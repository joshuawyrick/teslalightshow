import { useState } from 'react';
import { X, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (mode === 'signup') {
      const { error: err } = await signUp(email, password);
      if (err) {
        setError(err);
      } else {
        setSuccess(true);
        setTimeout(onClose, 1500);
      }
    } else {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError(err.includes('Invalid') ? 'Invalid email or password.' : err);
      } else {
        onClose();
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#13151b] border border-white/15 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/8">
          <div>
            <h2 className="text-white font-bold text-lg">
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-white/40 text-sm mt-0.5">
              {mode === 'signup' ? 'Get your free snippet on sign up.' : 'Log in to access your shows.'}
            </p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
              <Mail size={20} className="text-emerald-400" />
            </div>
            <p className="text-white font-semibold">Account created!</p>
            <p className="text-white/40 text-sm mt-1">Signing you in now…</p>
          </div>
        ) : (
          <form onSubmit={submit} className="px-6 pt-5 pb-6 space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/12 text-white placeholder-white/25 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-tesla-500/50 transition-colors"
                />
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
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
              {mode === 'signup' ? 'Create account' : 'Log in'}
            </button>

            <p className="text-center text-white/40 text-sm">
              {mode === 'signup' ? (
                <>Already have an account?{' '}
                  <button type="button" onClick={() => { setMode('signin'); setError(''); }} className="text-tesla-400 hover:text-tesla-300 transition-colors">
                    Log in
                  </button>
                </>
              ) : (
                <>No account?{' '}
                  <button type="button" onClick={() => { setMode('signup'); setError(''); }} className="text-tesla-400 hover:text-tesla-300 transition-colors">
                    Sign up free
                  </button>
                </>
              )}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
