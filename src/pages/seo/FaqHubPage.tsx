import SeoHead from '../../components/SeoHead';
import JsonLd from '../../components/JsonLd';
import { FaqAccordion, CTASection, IndependentNotice, Breadcrumbs } from '../../components/SeoComponents';

export default function FaqHubPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "What is a Tesla light show?", "acceptedAnswer": { "@type": "Answer", "text": "A Tesla light show is a choreographed sequence of vehicle light animations synced to music, played from a USB drive using Tesla's built-in Light Show feature." }},
      { "@type": "Question", "name": "What is an FSEQ file?", "acceptedAnswer": { "@type": "Answer", "text": "An FSEQ file is a light sequence file that controls which vehicle lights activate and when. It is paired with a matching audio file to create a synced light show." }},
      { "@type": "Question", "name": "Do I need xLights to make a Tesla light show?", "acceptedAnswer": { "@type": "Answer", "text": "No. TeslaLightShows.com generates Tesla-compatible FSEQ files automatically from your uploaded MP3 or WAV without requiring xLights." }},
    ]
  };

  return (
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      <SeoHead
        title="Tesla Light Show FAQ | Generator, Downloads, USB Setup and FSEQ Files"
        description="Answers to common Tesla light show questions about generators, downloads, FSEQ files, MP3 and WAV audio, USB setup, Model Y, Model 3, Cybertruck, and troubleshooting."
        canonical="https://teslalightshows.com/tesla-light-show-faq"
      />
      <JsonLd data={faqSchema} />

      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Tesla Light Show FAQ' }]} />

      <h1 className="text-3xl sm:text-4xl font-display font-bold text-text-primary">Tesla Light Show FAQ</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Basics</h2>
        <FaqAccordion items={[
          { q: 'What is a Tesla light show?', a: 'A Tesla light show is a choreographed sequence of vehicle light animations synced to music. It plays from a USB drive using Tesla\'s built-in Light Show feature in Toybox.' },
          { q: 'What is a custom Tesla light show?', a: 'A custom Tesla light show is one created from your own audio file, rather than a pre-made show downloaded from a library. It matches the lights to your specific song.' },
          { q: 'What is a Tesla light show generator?', a: 'A Tesla light show generator is software that converts music into a Tesla-compatible FSEQ sequence file. TeslaLightShows.com lets you upload an MP3 or WAV and download the generated files.' },
          { q: 'Can I make a Tesla light show from any song?', a: 'Yes. You can use any MP3 or WAV file you own or have permission to use. The generator analyzes your audio and creates a synced light sequence.' },
        ]} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Files</h2>
        <FaqAccordion items={[
          { q: 'What is an FSEQ file?', a: 'An FSEQ file is a light sequence file that controls which vehicle lights activate and when. It uses the FSEQ v2.0 format with 200 channels and 20ms frame timing.' },
          { q: 'Do Tesla light shows use MP3 or WAV?', a: 'Both are supported. MP3 is more common. Use 44.1 kHz sample rate for best compatibility. 48 kHz audio may cause timing drift.' },
          { q: 'Do the filenames need to match?', a: 'Yes. The .fseq and audio files must have the same base filename (e.g., song.fseq and song.mp3) for Tesla to recognize them as a pair.' },
          { q: 'What folder name does Tesla use for custom light shows?', a: 'Tesla requires a folder named exactly LightShow (case-sensitive) at the root of the USB drive.' },
        ]} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Generator</h2>
        <FaqAccordion items={[
          { q: 'How does TeslaLightShows.com work?', a: 'Upload your MP3 or WAV, choose a vehicle profile and show style, then the generator analyzes your audio for beats, drops, and energy to create multiple synced light show options you can download.' },
          { q: 'Do I need xLights?', a: 'No. TeslaLightShows.com generates Tesla-compatible FSEQ files automatically from your uploaded audio without requiring xLights or any other desktop software.' },
          { q: 'Can I preview before downloading?', a: 'The generator creates multiple show presets you can compare before choosing which to download.' },
          { q: 'Can I generate a free sample?', a: 'Yes. New accounts get one free 20-second snippet to test on your vehicle before purchasing full-length shows.' },
        ]} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">USB Setup</h2>
        <FaqAccordion items={[
          { q: 'How do I put a light show on a USB drive?', a: 'Format the USB as FAT32 or exFAT, create a LightShow folder at the root, and place matching .fseq and audio files inside. See the full USB setup guide for details.' },
          { q: 'Why is my USB not working?', a: 'Common causes: wrong format (use FAT32/exFAT, not NTFS), wrong folder name, charge-only USB port, or mismatched filenames. See the troubleshooting guide.' },
          { q: 'What format should the USB drive use?', a: 'FAT32 or exFAT. Do not use NTFS. On Mac, choose MS-DOS FAT or ExFAT when formatting.' },
        ]} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Models</h2>
        <FaqAccordion items={[
          { q: 'Does Model Y support custom light shows?', a: 'Yes. Tesla Model Y (including Juniper) supports custom light shows via USB.' },
          { q: 'Does Model 3 support custom light shows?', a: 'Yes. Tesla Model 3 (including Highland) supports custom light shows via USB.' },
          { q: 'Does Cybertruck support custom light shows?', a: 'Yes. Cybertruck supports custom light shows with its 60-LED front light bar.' },
          { q: 'Do Model S and Model X support custom light shows?', a: 'Yes. Model S (2021+) and Model X (2021+) support custom light shows. Model X can include Falcon Wing door movements.' },
        ]} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Legal / Affiliation</h2>
        <FaqAccordion items={[
          { q: 'Is TeslaLightShows.com affiliated with Tesla?', a: 'No. TeslaLightShows.com is an independent digital service and is not affiliated with, endorsed by, sponsored by, or approved by Tesla, Inc.' },
          { q: 'Can I upload copyrighted music?', a: 'You must own the audio file or have permission to use it. Do not upload music you do not have the right to use.' },
          { q: 'Who owns the uploaded audio?', a: 'You retain ownership of your uploaded audio. TeslaLightShows.com uses it only to generate your requested light show files.' },
        ]} />
      </section>

      <CTASection
        headline="Ready to create your light show?"
        text="Upload your MP3 or WAV and generate Tesla-ready FSEQ files."
        buttonText="Generate My Light Show"
        href="/tesla-light-show-generator#upload"
        secondary={{ text: 'USB setup guide', href: '/tesla-light-show-usb-setup' }}
      />

      <IndependentNotice />
    </main>
  );
}
