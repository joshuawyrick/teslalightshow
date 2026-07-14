interface AboutPageProps {
  onNavigate: (to: string) => void;
}

export default function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-display font-bold text-text-primary">About EVLightShows.com</h1>

      <div className="space-y-4 text-text-secondary text-sm leading-relaxed">
        <p>EVLightShows.com is an independent digital service that creates custom light show files for Tesla vehicle owners who want a personalized music-based light show experience.</p>
        <p>Our service allows customers to upload an MP3 or WAV audio file. Our system then generates custom light show file options intended for compatible Tesla vehicles that support the built-in Light Show feature. Customers can download the generated files and place them on a properly formatted USB drive for use with their vehicle.</p>
        <p>EVLightShows.com is not Tesla, Inc. We are not affiliated with Tesla, sponsored by Tesla, endorsed by Tesla, or approved by Tesla. We are an independent service created for Tesla owners and enthusiasts who want custom light show files for personal entertainment use.</p>
        <p>References to Tesla, Model 3, Model Y, Cybertruck, Model S, Model X, or other Tesla-related names are used only to identify compatibility with Tesla vehicles and Tesla's Light Show feature.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">What We Provide</h2>
        <p className="text-text-secondary text-sm leading-relaxed">EVLightShows.com provides digital light show files generated from customer-uploaded music. Depending on the service selected, customers may receive one or more downloadable file options intended for compatible Tesla Light Show use.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">What We Do Not Provide</h2>
        <p className="text-text-secondary text-sm leading-relaxed">EVLightShows.com does not sell Tesla vehicles, Tesla parts, Tesla accessories, Tesla software, or Tesla repair services. We do not modify Tesla vehicles. We do not access your Tesla account. We do not guarantee that any light show will work on every vehicle, every software version, or every USB drive setup.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">Customer Responsibility</h2>
        <p className="text-text-secondary text-sm leading-relaxed">Customers are responsible for making sure they have the legal right to upload and use any audio file submitted to EVLightShows.com. Customers are also responsible for following USB formatting, folder structure, vehicle compatibility, and safe operation instructions for the Light Show feature.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">Business Information</h2>
        <div className="text-text-secondary text-sm leading-relaxed space-y-1">
          <p>EVLightShows.com is operated by a California-based sole proprietor.</p>
          <p>Business Name: EVLightShows.com</p>
          <p>Business Type: Sole Proprietorship</p>
          <p>Location: California, United States</p>
          <p>Support Email: support@evlightshows.com</p>
          <p>Website: https://evlightshows.com</p>
        </div>
      </section>

      <button onClick={() => onNavigate('/')} className="text-electric-cyan hover:text-electric-cyan/80 text-sm font-medium transition-colors">
        &larr; Back to generator
      </button>
    </main>
  );
}
