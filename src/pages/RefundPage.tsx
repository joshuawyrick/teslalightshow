interface RefundPageProps {
  onNavigate: (to: string) => void;
}

export default function RefundPage({ onNavigate }: RefundPageProps) {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-display font-bold text-text-primary">Refund Policy</h1>

      <div className="space-y-4 text-text-secondary text-sm leading-relaxed">
        <p>Because TeslaLightShows.com provides custom digital files generated from customer-uploaded audio, completed digital orders are generally not refundable once files have been generated or delivered.</p>
        <p>However, we want customers to have a good experience. If your generated files do not download properly, are missing, or there is a technical issue with your order, contact us at support@teslalightshows.com and we will review the issue.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">Possible Resolutions</h2>
        <div className="text-text-secondary text-sm leading-relaxed space-y-3">
          <p>Depending on the issue, we may offer one or more of the following at our discretion:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>A replacement file generation</li>
            <li>A corrected download link</li>
            <li>Store credit</li>
            <li>A refund if the order could not be fulfilled</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">Non-Refundable Situations</h2>
        <p className="text-text-secondary text-sm leading-relaxed">Refunds are generally not available for issues outside our control, including incompatible USB drives, incorrect folder placement, unsupported vehicle software, poor-quality audio files, customer upload errors, customer device issues, or failure to follow Light Show setup instructions.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">How To Request Support</h2>
        <p className="text-text-secondary text-sm leading-relaxed">To request help with an order, email support@teslalightshows.com and include your order number, the email used at checkout, and a clear description of the issue.</p>
      </section>

      <button onClick={() => onNavigate('/')} className="text-electric-cyan hover:text-electric-cyan/80 text-sm font-medium transition-colors">
        &larr; Back to generator
      </button>
    </main>
  );
}
