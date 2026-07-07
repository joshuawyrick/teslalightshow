import { useState } from 'react';
import { X, Mail, Lock, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'forgot') {
      const { error: err } = await resetPassword(email);
      if (err) {
        setError(err);
      } else {
        setResetSent(true);
      }
      setLoading(false);
      return;
    }

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

  const heading = mode === 'signup'
    ? 'Create your account'
    : mode === 'signin'
    ? 'Welcome back'
    : 'Reset password';

  const subtitle = mode === 'signup'
    ? 'Get your free snippet on sign up.'
    : mode === 'signin'
    ? 'Log in to access your shows.'
    : 'We\'ll send a reset link to your email.';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-charcoal border border-border rounded-t-2xl sm:rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <div>
            <h2 className="text-text-primary font-heading font-bold text-lg">{heading}</h2>
            <p className="text-text-secondary text-sm mt-0.5">{subtitle}</p>
          </div>
          <button onClick={onClose} className="text-text-secondary/60 hover:text-text-secondary transition-colors">
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-accent-red/15 border border-accent-red/30 flex items-center justify-center mx-auto mb-3">
              <Mail size={20} className="text-accent-red" />
            </div>
            <p className="text-text-primary font-semibold">Account created!</p>
            <p className="text-text-secondary text-sm mt-1">Signing you in now...</p>
          </div>
        ) : resetSent ? (
          <div className="px-6 py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-accent-red/15 border border-accent-red/30 flex items-center justify-center mx-auto mb-3">
              <Mail size={20} className="text-accent-red" />
            </div>
            <p className="text-text-primary font-semibold">Check your inbox</p>
            <p className="text-text-secondary text-sm mt-1">We sent a password reset link to <span className="text-text-secondary/60">{email}</span></p>
            <button
              onClick={() => { setMode('signin'); setResetSent(false); setError(''); }}
              className="mt-4 flex items-center gap-1.5 mx-auto text-electric-cyan hover:text-electric-cyan/80 text-sm transition-colors"
            >
              <ArrowLeft size={14} /> Back to login
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="px-6 pt-5 pb-6 space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50 pointer-events-none" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-midnight border border-border text-text-primary placeholder-text-secondary/40 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-electric-cyan/50 transition-colors"
                />
              </div>
              {mode !== 'forgot' && (
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50 pointer-events-none" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-midnight border border-border text-text-primary placeholder-text-secondary/40 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-electric-cyan/50 transition-colors"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-accent-red/10 border border-accent-red/20 rounded-xl px-3 py-2.5 text-accent-red text-sm">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-accent-red hover:bg-accent-red/90 glow-red disabled:bg-text-secondary/10 disabled:text-text-secondary/30 text-text-primary font-semibold rounded-xl py-3 text-sm transition-colors duration-150"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {mode === 'signup' ? 'Create account' : mode === 'signin' ? 'Log in' : 'Send reset link'}
            </button>

            {mode === 'signin' && (
              <p className="text-center">
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(''); }}
                  className="text-text-secondary/60 hover:text-electric-cyan text-xs transition-colors"
                >
                  Forgot password?
                </button>
              </p>
            )}

            <p className="text-center text-text-secondary text-sm">
              {mode === 'signup' ? (
                <>Already have an account?{' '}
                  <button type="button" onClick={() => { setMode('signin'); setError(''); }} className="text-electric-cyan hover:text-electric-cyan/80 transition-colors">
                    Log in
                  </button>
                </>
              ) : mode === 'signin' ? (
                <>No account?{' '}
                  <button type="button" onClick={() => { setMode('signup'); setError(''); }} className="text-electric-cyan hover:text-electric-cyan/80 transition-colors">
                    Sign up free
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => { setMode('signin'); setError(''); }} className="flex items-center gap-1.5 mx-auto text-electric-cyan hover:text-electric-cyan/80 transition-colors">
                  <ArrowLeft size={14} /> Back to login
                </button>
              )}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
