import SeoHead from '../../components/SeoHead';
import { AnswerBox, CTASection, FaqAccordion, InternalLinkGrid, IndependentNotice, Breadcrumbs } from '../../components/SeoComponents';

function SeasonalTemplate({ seoTitle, description, canonical, h1, intro, answerText, ideas, breadcrumbLabel, ctaText }: {
  seoTitle: string; description: string; canonical: string; h1: string; intro: string; answerText: string; ideas: string[]; breadcrumbLabel: string; ctaText: string;
}) {
  return (
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      <SeoHead title={seoTitle} description={description} canonical={canonical} />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Ideas', href: '/tesla-light-show-ideas' }, { label: breadcrumbLabel }]} />
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-text-primary">{h1}</h1>
        <p className="text-text-secondary text-base leading-relaxed max-w-2xl">{intro}</p>
      </div>
      <AnswerBox>{answerText}</AnswerBox>
      <a href="/tesla-light-show-generator#upload" className="inline-flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white text-sm font-semibold rounded-xl px-6 py-3 transition-all glow-red">
        {ctaText}
      </a>
      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">Show Ideas and Tips</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ideas.map(idea => (
            <div key={idea} className="bg-charcoal border border-border rounded-lg p-3 text-center">
              <p className="text-text-primary text-xs font-medium">{idea}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">How to Create Your Show</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { n: '1', title: 'Upload Your Song', text: 'Choose an MP3 or WAV that fits the occasion.' },
            { n: '2', title: 'Choose Style', text: 'Select a matching color theme and show energy level.' },
            { n: '3', title: 'Download & Play', text: 'Get Tesla-ready files and load them onto your USB drive.' },
          ].map(step => (
            <div key={step.n} className="bg-charcoal border border-border rounded-xl p-4 space-y-1">
              <div className="w-6 h-6 rounded bg-electric-cyan/15 border border-electric-cyan/25 text-electric-cyan font-bold text-xs flex items-center justify-center">{step.n}</div>
              <h3 className="text-text-primary text-sm font-semibold">{step.title}</h3>
              <p className="text-text-secondary text-xs leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </section>
      <CTASection
        headline="Create Your Custom Show"
        text="Upload your own legally obtained MP3 or WAV and generate a Tesla-ready light show package."
        buttonText="Generate My Light Show"
        href="/tesla-light-show-generator#upload"
        secondary={{ text: 'USB setup guide', href: '/tesla-light-show-usb-setup' }}
      />
      <InternalLinkGrid
        title="More Light Show Ideas"
        links={[
          { label: 'Tesla Light Show Ideas', href: '/tesla-light-show-ideas', desc: 'Browse all occasion ideas.' },
          { label: 'Custom Tesla Light Show', href: '/custom-tesla-light-show', desc: 'Create from any song.' },
          { label: 'Tesla Light Show Gallery', href: '/tesla-light-show-gallery', desc: 'See example shows.' },
        ]}
      />
      <IndependentNotice />
    </main>
  );
}

export function HalloweenPage() {
  return <SeasonalTemplate
    seoTitle="Tesla Halloween Light Show Generator | Custom Spooky Light Shows"
    description="Create a Tesla Halloween light show from your own MP3 or WAV. Generate spooky custom FSEQ files and download a Tesla-ready light show package."
    canonical="https://teslalightshows.com/tesla-halloween-light-show"
    h1="Tesla Halloween Light Show Generator"
    intro="Create a spooky custom Tesla light show for Halloween using your own music. Perfect for trick-or-treaters, Halloween parties, and haunted house vibes."
    answerText="Upload a spooky or high-energy Halloween song (MP3 or WAV you own), select a Halloween color theme with purple and orange styling, and generate a Tesla-ready FSEQ light show file."
    ideas={['Spooky ambient track', 'Thriller-style beat', 'Haunted house music', 'Monster mash party', 'Creepy instrumental', 'High-energy Halloween EDM']}
    breadcrumbLabel="Halloween"
    ctaText="Create Halloween Light Show"
  />;
}

export function ChristmasPage() {
  return <SeasonalTemplate
    seoTitle="Tesla Christmas Light Show Generator | Custom Holiday Shows"
    description="Create a Tesla Christmas light show from your own holiday music. Generate Tesla-ready FSEQ files from MP3 or WAV and download your custom show."
    canonical="https://teslalightshows.com/tesla-christmas-light-show"
    h1="Tesla Christmas Light Show Generator"
    intro="Create a festive Tesla light show for the holidays using your favorite Christmas music. Red and green themed shows for the season."
    answerText="Upload your own holiday music (MP3 or WAV you own or have rights to), select a Christmas color theme with red and green styling, and generate a Tesla-ready FSEQ light show file."
    ideas={['Classic holiday song', 'Trans-Siberian Orchestra style', 'Carol sing-along', 'Instrumental Christmas', 'Modern holiday remix', 'Nutcracker theme']}
    breadcrumbLabel="Christmas"
    ctaText="Create Christmas Light Show"
  />;
}

export function BirthdayPage() {
  return <SeasonalTemplate
    seoTitle="Tesla Birthday Light Show Generator | Custom Birthday Shows"
    description="Create a custom Tesla birthday light show from your own song. Generate a Tesla-ready FSEQ package for birthday surprises, parties, and celebrations."
    canonical="https://teslalightshows.com/tesla-birthday-light-show"
    h1="Tesla Birthday Light Show Generator"
    intro="Surprise someone with a personalized Tesla light show for their birthday. Upload their favorite song and create a one-of-a-kind celebration."
    answerText="Upload a birthday celebrant's favorite song (MP3 or WAV you own), choose a fun and dynamic color theme, and generate a Tesla light show that makes the moment unforgettable."
    ideas={['Happy Birthday remix', 'Their favorite song', 'Party anthem', 'Surprise reveal track', 'Childhood favorite', 'Custom birthday mix']}
    breadcrumbLabel="Birthday"
    ctaText="Create Birthday Light Show"
  />;
}

export function NewYearPage() {
  return <SeasonalTemplate
    seoTitle="Tesla New Year Light Show Generator | Custom Countdown Shows"
    description="Create a custom Tesla New Year light show from your own MP3 or WAV. Generate countdown, celebration, and party-style Tesla light show files."
    canonical="https://teslalightshows.com/tesla-new-year-light-show"
    h1="Tesla New Year Light Show Generator"
    intro="Ring in the new year with a custom Tesla light show. Create countdown and celebration sequences from your favorite party music."
    answerText="Upload a New Year celebration track (MP3 or WAV you own), select a high-energy show style, and generate a Tesla light show perfect for midnight countdowns and celebrations."
    ideas={['Countdown track', 'Auld Lang Syne remix', 'Firework celebration beat', 'Midnight party anthem', 'EDM drop for midnight', 'Classic celebration song']}
    breadcrumbLabel="New Year"
    ctaText="Create New Year Light Show"
  />;
}

export function IdeasPage() {
  return (
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      <SeoHead
        title="Tesla Light Show Ideas | Songs, Holidays, Birthdays and Events"
        description="Explore Tesla light show ideas for holidays, birthdays, parties, weddings, car meets, New Year, Halloween, Christmas, and custom songs."
        canonical="https://teslalightshows.com/tesla-light-show-ideas"
      />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Light Show Ideas' }]} />
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-text-primary">Tesla Light Show Ideas</h1>
        <p className="text-text-secondary text-base leading-relaxed max-w-2xl">
          Inspiration for custom Tesla light shows. From holidays to birthdays, car meets to personal celebrations.
        </p>
      </div>
      <InternalLinkGrid
        title="By Occasion"
        links={[
          { label: 'Halloween Light Shows', href: '/tesla-halloween-light-show', desc: 'Spooky themed shows for October.' },
          { label: 'Christmas Light Shows', href: '/tesla-christmas-light-show', desc: 'Festive holiday celebrations.' },
          { label: 'Birthday Light Shows', href: '/tesla-birthday-light-show', desc: 'Personalized birthday surprises.' },
          { label: 'New Year Light Shows', href: '/tesla-new-year-light-show', desc: 'Countdown and party shows.' },
          { label: 'Custom Song Shows', href: '/custom-tesla-light-show', desc: 'Any song you own.' },
          { label: 'All Models', href: '/tesla-light-show-models', desc: 'Shows by vehicle model.' },
        ]}
      />
      <section className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">More Ideas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {['Wedding proposal', 'Gender reveal', 'Graduation', 'Car meet entrance', 'Business promo', 'Patriotic event', 'Anniversary surprise', 'Festival pre-party', 'Road trip farewell', 'Welcome home', 'Neighborhood show', 'Charity event'].map(idea => (
            <div key={idea} className="bg-charcoal border border-border rounded-lg p-3 text-center">
              <p className="text-text-primary text-xs font-medium">{idea}</p>
            </div>
          ))}
        </div>
      </section>
      <CTASection
        headline="Turn Your Idea into a Show"
        text="Upload your MP3 or WAV and generate a custom Tesla light show in minutes."
        buttonText="Generate My Light Show"
        href="/tesla-light-show-generator#upload"
      />
      <IndependentNotice />
    </main>
  );
}
