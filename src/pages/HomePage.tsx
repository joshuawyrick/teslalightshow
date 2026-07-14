import { Sparkles, Usb, Play, Music, Car, Zap } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import JsonLd from '../components/JsonLd';
import { FaqAccordion, InternalLinkGrid } from '../components/SeoComponents';

import { lazy, Suspense } from 'react';
const GeneratorPage = lazy(() => import('./GeneratorPage'));

interface Props {
  onOpenAuth: () => void;
  onOpenPricing: () => void;
}

const howItWorks = [
  { icon: Music, title: 'Upload Your Song', desc: 'Drop any MP3 or audio file into our generator. We analyze the beat, tempo, and energy.' },
  { icon: Sparkles, title: 'AI Generates Your Show', desc: 'Our engine creates a fully synchronized 200-channel light sequence matched to your music.' },
  { icon: Usb, title: 'Download & Play', desc: 'Get your .fseq file, copy to a USB drive, and activate your Tesla light show.' },
];

const popularUses = [
  { label: 'Christmas Light Shows', href: '/tesla-christmas-light-show', desc: 'Holiday classics synced to lights' },
  { label: 'Halloween Light Shows', href: '/tesla-halloween-light-show', desc: 'Spooky vibes for trick-or-treaters' },
  { label: 'Birthday Surprises', href: '/tesla-birthday-light-show', desc: 'Make birthdays unforgettable' },
  { label: 'Custom Any Song', href: '/custom-tesla-light-show', desc: 'Your music, your light show' },
  { label: 'New Year Celebrations', href: '/tesla-new-year-light-show', desc: 'Ring in the new year in style' },
  { label: 'Browse Gallery', href: '/tesla-light-show-gallery', desc: 'See what others have created' },
];

const faqItems = [
  { q: 'What is a Tesla light show?', a: 'A Tesla light show is a custom sequence that controls your vehicle\'s exterior lights, trunk, doors, and charge port in sync with music. It uses .fseq files loaded from a USB drive.' },
  { q: 'Which Tesla models support light shows?', a: 'All current Tesla models support light shows: Model S, Model 3, Model X, Model Y, and Cybertruck. The vehicle needs software version 2021.44.25 or later.' },
  { q: 'How do I play a light show on my Tesla?', a: 'Copy the .fseq file and matching audio to a USB drive, insert it into your Tesla, go to Toybox > Light Show, and select your custom show.' },
  { q: 'Is this service affiliated with Tesla?', a: 'No. EVLightShows.com is an independent service. We are not affiliated with, endorsed by, or sponsored by Tesla, Inc.' },
];

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'EVLightShows.com',
  url: 'https://evlightshows.com',
  description: 'Independent Tesla light show generator and resource platform.',
  contactPoint: { '@type': 'ContactPoint', email: 'support@evlightshows.com', contactType: 'customer service' },
};

const webAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Tesla Light Show Generator',
  url: 'https://evlightshows.com',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web',
  description: 'Create custom Tesla light shows from any song. AI-powered FSEQ generator for all Tesla models.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Free credits on signup' },
};

export default function HomePage({ onOpenAuth, onOpenPricing }: Props) {
  return (
    <>
      <SeoHead
        title="Custom Tesla Light Show Generator | EV Light Shows"
        description="Create stunning custom Tesla light shows from any song. AI-powered generator produces FSEQ files for Model S, 3, X, Y, and Cybertruck. Free to try."
        canonical="https://evlightshows.com/"
      />
      <JsonLd data={orgJsonLd} />
      <JsonLd data={webAppJsonLd} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": "https://evlightshows.com/#organization",
            "name": "EVLightShows.com",
            "url": "https://evlightshows.com",
            "logo": "https://evlightshows.com/logo.jpg",
            "description": "Independent web app that generates custom Tesla light show FSEQ files from any song. Not affiliated with Tesla, Inc."
          },
          {
            "@type": "WebSite",
            "@id": "https://evlightshows.com/#website",
            "url": "https://evlightshows.com",
            "name": "EVLightShows.com",
            "publisher": { "@id": "https://evlightshows.com/#organization" }
          }
        ]
      }} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItems.map(item => ({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": { "@type": "Answer", "text": item.a }
        }))
      }} />

      {/* Hero Section */}
      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-6">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-text-primary leading-tight">
            Turn Any Song Into a <span className="text-electric-cyan">Tesla Light Show</span>
          </h1>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Upload your music, our AI creates a perfectly synchronized custom light show for your Tesla. Works with Model S, 3, X, Y, and Cybertruck.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <a
              href="#upload"
              onClick={(e) => { e.preventDefault(); document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
              className="inline-flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white text-sm font-semibold rounded-xl px-6 py-3 transition-all glow-red"
            >
              <Zap size={16} /> Generate My Light Show
            </a>
            <a
              href="/how-to-add-custom-light-show-to-tesla"
              className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
            >
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* Generator */}
      <Suspense fallback={<div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-6 sm:py-8"><div className="bg-charcoal border border-border rounded-2xl h-[400px] animate-pulse" /></div>}>
        <GeneratorPage onOpenAuth={onOpenAuth} onOpenPricing={onOpenPricing} />
      </Suspense>

      {/* How It Works */}
      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-text-primary text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {howItWorks.map((step, i) => (
            <div key={i} className="bg-charcoal border border-border rounded-2xl p-6 text-center space-y-3 hover:border-electric-cyan/20 transition-colors duration-200">
              <div className="w-12 h-12 rounded-xl bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center mx-auto">
                <step.icon size={20} className="text-electric-cyan" />
              </div>
              <h3 className="text-text-primary text-sm font-semibold">{step.title}</h3>
              <p className="text-text-secondary text-xs leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Compatible Models */}
      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-text-primary text-center mb-6">Works With All Tesla Models</h2>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            { label: 'Model Y', href: '/tesla-model-y-light-show' },
            { label: 'Model 3', href: '/tesla-model-3-light-show' },
            { label: 'Cybertruck', href: '/cybertruck-light-show' },
            { label: 'Model S', href: '/tesla-model-s-model-x-light-show' },
            { label: 'Model X', href: '/tesla-model-s-model-x-light-show' },
          ].map(model => (
            <a
              key={model.label}
              href={model.href}
              className="inline-flex items-center gap-2 bg-steel/50 border border-border rounded-xl px-4 py-2.5 text-text-secondary hover:text-text-primary hover:border-electric-cyan/20 text-sm transition-all duration-200"
            >
              <Car size={14} /> {model.label}
            </a>
          ))}
        </div>
      </section>

      {/* Popular Uses */}
      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <InternalLinkGrid title="Popular Light Show Ideas" links={popularUses} />
      </section>

      {/* FAQ */}
      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 pb-12 sm:pb-16 space-y-6">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-text-primary">Frequently Asked Questions</h2>
        <FaqAccordion items={faqItems} />
      </section>

      {/* Independent Service Notice */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 mt-10 sm:mt-12">
        <div className="border border-border rounded-xl p-4 sm:p-6 bg-charcoal/50">
          <h3 className="text-text-primary text-sm font-semibold mb-2">Independent Service Notice</h3>
          <p className="text-text-secondary text-xs leading-relaxed">
            EVLightShows.com is an independent digital service that creates custom light show files intended for compatible Tesla vehicles that support the Light Show feature. EVLightShows.com is not affiliated with, endorsed by, sponsored by, or approved by Tesla, Inc. References to Tesla and Tesla vehicle names are used only to describe compatibility and intended file use.
          </p>
        </div>
      </div>
    </>
  );
}
