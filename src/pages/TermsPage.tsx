import { ArrowLeft } from 'lucide-react';

export default function TermsPage({ onNavigate }: { onNavigate: (to: string) => void }) {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <button onClick={() => onNavigate('/')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm transition-colors">
        <ArrowLeft size={16} />
        Back to Generator
      </button>

      <div className="space-y-6">
        <h1 className="text-text-primary text-2xl sm:text-3xl font-bold font-display">Terms of Service</h1>
        <p className="text-text-secondary text-xs">Last updated: July 7, 2026</p>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">1. Acceptance of Terms</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            By accessing or using TeslaLightShows.com ("the Service"), you agree to be bound by these Terms of Service.
            If you do not agree to these terms, do not use the Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">2. Description of Service</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            TeslaLightShows.com provides an AI-powered tool that generates Tesla Light Show files (FSEQ format) synchronized
            to music uploaded by users. The generated files are intended to be played on compatible Tesla vehicles using
            Tesla's built-in Light Show feature.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">3. Credits and Payments</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            The Service operates on a credit-based system. Credits are purchased through Stripe and are non-refundable
            once used to generate a light show download. Unused credits do not expire. Each credit entitles you to one
            full-length light show download.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">4. User Content</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            You are responsible for ensuring you have the right to upload any music files to the Service. Audio files are
            processed locally in your browser and are not stored on our servers. Generated FSEQ files are stored securely
            and are accessible only to your account.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">5. Disclaimer</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            TeslaLightShows.com is not affiliated with, endorsed by, or connected to Tesla, Inc. Tesla and all related
            marks are trademarks of Tesla, Inc. Use of generated light show files is at your own risk. We are not
            responsible for any damage to your vehicle or any issues arising from the use of generated files.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">6. Limitation of Liability</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            The Service is provided "as is" without warranty of any kind. In no event shall TeslaLightShows.com be liable
            for any indirect, incidental, special, or consequential damages arising from the use of the Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">7. Changes to Terms</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes
            acceptance of the modified Terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">8. Contact</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            For questions about these Terms, please reach out via the Support page.
          </p>
        </section>
      </div>
    </main>
  );
}
