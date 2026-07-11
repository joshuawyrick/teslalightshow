import { lazy, Suspense } from 'react';
import SeoHead from '../../components/SeoHead';
import JsonLd from '../../components/JsonLd';
import { FaqAccordion, InternalLinkGrid, IndependentNotice } from '../../components/SeoComponents';

const GeneratorPage = lazy(() => import('../GeneratorPage'));

interface Props {
  onOpenAuth: () => void;
  onOpenPricing: () => void;
}

const faqItems = [
  { q: 'What file format does the Tesla Light Show Generator create?', a: 'Our generator produces FSEQ v2.0 files (.fseq) which are the native format recognized by Tesla vehicles for custom light shows.' },
  { q: 'How long can a Tesla light show be?', a: 'Tesla supports light shows up to 5 minutes in length. Our generator handles the timing automatically based on your uploaded audio file.' },
  { q: 'Do I need any coding or technical skills?', a: 'No. Simply upload your music file, choose your preferences, and our AI generates a fully synchronized light show file ready for your USB drive.' },
  { q: 'Which Tesla models support custom light shows?', a: 'Model S, Model 3, Model X, Model Y, and Cybertruck all support custom light shows via USB. The vehicle must be running software version 2021.44.25 or later.' },
  { q: 'Is the generated file safe for my Tesla?', a: 'Yes. The files are standard FSEQ format within Tesla\'s supported parameters. Light shows only control exterior lights and cannot modify vehicle software or systems.' },
];

const relatedLinks = [
  { label: 'How to Add a Light Show to Tesla', href: '/how-to-add-custom-light-show-to-tesla', desc: 'Step-by-step USB installation guide' },
  { label: 'USB Setup Guide', href: '/tesla-light-show-usb-setup', desc: 'Format and prepare your USB drive' },
  { label: 'Troubleshooting', href: '/tesla-light-show-not-working', desc: 'Fix common light show issues' },
  { label: 'Model Compatibility', href: '/tesla-light-show-models', desc: 'Supported Tesla models and features' },
  { label: 'Light Show Ideas', href: '/tesla-light-show-ideas', desc: 'Inspiration for every occasion' },
  { label: 'Download Light Shows', href: '/tesla-light-show-downloads', desc: 'Browse pre-made light shows' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Tesla Light Show Generator',
  url: 'https://teslalightshows.com/tesla-light-show-generator',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web',
  description: 'AI-powered Tesla light show generator. Upload music, generate synchronized FSEQ light show files for Model S, 3, X, Y, and Cybertruck.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free credits available on signup',
  },
};

export default function SeoGeneratorPage({ onOpenAuth, onOpenPricing }: Props) {
  return (
    <>
      <SeoHead
        title="Tesla Light Show Generator | Create Custom Light Shows from Any Song"
        description="Generate custom Tesla light show files from any music. AI-powered FSEQ generator for Model S, 3, X, Y, and Cybertruck. Upload your song and download in seconds."
        canonical="https://teslalightshows.com/tesla-light-show-generator"
      />
      <JsonLd data={jsonLd} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Tesla Light Show Generator",
        "url": "https://teslalightshows.com/tesla-light-show-generator",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Web",
        "description": "Upload any MP3 or WAV and generate custom Tesla light show FSEQ files for Model S, Model 3, Model X, Model Y, and Cybertruck.",
        "offers": [
          { "@type": "Offer", "name": "1 Download", "price": "4.99", "priceCurrency": "USD" },
          { "@type": "Offer", "name": "3 Downloads", "price": "9.99", "priceCurrency": "USD" },
          { "@type": "Offer", "name": "10 Downloads", "price": "14.99", "priceCurrency": "USD" }
        ],
        "publisher": { "@id": "https://teslalightshows.com/#organization" }
      }} />

      <Suspense fallback={<div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-6 sm:py-8 min-h-[600px]" />}>
        <GeneratorPage onOpenAuth={onOpenAuth} onOpenPricing={onOpenPricing} />
      </Suspense>

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-text-primary">Frequently Asked Questions</h2>
          <FaqAccordion items={faqItems} />
        </section>

        <InternalLinkGrid title="Related Guides" links={relatedLinks} />

        <IndependentNotice />
      </div>
    </>
  );
}
