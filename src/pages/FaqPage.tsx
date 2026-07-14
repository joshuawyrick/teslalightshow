import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import JsonLd from '../components/JsonLd';

interface FaqPageProps {
  onNavigate: (to: string) => void;
}

const FAQ_ITEMS = [
  {
    q: 'Is EVLightShows.com affiliated with Tesla?',
    a: 'No. EVLightShows.com is an independent digital service and is not affiliated with, endorsed by, sponsored by, or approved by Tesla, Inc. References to Tesla and Tesla vehicle names are used only to describe compatibility and intended file use.',
  },
  {
    q: 'What does EVLightShows.com create?',
    a: 'EVLightShows.com creates custom digital light show files from customer-uploaded MP3 or WAV audio files. The generated files are intended for compatible Tesla vehicles that support the Light Show feature.',
  },
  {
    q: 'Do I need to own the music I upload?',
    a: 'You must own the audio file or have permission to use it for this purpose. By uploading a file, you confirm that you have the right to use that audio file.',
  },
  {
    q: 'Do you guarantee the files will work on every Tesla vehicle?',
    a: 'No. Compatibility can vary based on vehicle model, software version, USB formatting, folder placement, file naming, audio quality, and customer setup. We make reasonable efforts to generate files intended for compatible Light Show use, but we cannot guarantee every file will work with every setup.',
  },
  {
    q: 'Do you need access to my Tesla account?',
    a: 'No. EVLightShows.com does not require access to your Tesla account. Do not provide Tesla account login information, Tesla app credentials, or other sensitive account information through this website.',
  },
  {
    q: 'Are refunds available?',
    a: 'Because EVLightShows.com provides custom digital files generated from customer-uploaded audio, completed digital orders are generally not refundable once files have been generated or delivered. If there is a technical issue, missing download, or fulfillment problem, contact support@evlightshows.com and we will review the issue.',
  },
  {
    q: 'Can I resell the files I download?',
    a: 'Purchased generated files are for personal use with your own compatible vehicle unless EVLightShows.com gives written permission for another use.',
  },
  {
    q: 'How do I contact support?',
    a: 'Email support@evlightshows.com with your order number, checkout email, and a description of the issue.',
  },
];

export default function FaqPage({ onNavigate }: FaqPageProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQ_ITEMS.map(item => ({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": { "@type": "Answer", "text": item.a }
        }))
      }} />
      <h1 className="text-2xl sm:text-3xl font-display font-bold text-text-primary">Frequently Asked Questions</h1>

      <div className="space-y-3">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center justify-between px-4 sm:px-5 py-4 text-left gap-3"
            >
              <span className="text-text-primary text-sm font-medium">{item.q}</span>
              <ChevronDown
                size={16}
                className={`text-text-secondary shrink-0 transition-transform duration-200 ${openIdx === i ? 'rotate-180' : ''}`}
              />
            </button>
            {openIdx === i && (
              <div className="px-4 sm:px-5 pb-4 pt-0">
                <p className="text-text-secondary text-sm leading-relaxed">{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={() => onNavigate('/')} className="text-electric-cyan hover:text-electric-cyan/80 text-sm font-medium transition-colors">
        &larr; Back to generator
      </button>
    </main>
  );
}
