import SeoHead from '../../components/SeoHead';
import JsonLd from '../../components/JsonLd';
import { AnswerBox, CTASection, FaqAccordion, InternalLinkGrid, IndependentNotice, Breadcrumbs } from '../../components/SeoComponents';

export default function CustomShowPage() {
  return (
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      <SeoHead
        title="Custom Tesla Light Show | Create a Show from Your Song"
        description="Create a custom Tesla light show from your own MP3 or WAV. Generate synced FSEQ files, preview options, and download a Tesla-ready light show package."
        canonical="https://evlightshows.com/custom-tesla-light-show"
      />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Custom Tesla Light Show",
        "url": "https://evlightshows.com/custom-tesla-light-show"
      }} />

      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Custom Tesla Light Show' }]} />

      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-text-primary">Custom Tesla Light Show from Your Song</h1>
        <p className="text-text-secondary text-base leading-relaxed max-w-2xl">
          Create a one-of-a-kind Tesla light show using your own MP3 or WAV file. Perfect for birthdays, holidays, proposals, car meets, and personal entertainment.
        </p>
      </div>

      <AnswerBox>
        A custom Tesla light show is a light sequence built around your selected audio instead of a generic pre-made download. EVLightShows.com helps generate custom light show files from your MP3 or WAV so your show matches the song, beat, and event.
      </AnswerBox>

      <a href="/tesla-light-show-generator#upload" className="inline-flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white text-sm font-semibold rounded-xl px-6 py-3 transition-all glow-red">
        Create My Custom Light Show
      </a>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Why Custom Beats Pre-Made Downloads</h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          Most Tesla light show downloads are pre-made with generic songs. A custom light show uses your personal audio, making the experience unique to your event, song choice, and style. The generator analyzes your music's beats, drops, and energy to create a synced sequence that matches your specific track.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { title: 'Your Song, Your Show', desc: 'Use any MP3 or WAV you own. Birthday songs, favorite tracks, holiday music, proposal songs.' },
            { title: 'Beat-Matched Effects', desc: 'The generator detects BPM, kicks, snares, and drops to sync lights to your audio.' },
            { title: 'Multiple Style Options', desc: 'Choose from different show presets and styles. Pick the one that fits your event.' },
          ].map(card => (
            <div key={card.title} className="bg-charcoal border border-border rounded-xl p-4 space-y-1">
              <h3 className="text-text-primary text-sm font-semibold">{card.title}</h3>
              <p className="text-text-secondary text-xs leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Popular Custom Light Show Use Cases</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            'Birthday surprise', 'Wedding proposal', 'Holiday party', 'Car meet showcase',
            'New Year countdown', 'Halloween spooky', 'Christmas celebration', 'Graduation party',
          ].map(item => (
            <div key={item} className="bg-charcoal border border-border rounded-lg p-3 text-center">
              <p className="text-text-primary text-xs font-medium">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <InternalLinkGrid
        title="Explore by Occasion"
        links={[
          { label: 'Halloween Tesla Light Shows', href: '/tesla-halloween-light-show', desc: 'Spooky shows for October.' },
          { label: 'Christmas Tesla Light Shows', href: '/tesla-christmas-light-show', desc: 'Holiday-themed custom shows.' },
          { label: 'Birthday Tesla Light Shows', href: '/tesla-birthday-light-show', desc: 'Birthday celebration shows.' },
          { label: 'New Year Tesla Light Shows', href: '/tesla-new-year-light-show', desc: 'Countdown and party shows.' },
        ]}
      />

      <CTASection
        headline="Ready to create your custom show?"
        text="Upload your MP3 or WAV file and generate a Tesla-ready light show package in minutes."
        buttonText="Generate My Light Show"
        href="/tesla-light-show-generator#upload"
        secondary={{ text: 'See examples', href: '/tesla-light-show-gallery' }}
      />

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Frequently Asked Questions</h2>
        <FaqAccordion items={[
          { q: 'Can I use any song for a custom Tesla light show?', a: 'You can use any MP3 or WAV file you own or have permission to use. The generator works with any audio content.' },
          { q: 'How long does it take to generate a custom show?', a: 'Generation typically takes seconds. The process happens in your browser using audio analysis.' },
          { q: 'What vehicles support custom light shows?', a: 'Model 3, Model Y, Model S (2021+), Model X (2021+), and Cybertruck support custom light shows via USB.' },
          { q: 'Do I need any special software?', a: 'No. EVLightShows.com works in your web browser. No downloads or installations required.' },
        ]} />
      </section>

      <IndependentNotice />
    </main>
  );
}
