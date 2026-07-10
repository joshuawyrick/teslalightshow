import SeoHead from '../../components/SeoHead';
import { AnswerBox, CTASection, FaqAccordion, InternalLinkGrid, IndependentNotice, Breadcrumbs } from '../../components/SeoComponents';

function ModelPageTemplate({ title, seoTitle, description, canonical, h1, intro, vehicleNotes, breadcrumbLabel }: {
  title: string; seoTitle: string; description: string; canonical: string; h1: string; intro: string; vehicleNotes: string; breadcrumbLabel: string;
}) {
  return (
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      <SeoHead title={seoTitle} description={description} canonical={canonical} />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Models', href: '/tesla-light-show-models' }, { label: breadcrumbLabel }]} />
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-text-primary">{h1}</h1>
        <p className="text-text-secondary text-base leading-relaxed max-w-2xl">{intro}</p>
      </div>
      <AnswerBox>{vehicleNotes}</AnswerBox>
      <a href="/tesla-light-show-generator#upload" className="inline-flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white text-sm font-semibold rounded-xl px-6 py-3 transition-all glow-red">
        Generate My {title} Light Show
      </a>
      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">How {title} Light Shows Work</h2>
        <p className="text-text-secondary text-sm leading-relaxed">Upload your MP3 or WAV, select the appropriate vehicle profile in the generator, choose your preferred show style, and download Tesla-ready FSEQ files. The generated sequence uses the full range of supported light channels for your vehicle model.</p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Popular {title} Light Show Ideas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {['Holiday celebration', 'Birthday surprise', 'Car meet showcase', 'Personal favorite song', 'Patriotic event', 'Party entrance'].map(idea => (
            <div key={idea} className="bg-charcoal border border-border rounded-lg p-3 text-center">
              <p className="text-text-primary text-xs font-medium">{idea}</p>
            </div>
          ))}
        </div>
      </section>
      <CTASection
        headline={`Create a ${title} Light Show`}
        text="Upload your song and generate Tesla-ready FSEQ files matched to your vehicle."
        buttonText="Generate My Light Show"
        href="/tesla-light-show-generator#upload"
        secondary={{ text: 'USB setup guide', href: '/tesla-light-show-usb-setup' }}
      />
      <FaqAccordion items={[
        { q: `Does ${title} support custom light shows?`, a: `Yes. ${title} supports custom light shows loaded from a USB drive with the correct LightShow folder structure.` },
        { q: 'What files do I need?', a: 'You need a .fseq sequence file and a matching .mp3 or .wav audio file, placed inside a LightShow folder on a FAT32 or exFAT USB drive.' },
        { q: 'Do I need special software?', a: 'No. TeslaLightShows.com generates the files in your browser. No xLights or other software required.' },
      ]} />
      <IndependentNotice />
    </main>
  );
}

export function ModelYPage() {
  return <ModelPageTemplate
    title="Model Y"
    seoTitle="Tesla Model Y Light Show Generator | Custom MP3 and WAV Shows"
    description="Create a custom Tesla Model Y light show from your own MP3 or WAV. Generate downloadable FSEQ files and setup instructions for your Model Y."
    canonical="https://teslalightshows.com/tesla-model-y-light-show"
    h1="Tesla Model Y Light Show Generator"
    intro="Create custom light shows designed for your Tesla Model Y. Upload any MP3 or WAV and generate Tesla-ready FSEQ files."
    vehicleNotes="Tesla Model Y supports custom light shows through the Light Show feature in Toybox. Upload your song, select the Model Y profile, and download FSEQ files ready for USB playback."
    breadcrumbLabel="Model Y"
  />;
}

export function Model3Page() {
  return <ModelPageTemplate
    title="Model 3"
    seoTitle="Tesla Model 3 Light Show Generator | Custom FSEQ Files"
    description="Create a custom Tesla Model 3 light show from your own MP3 or WAV. Generate Tesla-ready FSEQ files, download your show, and play it from USB."
    canonical="https://teslalightshows.com/tesla-model-3-light-show"
    h1="Tesla Model 3 Light Show Generator"
    intro="Create custom light shows for your Tesla Model 3 or Model 3 Highland. Upload any song and generate Tesla-ready FSEQ files."
    vehicleNotes="Tesla Model 3 (including Highland) supports custom light shows loaded from USB. Select the Model 3 or Model 3 Highland profile in the generator for the best-matched show output."
    breadcrumbLabel="Model 3"
  />;
}

export function CybertruckPage() {
  return <ModelPageTemplate
    title="Cybertruck"
    seoTitle="Cybertruck Light Show Generator | Custom Tesla Light Shows"
    description="Create a custom Cybertruck light show from your own MP3 or WAV. Generate Tesla-ready FSEQ files and download a custom light show package."
    canonical="https://teslalightshows.com/cybertruck-light-show"
    h1="Cybertruck Light Show Generator"
    intro="Create custom light shows that take advantage of the Cybertruck's unique 60-LED front light bar and rear bar chase effects."
    vehicleNotes="Cybertruck supports custom light shows with its full 60-LED front light bar VU meter and rear bar chase. Select the Cybertruck profile in the generator for sequences optimized for this vehicle's expanded light capabilities."
    breadcrumbLabel="Cybertruck"
  />;
}

export function ModelSXPage() {
  return <ModelPageTemplate
    title="Model S / Model X"
    seoTitle="Tesla Model S and Model X Light Show Generator | Custom FSEQ Files"
    description="Create custom Tesla Model S and Model X light shows from MP3 or WAV files. Generate Tesla-ready FSEQ files and download setup instructions."
    canonical="https://teslalightshows.com/tesla-model-s-model-x-light-show"
    h1="Tesla Model S and Model X Light Show Generator"
    intro="Create custom light shows for your Tesla Model S (2021+) or Model X (2021+), including Falcon Wing door effects."
    vehicleNotes="Tesla Model S (2021+) and Model X (2021+) support custom light shows via USB. Model X shows can include Falcon Wing door movements. Select the appropriate vehicle profile in the generator."
    breadcrumbLabel="Model S / Model X"
  />;
}

export function ModelsHubPage() {
  return (
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      <SeoHead
        title="Tesla Light Show Compatibility by Model | Model 3, Model Y, Cybertruck, S and X"
        description="Learn which Tesla vehicles support custom light shows and create downloadable FSEQ files for Model 3, Model Y, Cybertruck, Model S, and Model X."
        canonical="https://teslalightshows.com/tesla-light-show-models"
      />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Model Compatibility' }]} />
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-text-primary">Tesla Light Show Compatibility by Model</h1>
        <p className="text-text-secondary text-base leading-relaxed max-w-2xl">
          Tesla custom light show files are designed for supported Tesla vehicles. Vehicle profiles help tailor the show style for the model you drive.
        </p>
      </div>
      <AnswerBox>
        Tesla vehicles that support custom light shows include Model 3, Model 3 Highland, Model Y, Model Y Juniper, Model S (2021+), Model X (2021+), and Cybertruck. All use the same USB-based LightShow folder structure.
      </AnswerBox>
      <InternalLinkGrid
        title="Choose Your Vehicle"
        links={[
          { label: 'Tesla Model Y Light Show', href: '/tesla-model-y-light-show', desc: 'Custom shows for Model Y and Model Y Juniper.' },
          { label: 'Tesla Model 3 Light Show', href: '/tesla-model-3-light-show', desc: 'Custom shows for Model 3 and Model 3 Highland.' },
          { label: 'Cybertruck Light Show', href: '/cybertruck-light-show', desc: 'Shows with 60-LED front bar and rear chase.' },
          { label: 'Model S / Model X Light Show', href: '/tesla-model-s-model-x-light-show', desc: 'Shows for Model S and Model X (2021+).' },
        ]}
      />
      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">What Changes Between Vehicles</h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          The core FSEQ file format and USB structure are shared across all supported Tesla vehicles. Vehicle profiles in the generator help optimize the show by considering each model's unique light hardware. For example, Cybertruck has a 60-LED front bar, Model X supports Falcon Wing door movements, and Model 3 Highland has an updated front light bar.
        </p>
      </section>
      <CTASection
        headline="Generate a Light Show for Your Tesla"
        text="Select your vehicle profile, upload your song, and download Tesla-ready files."
        buttonText="Generate My Light Show"
        href="/tesla-light-show-generator#upload"
      />
      <IndependentNotice />
    </main>
  );
}
