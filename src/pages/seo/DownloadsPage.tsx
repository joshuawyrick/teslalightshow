import SeoHead from '../../components/SeoHead';
import JsonLd from '../../components/JsonLd';
import { AnswerBox, CTASection, StepGuide, FaqAccordion, ComparisonTable, InternalLinkGrid, IndependentNotice, Breadcrumbs } from '../../components/SeoComponents';

export default function DownloadsPage() {
  return (
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      <SeoHead
        title="Tesla Light Show Downloads | Custom FSEQ Files from Any Song"
        description="Download a custom Tesla light show made from your own MP3 or WAV. Get Tesla-ready FSEQ files, matching audio, setup instructions, and a free 20-second sample option."
        canonical="https://teslalightshows.com/tesla-light-show-downloads"
      />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Tesla Light Show Downloads",
        "description": "Download custom Tesla light show FSEQ files generated from your own MP3 or WAV audio.",
        "url": "https://teslalightshows.com/tesla-light-show-downloads"
      }} />

      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Tesla Light Show Downloads' }]} />

      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-text-primary">Tesla Light Show Downloads</h1>
        <p className="text-text-secondary text-lg leading-relaxed max-w-2xl">
          Stop searching for generic pre-made light shows. Upload your own MP3 or WAV and download a Tesla-ready custom light show package.
        </p>
      </div>

      <AnswerBox>
        TeslaLightShows.com creates downloadable Tesla light show files from your own audio. Instead of picking from a limited library of pre-made shows, you can generate a custom show for a song, holiday, birthday, event, or personal moment.
      </AnswerBox>

      <div className="flex flex-col sm:flex-row gap-3">
        <a href="/tesla-light-show-generator#upload" className="inline-flex items-center justify-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white text-sm font-semibold rounded-xl px-6 py-3 transition-all glow-red">
          Generate a Custom Download
        </a>
        <a href="/tesla-light-show-generator#upload" className="inline-flex items-center justify-center gap-2 bg-charcoal border border-border hover:border-electric-cyan/30 text-text-primary text-sm font-semibold rounded-xl px-6 py-3 transition-all">
          Try a Free 20-Second Sample
        </a>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">What Comes in the Download</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: '.fseq Light Sequence File', desc: 'The Tesla-compatible sequence file that controls vehicle light animations synced to your music.' },
            { title: 'Matching MP3 or WAV Audio', desc: 'Your original audio file, paired to the sequence file so Tesla recognizes the show.' },
            { title: 'USB Setup Instructions', desc: 'Clear instructions for creating the LightShow folder and playing the show from your USB drive.' },
          ].map(card => (
            <div key={card.title} className="bg-charcoal border border-border rounded-xl p-5 space-y-2">
              <h3 className="text-text-primary text-sm font-semibold">{card.title}</h3>
              <p className="text-text-secondary text-xs leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Free Downloads vs. Custom Downloads</h2>
        <ComparisonTable
          headers={['', 'Free download sites', 'TeslaLightShows.com']}
          rows={[
            { feature: 'Song selection', col1: 'Pick from existing pre-made shows', col2: 'Upload your own MP3 or WAV' },
            { feature: 'Customization', col1: 'Limited to songs already created', col2: 'Generate a show for any song' },
            { feature: 'Setup', col1: 'May require manual troubleshooting', col2: 'Download a packaged file set' },
            { feature: 'Choreography', col1: 'Generic choreography', col2: 'Custom show options based on your audio' },
            { feature: 'Best for', col1: 'Browsing existing shows', col2: 'Personal songs and events' },
          ]}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">How to Install Your Download</h2>
        <StepGuide steps={[
          { number: '1', title: 'Download Your Package', text: 'Download the generated show ZIP containing your .fseq and audio file.' },
          { number: '2', title: 'Create LightShow Folder', text: 'On your USB drive, create a folder named exactly LightShow at the root level.' },
          { number: '3', title: 'Extract Files', text: 'Place the matching .fseq and .mp3 or .wav files inside the LightShow folder.' },
          { number: '4', title: 'Plug Into Tesla', text: 'Insert the USB into your Tesla data-capable USB port.' },
          { number: '5', title: 'Open Toybox', text: 'Navigate to Toybox, select Light Show, and choose your custom show.' },
        ]} />
        <a href="/how-to-add-custom-light-show-to-tesla" className="text-electric-cyan hover:text-electric-cyan/80 text-sm font-medium transition-colors">
          Read the full setup guide &rarr;
        </a>
      </section>

      <InternalLinkGrid
        title="Popular Download Types"
        links={[
          { label: 'Halloween Tesla Light Shows', href: '/tesla-halloween-light-show', desc: 'Spooky custom shows for October.' },
          { label: 'Christmas Tesla Light Shows', href: '/tesla-christmas-light-show', desc: 'Holiday-themed light show files.' },
          { label: 'Birthday Tesla Light Shows', href: '/tesla-birthday-light-show', desc: 'Surprise birthday celebrations.' },
          { label: 'Model Y Light Shows', href: '/tesla-model-y-light-show', desc: 'Shows for Model Y owners.' },
          { label: 'Cybertruck Light Shows', href: '/cybertruck-light-show', desc: 'Shows for Cybertruck owners.' },
          { label: 'Custom Song Light Shows', href: '/custom-tesla-light-show', desc: 'Any song you own.' },
        ]}
      />

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Frequently Asked Questions</h2>
        <FaqAccordion items={[
          { q: 'Can I download a Tesla light show for free?', a: 'TeslaLightShows.com offers a free 20-second sample download so you can test the show on your vehicle before purchasing the full-length version.' },
          { q: 'Can I create a Tesla light show from my own song?', a: 'Yes. Upload any MP3 or WAV file you own or have permission to use, and the generator creates a custom light show from your audio.' },
          { q: 'What files are included in a Tesla light show download?', a: 'Each download includes a .fseq sequence file and your matching audio file (.mp3 or .wav), packaged in a ZIP with the correct LightShow folder structure.' },
          { q: 'Do I need a USB drive?', a: 'Yes. Tesla requires custom light shows to be loaded from a USB drive with a folder named LightShow containing the .fseq and audio files.' },
          { q: 'Can I use MP3 files?', a: 'Yes. MP3 is fully supported. WAV files are also supported. Use 44.1 kHz sample rate for best compatibility.' },
          { q: 'Will the download work on Model Y or Model 3?', a: 'Yes. Downloads are designed for compatible Tesla vehicles including Model Y, Model 3, Model S, Model X, and Cybertruck.' },
        ]} />
      </section>

      <CTASection
        headline="Need Tesla-ready files?"
        text="Create a custom FSEQ package with matching audio and setup instructions from your own song."
        buttonText="Generate My Light Show"
        href="/tesla-light-show-generator#upload"
      />

      <IndependentNotice />
    </main>
  );
}
