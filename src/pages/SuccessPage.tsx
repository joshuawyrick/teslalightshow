import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SuccessPageProps {
  sessionId: string | null;
  onNavigate: (path: string) => void;
}

export default function SuccessPage({ sessionId, onNavigate }: SuccessPageProps) {
  const { refreshProfile } = useAuth();
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    if (!sessionId) { setStatus('error'); return; }
    // Poll profile until credits reflect the purchase (webhook may be slightly delayed)
    let attempts = 0;
    const poll = async () => {
      await refreshProfile();
      attempts++;
      if (attempts < 8) setTimeout(poll, 1500);
      else setStatus('ok');
    };

    const checkSession = async () => {
      try {
        const { data: purchase } = await supabase
          .from('purchases')
          .select('id')
          .eq('stripe_session_id', sessionId)
          .maybeSingle();
        if (purchase) {
          await refreshProfile();
          setStatus('ok');
        } else {
          poll();
        }
      } catch {
        setStatus('ok'); // show success anyway; credits will appear after webhook
      }
    };
    checkSession();
  }, [sessionId, refreshProfile]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white/3 border border-white/10 rounded-2xl p-10 max-w-md w-full text-center space-y-5">
        {status === 'loading' && (
          <>
            <Loader2 size={40} className="animate-spin text-white/30 mx-auto" />
            <p className="text-white font-semibold">Confirming your purchase…</p>
            <p className="text-white/40 text-sm">Just a moment while we apply your credits.</p>
          </>
        )}
        {status === 'ok' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            <p className="text-white font-bold text-xl">Payment confirmed!</p>
            <p className="text-white/50 text-sm">Your credits have been added to your account. Go generate some shows.</p>
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center justify-center gap-2 w-full bg-tesla-600 hover:bg-tesla-500 text-white font-semibold rounded-xl py-3 transition-colors duration-150"
            >
              Go to generator <ArrowRight size={16} />
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-tesla-500/15 border border-tesla-500/30 flex items-center justify-center mx-auto">
              <XCircle size={32} className="text-tesla-400" />
            </div>
            <p className="text-white font-bold text-xl">Something went wrong</p>
            <p className="text-white/50 text-sm">We couldn't confirm your session. If you were charged, your credits will appear shortly — contact us if they don't show up.</p>
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center justify-center gap-2 w-full bg-white/8 hover:bg-white/12 border border-white/10 text-white font-semibold rounded-xl py-3 transition-colors duration-150"
            >
              Back to home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
