import SeoHead from '../../components/SeoHead';
import JsonLd from '../../components/JsonLd';
import { AnswerBox, CTASection, FaqAccordion, IndependentNotice, Breadcrumbs } from '../../components/SeoComponents';

export default function TroubleshootingPage() {
  return (
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      <SeoHead
        title="Tesla Light Show Not Working? Fix USB, File, and Folder Issues"
        description="Fix a Tesla custom light show that is not showing or not working. Check your USB format, LightShow folder, FSEQ file, matching MP3 or WAV, and vehicle setup."
        canonical="https://teslalightshows.com/tesla-light-show-not-working"
      />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "Why is my Tesla light show not working?", "acceptedAnswer": { "@type": "Answer", "text": "The most common causes are an incorrectly named LightShow folder, mismatched .fseq and audio filenames, unsupported USB formatting, nested folders, or an audio file the car cannot read." }}
        ]
      }} />

      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/tesla-light-show-faq' }, { label: 'Tesla Light Show Not Working' }]} />

      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-text-primary">Tesla Light Show Not Working? Here's How to Fix It</h1>
        <p className="text-text-secondary text-base leading-relaxed max-w-2xl">
          Troubleshoot common issues with Tesla custom light shows including USB problems, file errors, and folder structure mistakes.
        </p>
      </div>

      <AnswerBox>
        If your Tesla light show is not working, the most common causes are an incorrectly named LightShow folder, mismatched .fseq and audio filenames, unsupported USB formatting, nested folders, or an audio file the car cannot read.
      </AnswerBox>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Troubleshooting Checklist</h2>
        <div className="space-y-2">
          {[
            'Is the folder named exactly LightShow? (case-sensitive)',
            'Is the LightShow folder at the top level of the USB drive?',
            'Are the .fseq and audio files inside that folder (not nested deeper)?',
            'Do the filenames match before the extension? (e.g., song.fseq + song.mp3)',
            'Is the audio file .mp3 or .wav format?',
            'Is the USB formatted as FAT32 or exFAT (not NTFS)?',
            'Did you unzip the downloaded package before copying?',
            'Are you using a data-capable USB port (not charge-only)?',
            'Is the vehicle software up to date?',
            'Does your Tesla model support custom light shows?',
          ].map((item, i) => (
            <label key={i} className="flex items-start gap-3 bg-charcoal border border-border rounded-lg p-3 cursor-pointer hover:border-electric-cyan/20 transition-colors">
              <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-border bg-midnight accent-electric-cyan shrink-0" />
              <span className="text-text-primary text-sm">{item}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Custom light show does not appear in Toybox</h2>
        <div className="bg-charcoal border border-border rounded-xl p-5 space-y-3">
          <p className="text-text-secondary text-sm leading-relaxed">Likely causes:</p>
          <ul className="space-y-1 text-text-secondary text-sm list-disc list-inside pl-2">
            <li>Folder name is wrong (must be exactly <code className="text-electric-cyan">LightShow</code>)</li>
            <li>Files are nested inside another folder within LightShow</li>
            <li>USB drive is not recognized by the vehicle</li>
            <li>FSEQ and audio filenames do not match</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Light show says "not ready"</h2>
        <div className="bg-charcoal border border-border rounded-xl p-5 space-y-3">
          <p className="text-text-secondary text-sm leading-relaxed">Likely causes:</p>
          <ul className="space-y-1 text-text-secondary text-sm list-disc list-inside pl-2">
            <li>Doors, trunk, or frunk may need to be closed first</li>
            <li>Vehicle is still preparing the show</li>
            <li>Show file may be corrupt or too large</li>
            <li>USB read error</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Music plays but lights do not sync</h2>
        <div className="bg-charcoal border border-border rounded-xl p-5 space-y-3">
          <p className="text-text-secondary text-sm leading-relaxed">Likely causes:</p>
          <ul className="space-y-1 text-text-secondary text-sm list-disc list-inside pl-2">
            <li>Wrong FSEQ file paired with the audio</li>
            <li>Audio was edited or trimmed after the sequence was generated</li>
            <li>Audio sample rate is 48 kHz instead of 44.1 kHz</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">USB drive is not recognized</h2>
        <div className="bg-charcoal border border-border rounded-xl p-5 space-y-3">
          <p className="text-text-secondary text-sm leading-relaxed">Likely causes:</p>
          <ul className="space-y-1 text-text-secondary text-sm list-disc list-inside pl-2">
            <li>USB formatted as NTFS (use FAT32 or exFAT instead)</li>
            <li>Using a charge-only USB port</li>
            <li>Defective USB drive</li>
            <li>USB drive requires too much power</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Correct Folder Structure</h2>
        <div className="bg-charcoal border border-border rounded-xl p-5 font-mono text-sm text-text-secondary">
          <pre>{`USB Drive (FAT32 or exFAT)
└── LightShow/
    ├── mysong.fseq
    └── mysong.mp3`}</pre>
        </div>
      </section>

      <CTASection
        headline="Still stuck? Generate a fresh light show package."
        text="Get properly named files with matching extensions and the correct folder structure, ready to copy to USB."
        buttonText="Generate a New Light Show"
        href="/tesla-light-show-generator"
        secondary={{ text: 'USB setup guide', href: '/tesla-light-show-usb-setup' }}
      />

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Related Guides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a href="/how-to-add-custom-light-show-to-tesla" className="bg-charcoal border border-border rounded-xl p-4 hover:border-electric-cyan/30 transition-all group">
            <p className="text-text-primary text-sm font-medium group-hover:text-electric-cyan transition-colors">How to Add a Custom Light Show</p>
            <p className="text-text-secondary text-xs mt-1">Full installation guide</p>
          </a>
          <a href="/tesla-light-show-usb-setup" className="bg-charcoal border border-border rounded-xl p-4 hover:border-electric-cyan/30 transition-all group">
            <p className="text-text-primary text-sm font-medium group-hover:text-electric-cyan transition-colors">USB Setup Guide</p>
            <p className="text-text-secondary text-xs mt-1">Folder and file details</p>
          </a>
          <a href="/tesla-light-show-faq" className="bg-charcoal border border-border rounded-xl p-4 hover:border-electric-cyan/30 transition-all group">
            <p className="text-text-primary text-sm font-medium group-hover:text-electric-cyan transition-colors">FAQ Hub</p>
            <p className="text-text-secondary text-xs mt-1">Common questions answered</p>
          </a>
        </div>
      </section>

      <IndependentNotice />
    </main>
  );
}
