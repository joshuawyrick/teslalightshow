import { useState } from 'react';
import { X, Loader2, CheckCircle2, Zap } from 'lucide-react';
import { PACKAGES } from '../config';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';

interface PricingModalProps {
  onClose: () => void;
}

export default function PricingModal({ onClose }: PricingModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const purchase = async (packageId: string) => {
    setError('');
    setLoading(packageId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please log in first.');
        setLoading(null);
        return;
      }
      const res = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'Apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ packageId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      const { url } = await res.json();
      if (!url) throw new Error('No checkout URL returned.');
      window.location.href = url;
    } catch (err) {
      setError((err as Error).message);
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#13151b] border border-white/15 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/8">
          <div>
            <h2 className="text-white font-bold text-lg">Get more credits</h2>
            <p className="text-white/40 text-sm mt-0.5">Each credit unlocks one full-length light show.</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-3">
          {PACKAGES.map(pkg => (
            <div
              key={pkg.id}
              className={`relative bg-white/3 border rounded-xl p-4 flex items-center gap-4 ${
                pkg.badge === 'Best Value' ? 'border-tesla-500/40' : pkg.badge === 'Popular' ? 'border-white/20' : 'border-white/10'
              }`}
            >
              {pkg.badge && (
                <span className={`absolute -top-2.5 right-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  pkg.badge === 'Best Value' ? 'bg-tesla-600 text-white' : 'bg-white/10 text-white/60'
                }`}>
                  {pkg.badge}
                </span>
              )}
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Zap size={18} className="text-tesla-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{pkg.name}</p>
                <p className="text-white/40 text-xs mt-0.5">{pkg.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-white font-bold text-lg">{pkg.label}</p>
                <p className="text-white/30 text-xs">{(pkg.price_cents / pkg.credits / 100).toFixed(2)}/show</p>
              </div>
              <button
                onClick={() => purchase(pkg.id)}
                disabled={loading !== null}
                className="shrink-0 flex items-center gap-1.5 bg-tesla-600 hover:bg-tesla-500 disabled:bg-white/5 disabled:text-white/30 text-white text-sm font-semibold rounded-xl px-4 py-2 transition-colors duration-150"
              >
                {loading === pkg.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Buy
              </button>
            </div>
          ))}

          {error && (
            <div className="bg-tesla-500/10 border border-tesla-500/20 rounded-xl px-4 py-2.5 text-tesla-300 text-sm">
              {error}
            </div>
          )}

          <p className="text-white/25 text-xs text-center pt-1">
            Powered by Stripe. Secure checkout. No subscription.
          </p>
        </div>
      </div>
    </div>
  );
}
