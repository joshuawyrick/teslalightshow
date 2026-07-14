import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import JsonLd from '../components/JsonLd';
import { useAuth } from '../contexts/AuthContext';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';

interface PricingPageProps {
  onOpenAuth: () => void;
  onNavigate: (to: string) => void;
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What exactly do I get?',
      acceptedAnswer: { '@type': 'Answer', text: 'A downloadable .fseq light show file custom-generated for your song, ready to load onto a USB drive and play on any Tesla that supports custom light shows.' },
    },
    {
      '@type': 'Question',
      name: 'Do credits expire?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. Credits stay in your account until you use them.' },
    },
    {
      '@type': 'Question',
      name: 'Can I use credits on different songs?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Each credit unlocks one file download — any song, any rendition.' },
    },
    {
      '@type': 'Question',
      name: 'How much does a custom Tesla light show cost?',
      acceptedAnswer: { '@type': 'Answer', text: 'A single custom light show costs $4.99, or as little as $1.50 per show with the 10-credit pack.' },
    },
  ],
};

const faqs = [
  { q: 'What exactly do I get?', a: 'A downloadable .fseq light show file custom-generated for your song, ready to load onto a USB drive and play on any Tesla that supports custom light shows.' },
  { q: 'Do credits expire?', a: 'No. Credits stay in your account until you use them.' },
  { q: 'Can I use credits on different songs?', a: 'Yes. Each credit unlocks one file download — any song, any rendition.' },
  { q: 'How much does a custom Tesla light show cost?', a: 'A single custom light show costs $4.99, or as little as $1.50 per show with the 10-credit pack.' },
];

const cards = [
  { tier: 'Starter', credits: 1, price: '$4.99', perShow: '$4.99 per show', badge: null, packageId: 'single' },
  { tier: 'Popular', credits: 3, price: '$9.99', perShow: '$3.33 per show', badge: 'MOST POPULAR', highlight: true, packageId: 'triple' },
  { tier: 'Best Value', credits: 10, price: '$14.99', perShow: '$1.50 per show', badge: 'SAVE 70%', packageId: 'ten' },
];

export default function PricingPage({ onOpenAuth, onNavigate }: PricingPageProps) {
  const { session } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const purchase = async (packageId: string) => {
    if (!session) {
      onOpenAuth();
      return;
    }

    setError('');
    setLoading(packageId);
    try {
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
      window.open(url, '_blank');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="max-w-[1080px] mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
      <SeoHead
        title="Pricing — Custom Tesla Light Shows from $1.50 | EVLightShows.com"
        description="See pricing for custom Tesla light shows. Turn any song into a light show file for your Tesla. Free 20-second preview, credits from $1.50 per show."
        canonical="https://evlightshows.com/pricing"
      />
      <JsonLd data={faqSchema} />

      <section className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-text-primary">Tesla Light Show Pricing</h1>
        <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
          1 credit = 1 custom light show file for your Tesla. Credits never expire.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
        {cards.map((card) => (
          <div
            key={card.tier}
            className={`relative h-full bg-charcoal border rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center ${
              card.highlight ? 'border-accent-red' : 'border-border'
            }`}
          >
            {card.badge && (
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center justify-center min-w-[120px] h-6 px-3 text-[10px] font-bold uppercase tracking-wider rounded-full bg-accent-red text-white whitespace-nowrap"
              >
                {card.badge}
              </span>
            )}
            <div className="flex flex-col items-center gap-4 pt-2">
              <h2 className="text-text-primary text-lg font-display font-bold">{card.tier}</h2>
              <p className="text-text-secondary text-sm">{card.credits} credit{card.credits !== 1 ? 's' : ''}</p>
              <p className="text-text-primary text-4xl font-display font-bold">{card.price}</p>
              <p className="text-text-secondary text-xs">{card.perShow}</p>
            </div>
            <button
              onClick={() => purchase(card.packageId)}
              disabled={loading !== null}
              className="mt-auto inline-flex items-center justify-center gap-2 min-h-[44px] w-full bg-accent-red hover:bg-accent-red/90 disabled:bg-steel disabled:text-text-secondary text-white text-sm font-semibold rounded-xl px-6 py-3 transition-all duration-150 glow-red"
            >
              {loading === card.packageId && <Loader2 size={16} className="animate-spin" />}
              Get Credits
            </button>
          </div>
        ))}
      </section>

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/20 rounded-xl px-4 py-3 text-accent-red text-sm text-center">
          {error}
        </div>
      )}

      <section className="bg-charcoal border border-border rounded-2xl p-8 sm:p-10 text-center space-y-4">
        <h2 className="text-2xl font-display font-bold text-text-primary">Try It Free First</h2>
        <p className="text-text-secondary text-sm leading-relaxed max-w-lg mx-auto">
          Upload your song and download a free 20-second preview of your light show — just create a free account, no payment required.
        </p>
        <button
          onClick={() => onNavigate('/tesla-light-show-generator#upload')}
          className="inline-flex items-center justify-center min-h-[44px] bg-accent-red hover:bg-accent-red/90 text-white text-sm font-semibold rounded-xl px-6 py-3 transition-all duration-150 glow-red"
        >
          Try the Generator
        </button>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-display font-bold text-text-primary">Pricing FAQ</h2>
        <div className="space-y-3">
          {faqs.map((item) => (
            <details key={item.q} className="group bg-steel/50 border border-border rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4 cursor-pointer select-none hover:bg-steel transition-colors">
                <h3 className="text-text-primary text-sm font-medium">{item.q}</h3>
                <span className="text-text-secondary text-xs shrink-0 group-open:rotate-180 transition-transform duration-200">&#9660;</span>
              </summary>
              <div className="px-4 sm:px-5 pb-4">
                <p className="text-text-secondary text-sm leading-relaxed">{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
