interface ContactPageProps {
  onNavigate: (to: string) => void;
}

export default function ContactPage({ onNavigate }: ContactPageProps) {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-display font-bold text-text-primary">Contact TeslaLightShows.com</h1>

      <div className="space-y-4 text-text-secondary text-sm leading-relaxed">
        <p>Need help with an order, download, upload, generated light show file, or general question? Contact us and we will review your request.</p>
        <div className="space-y-1">
          <p>Support Email: support@teslalightshows.com</p>
          <p>Business Name: TeslaLightShows.com</p>
          <p>Business Type: Sole Proprietorship</p>
          <p>Business Location: California, United States</p>
          <p>Website: https://teslalightshows.com</p>
        </div>
        <p>TeslaLightShows.com is operated by a California-based sole proprietor.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">Support Requests</h2>
        <div className="text-text-secondary text-sm leading-relaxed space-y-3">
          <p>For faster support, please include your order number, the email used at checkout, a short description of the issue, and any relevant screenshots or error messages.</p>
          <p>We can help with:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Order questions</li>
            <li>Download issues</li>
            <li>Upload problems</li>
            <li>Missing files</li>
            <li>Technical issues</li>
            <li>Refund requests</li>
            <li>General questions</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">Independent Service Notice</h2>
        <p className="text-text-secondary text-sm leading-relaxed">TeslaLightShows.com is an independent digital service and is not affiliated with, endorsed by, sponsored by, or approved by Tesla, Inc.</p>
      </section>

      <button onClick={() => onNavigate('/')} className="text-electric-cyan hover:text-electric-cyan/80 text-sm font-medium transition-colors">
        &larr; Back to generator
      </button>
    </main>
  );
}
