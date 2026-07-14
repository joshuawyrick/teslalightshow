interface DisclaimerPageProps {
  onNavigate: (to: string) => void;
}

export default function DisclaimerPage({ onNavigate }: DisclaimerPageProps) {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-display font-bold text-text-primary">Independent Service Disclaimer</h1>

      <div className="space-y-4 text-text-secondary text-sm leading-relaxed">
        <p>EVLightShows.com is an independent digital service. EVLightShows.com is not affiliated with, endorsed by, sponsored by, partnered with, or approved by Tesla, Inc.</p>
        <p>Tesla, Model 3, Model Y, Cybertruck, Model S, Model X, and related vehicle names are trademarks of Tesla, Inc. References to Tesla and Tesla vehicle names on this website are used only to describe compatibility and intended file use.</p>
        <p>EVLightShows.com creates custom digital light show files intended for compatible Tesla vehicles that support the Light Show feature. The use of Tesla-related names on this website is for identification and compatibility purposes only.</p>
        <p>EVLightShows.com does not sell Tesla vehicles, Tesla products, Tesla parts, Tesla accessories, Tesla software, Tesla repair, Tesla service, or Tesla support. EVLightShows.com does not represent Tesla, Inc. in any way.</p>
        <p>Do not provide Tesla account login information, Tesla app credentials, or other sensitive vehicle account information through this website. EVLightShows.com does not need access to your Tesla account to provide custom light show files.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">Compatibility Language</h2>
        <p className="text-text-secondary text-sm leading-relaxed">Any compatibility references on this website are intended only to help customers understand whether the generated digital files may be suitable for vehicles that support the Light Show feature. Compatibility can vary based on vehicle model, software version, USB drive formatting, folder placement, file naming, audio quality, and customer setup.</p>
      </section>

      <button onClick={() => onNavigate('/')} className="text-electric-cyan hover:text-electric-cyan/80 text-sm font-medium transition-colors">
        &larr; Back to generator
      </button>
    </main>
  );
}
