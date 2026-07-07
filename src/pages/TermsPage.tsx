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
            If you do not agree to these terms, do not use the Service. You must be at least 18 years of age, or have
            parental or guardian consent, to use the Service.
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
          <h2 className="text-text-primary text-lg font-semibold">3. License and Ownership</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Generated light show files are licensed, not sold. Each purchase grants you a personal, non-exclusive,
            non-transferable license to use the generated .fseq file on your own Tesla vehicle(s) for personal,
            non-commercial purposes. You may not resell, redistribute, sublicense, or publicly distribute any
            generated files. You may not reverse engineer, decompile, or create derivative works from the generated
            files without prior written permission.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">4. Credits and Payments</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            The Service operates on a credit-based system. Credits are purchased through Stripe and are non-refundable
            once used to generate a light show download. Unused credits do not expire and have no cash value. Each credit
            entitles you to one full-length light show download. Credits cannot be transferred between accounts. If you
            purchased credits by mistake and have not used them, you may contact us within 48 hours for a refund.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">5. User Content and Responsibilities</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            You are responsible for ensuring you have the legal right to upload any music files to the Service, including
            all necessary licenses or permissions from copyright holders. Audio files are processed locally in your browser
            and are never uploaded to or stored on our servers. You are solely responsible for how you use generated light
            show files, including compliance with any applicable music licensing requirements if you record or share videos
            of your light show.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">6. Prohibited Conduct</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            You agree not to: (a) use bots, scrapers, or automated tools to access the Service; (b) attempt to circumvent
            the credit or payment system; (c) attempt unauthorized access to accounts, servers, or systems; (d) reverse
            engineer or decompile the Service; (e) use the Service for any illegal purpose; (f) interfere with or disrupt
            the Service or its infrastructure. Violation of these terms may result in immediate account suspension without
            prior notice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">7. Tesla Non-Affiliation Disclaimer</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            TeslaLightShows.com is not affiliated with, endorsed by, sponsored by, or connected to Tesla, Inc. in any way.
            "Tesla" and all related marks, logos, and vehicle names are registered trademarks of Tesla, Inc. Their use here
            is purely descriptive to indicate compatibility. Generated light show files are created independently and are
            not authorized or certified by Tesla, Inc.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">8. Limitation of Liability</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            The Service is provided "as is" and "as available" without warranty of any kind, express or implied. We do not
            warrant that the Service will be uninterrupted, error-free, or that generated files will be compatible with all
            Tesla vehicles or software versions. Use of generated light show files on your vehicle is entirely at your own
            risk. In no event shall TeslaLightShows.com be liable for any damage to your vehicle, personal injury, file
            incompatibility, data loss, or any indirect, incidental, special, or consequential damages arising from the use
            of the Service. Our total liability to you shall not exceed the total amount you have paid to TeslaLightShows.com
            in the preceding 12 months.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">9. Indemnification</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            You agree to indemnify, defend, and hold harmless TeslaLightShows.com and its operator from any claims, damages,
            losses, or expenses (including reasonable legal fees) arising from your use of the Service, your violation of
            these Terms, or your violation of any third-party rights including copyright or intellectual property rights.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">10. Account Termination</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            You may delete your account at any time by contacting support. We reserve the right to suspend or terminate
            accounts that violate these Terms without prior notice. Upon termination, your access to downloaded files and
            unused credits will be revoked. Account termination does not entitle you to a refund of unused credits.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">11. Governing Law</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of the United States. Any disputes
            arising from these Terms or your use of the Service shall be resolved in the courts of the United States.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">12. Changes to Terms</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            We reserve the right to modify these Terms at any time. Material changes will be communicated via email or a
            notice on the Service. Continued use of the Service after changes are posted constitutes acceptance of the
            modified Terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">13. Contact</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            For questions about these Terms, please contact us at{' '}
            <a href="mailto:josh@teslalightshows.com" className="text-electric-cyan hover:underline">josh@teslalightshows.com</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
