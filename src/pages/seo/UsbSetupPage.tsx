import SeoHead from '../../components/SeoHead';
import JsonLd from '../../components/JsonLd';
import { AnswerBox, CTASection, StepGuide, FaqAccordion, IndependentNotice, Breadcrumbs } from '../../components/SeoComponents';

export default function UsbSetupPage() {
  return (
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      <SeoHead
        title="Tesla Light Show USB Setup | Folder, FSEQ, MP3 and WAV Guide"
        description="Set up a USB drive for a custom Tesla light show. Learn the LightShow folder name, FSEQ file requirements, audio file matching, and common USB mistakes."
        canonical="https://evlightshows.com/tesla-light-show-usb-setup"
      />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "Tesla Light Show USB Setup",
        "description": "Set up a USB drive for Tesla custom light shows with the correct folder structure and file naming.",
        "step": [
          { "@type": "HowToStep", "name": "Format USB drive", "text": "Format your USB drive as FAT32 or exFAT." },
          { "@type": "HowToStep", "name": "Create LightShow folder", "text": "Create a folder named exactly LightShow at the root of the USB drive." },
          { "@type": "HowToStep", "name": "Add matching files", "text": "Place .fseq and matching .mp3 or .wav files inside the LightShow folder with matching filenames." }
        ]
      }} />

      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/tesla-light-show-faq' }, { label: 'USB Setup' }]} />

      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-text-primary">Tesla Light Show USB Setup</h1>
        <p className="text-text-secondary text-base leading-relaxed max-w-2xl">
          Learn how to correctly prepare a USB drive for custom Tesla light shows including folder structure, file naming, and format requirements.
        </p>
      </div>

      <AnswerBox>
        To set up a USB for a Tesla light show, format the drive as FAT32 or exFAT, create a folder named exactly LightShow at the root level, and place matching .fseq and .mp3 or .wav files inside with identical base filenames.
      </AnswerBox>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Correct Folder Structure</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-charcoal border border-border rounded-xl p-5 space-y-2">
            <h3 className="text-text-primary text-sm font-semibold">MP3 Example</h3>
            <div className="font-mono text-xs text-text-secondary">
              <pre>{`USB Drive
└── LightShow/
    ├── my-song.fseq
    └── my-song.mp3`}</pre>
            </div>
          </div>
          <div className="bg-charcoal border border-border rounded-xl p-5 space-y-2">
            <h3 className="text-text-primary text-sm font-semibold">WAV Example</h3>
            <div className="font-mono text-xs text-text-secondary">
              <pre>{`USB Drive
└── LightShow/
    ├── holiday-show.fseq
    └── holiday-show.wav`}</pre>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Setup Steps</h2>
        <StepGuide steps={[
          { number: '1', title: 'Format Your USB Drive', text: 'Use FAT32 or exFAT format. Do not use NTFS. On Mac, use MS-DOS FAT or ExFAT. On Windows, right-click the drive and choose Format.' },
          { number: '2', title: 'Create the LightShow Folder', text: 'At the root/top level of the USB drive, create a folder named exactly LightShow. This is case-sensitive. Do not nest it inside other folders.' },
          { number: '3', title: 'Add Your Files', text: 'Place the .fseq sequence file and matching audio file (.mp3 or .wav) inside the LightShow folder. Both files must have the same base name.' },
          { number: '4', title: 'Verify File Names Match', text: 'Example: song.fseq and song.mp3. The names before the extension must be identical for Tesla to pair them.' },
          { number: '5', title: 'Safely Eject and Insert', text: 'Eject the USB from your computer, then insert it into your Tesla data-capable USB port.' },
          { number: '6', title: 'Play Your Show', text: 'Navigate to Toybox > Light Show in your Tesla touchscreen and select your custom show.' },
        ]} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">File Naming Rules</h2>
        <div className="bg-charcoal border border-border rounded-xl p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-electric-cyan text-sm font-semibold">Correct</h3>
              <ul className="space-y-1 text-text-secondary text-xs">
                <li><code>birthday.fseq</code> + <code>birthday.mp3</code></li>
                <li><code>xmas-show.fseq</code> + <code>xmas-show.wav</code></li>
                <li><code>lightshow.fseq</code> + <code>lightshow.mp3</code></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-accent-red text-sm font-semibold">Incorrect</h3>
              <ul className="space-y-1 text-text-secondary text-xs">
                <li><code>show.fseq</code> + <code>mysong.mp3</code> (names don't match)</li>
                <li><code>Show.fseq</code> + <code>show.mp3</code> (case mismatch on some systems)</li>
                <li><code>lightshow.fseq</code> only (missing audio)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Supported Audio Formats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-charcoal border border-border rounded-xl p-4">
            <h3 className="text-text-primary text-sm font-semibold">MP3</h3>
            <p className="text-text-secondary text-xs mt-1">Most common format. Use 44.1 kHz sample rate for best compatibility.</p>
          </div>
          <div className="bg-charcoal border border-border rounded-xl p-4">
            <h3 className="text-text-primary text-sm font-semibold">WAV</h3>
            <p className="text-text-secondary text-xs mt-1">Uncompressed audio. Use 44.1 kHz. Note: 48 kHz may cause sync drift.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Multiple Shows on One USB</h2>
        <div className="bg-charcoal border border-border rounded-xl p-5 space-y-2">
          <p className="text-text-secondary text-sm">You can store multiple light shows on one USB drive. Each show needs its own file pair inside the LightShow folder:</p>
          <div className="font-mono text-xs text-text-secondary mt-2">
            <pre>{`USB Drive
└── LightShow/
    ├── birthday.fseq
    ├── birthday.mp3
    ├── holiday.fseq
    ├── holiday.wav
    ├── party.fseq
    └── party.mp3`}</pre>
          </div>
        </div>
      </section>

      <CTASection
        headline="Need Tesla-ready files?"
        text="Skip the manual file creation. Upload your song and download a properly structured light show package."
        buttonText="Generate My Light Show"
        href="/tesla-light-show-generator#upload"
        secondary={{ text: 'Troubleshooting', href: '/tesla-light-show-not-working' }}
      />

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Frequently Asked Questions</h2>
        <FaqAccordion items={[
          { q: 'What USB format does Tesla require?', a: 'FAT32 or exFAT. NTFS is not reliably supported. On Mac, choose MS-DOS FAT or ExFAT when formatting.' },
          { q: 'Does the folder name need to be exact?', a: 'Yes. The folder must be named exactly LightShow (capital L, capital S) at the root of the USB drive.' },
          { q: 'Can I use the same USB for TeslaCam and Light Show?', a: 'It is recommended to use a separate USB drive for light shows to avoid conflicts with TeslaCam or other Tesla USB features.' },
          { q: 'Which USB port should I use?', a: 'Use a data-capable USB port. The glovebox USB port works in most models. Center console ports may also work depending on your vehicle.' },
          { q: 'What if my USB is not recognized?', a: 'Try reformatting as FAT32, using a different USB drive, or using a different port. Some USB hubs may not work.' },
        ]} />
      </section>

      <IndependentNotice />
    </main>
  );
}
