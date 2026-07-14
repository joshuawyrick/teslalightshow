import SeoHead from '../../components/SeoHead';
import JsonLd from '../../components/JsonLd';
import { AnswerBox, CTASection, StepGuide, FaqAccordion, ComparisonTable, IndependentNotice, Breadcrumbs } from '../../components/SeoComponents';

export default function HowToPage() {
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Add a Custom Light Show to Your Tesla",
    "description": "Learn how to add a custom Tesla light show using a USB drive, LightShow folder, FSEQ file, and matching MP3 or WAV audio.",
    "step": [
      { "@type": "HowToStep", "name": "Create or download your Tesla light show files", "text": "You need a Tesla-compatible .fseq file and a matching audio file. Generate one with EVLightShows.com or create one manually." },
      { "@type": "HowToStep", "name": "Prepare your USB drive", "text": "Use a compatible USB drive formatted as FAT32 or exFAT." },
      { "@type": "HowToStep", "name": "Create a folder named LightShow", "text": "At the top level of the USB drive, create a folder named exactly LightShow." },
      { "@type": "HowToStep", "name": "Add the matching files", "text": "Place your .fseq file and matching .mp3 or .wav file inside the LightShow folder." },
      { "@type": "HowToStep", "name": "Plug the USB into your Tesla", "text": "Insert the USB drive into the vehicle's data-capable USB port." },
      { "@type": "HowToStep", "name": "Schedule and Play Your Light Show", "text": "In the Tesla app go to Set Schedules > Light Show, select your file from the dropdown, choose Now or a future time (use a future time to sync multiple Teslas), toggle on Dance Moves to enable trunk, mirrors, windows, and charge port animations, then tap Confirm. You can also launch directly from Toybox > Light Show on the touchscreen." }
    ]
  };

  return (
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      <SeoHead
        title="How to Add a Custom Light Show to Your Tesla | USB Setup Guide"
        description="Learn how to add a custom Tesla light show using a USB drive, LightShow folder, FSEQ file, and matching MP3 or WAV audio. Or generate Tesla-ready files automatically."
        canonical="https://evlightshows.com/how-to-add-custom-light-show-to-tesla"
      />
      <JsonLd data={howToSchema} />

      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/tesla-light-show-faq' }, { label: 'How to Add a Custom Light Show' }]} />

      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-text-primary">How to Add a Custom Light Show to Your Tesla</h1>
        <p className="text-text-secondary text-base leading-relaxed max-w-2xl">
          Follow these steps to install custom light show files on your Tesla using a USB drive. Works with Model 3, Model Y, Cybertruck, Model S, and Model X.
        </p>
      </div>

      <AnswerBox>
        To add a custom light show to your Tesla, create a USB folder named LightShow, add a matching .fseq file and .mp3 or .wav audio file, plug the USB into your Tesla, then open Toybox and select Light Show.
      </AnswerBox>

      <div className="bg-charcoal border border-electric-cyan/20 rounded-xl p-4 sm:p-5">
        <p className="text-text-secondary text-sm leading-relaxed">
          If you do not want to manually build the .fseq file, <a href="/tesla-light-show-generator#upload" className="text-electric-cyan hover:underline">EVLightShows.com</a> can generate the Tesla-ready files from your uploaded song automatically.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">What You Need</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {['Supported Tesla vehicle', 'USB drive (FAT32/exFAT)', '.fseq sequence file', 'Matching .mp3 or .wav', 'Song you own/have rights to'].map(item => (
            <div key={item} className="bg-charcoal border border-border rounded-xl p-3 text-center">
              <p className="text-text-primary text-xs font-medium">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Step-by-Step Setup</h2>
        <StepGuide steps={[
          { number: '1', title: 'Create or download your light show files', text: 'You need a Tesla-compatible .fseq file and a matching audio file. You can create one manually in advanced software like xLights, or generate one automatically with EVLightShows.com.' },
          { number: '2', title: 'Prepare your USB drive', text: 'Use a compatible USB drive and format it as FAT32 or exFAT. Do not use NTFS.' },
          { number: '3', title: 'Create a folder named LightShow', text: 'At the top level of the USB drive, create a folder named exactly LightShow (case-sensitive).' },
          { number: '4', title: 'Add the matching files', text: 'Place your .fseq file and matching .mp3 or .wav file inside the LightShow folder. Filenames must match (e.g., mysong.fseq and mysong.mp3).' },
          { number: '5', title: 'Plug the USB into your Tesla', text: 'Insert the USB drive into the vehicle data-capable USB port (not a charge-only port).' },
          { number: '6', title: 'Schedule and Play Your Light Show', text: 'In the Tesla app, go to Set Schedules > Light Show. Select your file from the dropdown (Tesla pre-loaded shows and your custom files appear here). Choose Now to start immediately, or pick a future time to sync multiple Teslas simultaneously. Toggle on Dance Moves to activate trunk, mirrors, windows, and charge port animations. Tap Confirm — a countdown timer appears for scheduled shows. You can also launch directly via Toybox > Light Show on the touchscreen.' },
        ]} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Manual Method vs. Generator Method</h2>
        <ComparisonTable
          headers={['', 'Manual method', 'EVLightShows.com']}
          rows={[
            { feature: 'Setup', col1: 'Install and learn xLights or similar', col2: 'Upload MP3 or WAV' },
            { feature: 'Process', col1: 'Map channels manually', col2: 'Generator creates show options' },
            { feature: 'Export', col1: 'Export FSEQ yourself', col2: 'Download Tesla-ready files' },
            { feature: 'Troubleshooting', col1: 'Debug filenames and formats', col2: 'Use packaged setup instructions' },
            { feature: 'Best for', col1: 'Advanced creators', col2: 'Fast custom shows' },
          ]}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Common Mistakes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            'Folder not named exactly LightShow (case-sensitive)',
            'Files are nested inside another subfolder',
            '.fseq and audio filenames do not match',
            'USB formatted as NTFS instead of FAT32/exFAT',
            'Using a charge-only USB port',
            'Vehicle software not updated',
            'Audio file is corrupted or unsupported format',
            'ZIP file was not extracted before copying',
          ].map(mistake => (
            <div key={mistake} className="flex items-start gap-2 bg-charcoal border border-border rounded-lg p-3">
              <span className="text-accent-red text-xs mt-0.5 shrink-0">&#10005;</span>
              <span className="text-text-secondary text-xs">{mistake}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">USB Folder Structure</h2>
        <div className="bg-charcoal border border-border rounded-xl p-5 font-mono text-sm text-text-secondary">
          <pre>{`USB Drive
└── LightShow/
    ├── mysong.fseq
    └── mysong.mp3`}</pre>
        </div>
      </section>

      <CTASection
        headline="Want to skip the manual setup?"
        text="Upload your MP3 or WAV and generate a Tesla-ready light show package with matching filenames and folder structure."
        buttonText="Generate My Light Show"
        href="/tesla-light-show-generator#upload"
        secondary={{ text: 'Troubleshooting guide', href: '/tesla-light-show-not-working' }}
      />

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Frequently Asked Questions</h2>
        <FaqAccordion items={[
          { q: 'What is a .fseq file?', a: 'An FSEQ file is a light sequence file that tells the Tesla which lights to activate and when. It is synced to a matching audio file to create a choreographed light show.' },
          { q: 'Do the filenames need to match?', a: 'Yes. The .fseq file and the audio file must have the same base filename (e.g., song.fseq and song.mp3) for Tesla to recognize them as a pair.' },
          { q: 'Can I have multiple shows on one USB?', a: 'Yes. Place multiple file pairs inside the same LightShow folder. Each pair needs matching filenames.' },
          { q: 'Which USB port should I use?', a: 'Use a data-capable USB port, not a charge-only port. In most Teslas, the glovebox USB port or center console USB port works.' },
          { q: 'What format should the USB drive be?', a: 'FAT32 or exFAT. Do not use NTFS as Tesla may not recognize it.' },
          { q: 'Do I need xLights?', a: 'No. EVLightShows.com generates Tesla-compatible .fseq files automatically from your uploaded audio without any external software.' },
        ]} />
      </section>

      <IndependentNotice />
    </main>
  );
}
