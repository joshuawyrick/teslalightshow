interface PrivacyPageProps {
  onNavigate: (to: string) => void;
}

export default function PrivacyPage({ onNavigate }: PrivacyPageProps) {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-display font-bold text-text-primary">Privacy Policy</h1>

      <p className="text-text-secondary text-sm leading-relaxed">Effective Date: July 8, 2026</p>
      <p className="text-text-secondary text-sm leading-relaxed">TeslaLightShows.com respects your privacy. This Privacy Policy explains what information we collect, how we use it, and how you can contact us.</p>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">1. Information We Collect</h2>
        <div className="text-text-secondary text-sm leading-relaxed space-y-3">
          <p>We may collect information you provide directly, including:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Name</li>
            <li>Email address</li>
            <li>Order information</li>
            <li>Uploaded audio files</li>
            <li>Support messages</li>
            <li>Payment-related order details</li>
            <li>Technical information related to your use of the website</li>
          </ul>
          <p>We may also collect basic technical information automatically, such as browser type, device information, IP address, pages visited, and website usage data.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">2. Uploaded Audio Files</h2>
        <div className="text-text-secondary text-sm leading-relaxed space-y-3">
          <p>When you upload an MP3, WAV, or other audio file, we use that file to generate your custom light show files and provide the service you requested.</p>
          <p>We do not claim ownership of your uploaded audio file.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">3. Payments</h2>
        <p className="text-text-secondary text-sm leading-relaxed">Payments may be processed by third-party payment processors. TeslaLightShows.com does not store full credit card numbers. Payment processors may collect and process payment information according to their own terms and privacy policies.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">4. How We Use Information</h2>
        <div className="text-text-secondary text-sm leading-relaxed">
          <p>We use information to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2 mt-2">
            <li>Process orders</li>
            <li>Generate light show files</li>
            <li>Deliver downloads</li>
            <li>Provide customer support</li>
            <li>Respond to questions</li>
            <li>Improve the website and service</li>
            <li>Prevent fraud or abuse</li>
            <li>Comply with legal obligations</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">5. Sharing Information</h2>
        <div className="text-text-secondary text-sm leading-relaxed space-y-3">
          <p>We do not sell your personal information.</p>
          <p>We may share information with service providers who help operate the website, process payments, generate files, deliver downloads, provide hosting, send emails, or support customers.</p>
          <p>We may also disclose information if required by law, legal process, security concerns, or to protect our rights, users, or service.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">6. Data Retention</h2>
        <div className="text-text-secondary text-sm leading-relaxed space-y-3">
          <p>We keep information only as long as reasonably necessary for order fulfillment, customer support, legal compliance, fraud prevention, and business records.</p>
          <p>Uploaded files and generated files may be deleted after a reasonable period, depending on storage needs and service requirements.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">7. Customer Rights</h2>
        <p className="text-text-secondary text-sm leading-relaxed">Depending on your location, you may have rights to access, correct, delete, or request information about certain personal data. To make a request, contact support@teslalightshows.com.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">8. Children</h2>
        <p className="text-text-secondary text-sm leading-relaxed">TeslaLightShows.com is not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">9. Security</h2>
        <p className="text-text-secondary text-sm leading-relaxed">We use reasonable measures to protect information, but no website or online service can guarantee complete security.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">10. Third-Party Links</h2>
        <p className="text-text-secondary text-sm leading-relaxed">Our website may contain links to third-party websites or services. We are not responsible for the privacy practices, terms, or content of third-party websites.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">11. Updates</h2>
        <p className="text-text-secondary text-sm leading-relaxed">We may update this Privacy Policy from time to time. Updates will be posted on this page with a revised effective date.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">12. Contact</h2>
        <div className="text-text-secondary text-sm leading-relaxed space-y-1">
          <p>TeslaLightShows.com</p>
          <p>Operated by a California-based sole proprietor</p>
          <p>California, United States</p>
          <p>support@teslalightshows.com</p>
        </div>
      </section>

      <button onClick={() => onNavigate('/')} className="text-electric-cyan hover:text-electric-cyan/80 text-sm font-medium transition-colors">
        &larr; Back to generator
      </button>
    </main>
  );
}
