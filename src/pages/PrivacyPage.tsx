import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage({ onNavigate }: { onNavigate: (to: string) => void }) {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <button onClick={() => onNavigate('/')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm transition-colors">
        <ArrowLeft size={16} />
        Back to Generator
      </button>

      <div className="space-y-6">
        <h1 className="text-text-primary text-2xl sm:text-3xl font-bold font-display">Privacy Policy</h1>
        <p className="text-text-secondary text-xs">Last updated: July 7, 2026</p>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">1. Information We Collect</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            When you create an account, we collect your email address. When you make a purchase, payment processing is
            handled entirely by Stripe -- we do not store your credit card number, CVV, or full billing details. We also
            store records of your generated light show files and transaction history to manage your credit balance.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">2. Information We Do NOT Collect</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            We do not collect or store your audio files. Music files you upload are processed entirely within your web
            browser using client-side audio analysis and are never transmitted to or stored on our servers. We do not
            collect location data, health information, or any sensitive personal data. We do not use tracking cookies,
            advertising pixels, or third-party analytics services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">3. How We Use Your Information</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            We use your email address to authenticate your account, deliver purchase confirmations, and communicate
            important service updates. We use purchase and download records to manage your credit balance and provide
            access to your generated files. We do not sell, rent, or share your personal information with third parties
            for marketing purposes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">4. Data Storage and Security</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Your account data and generated files are stored securely using Supabase infrastructure with row-level
            security policies ensuring that only you can access your data. All communications are encrypted via HTTPS.
            Passwords are hashed and never stored in plaintext. While we implement industry-standard security measures,
            no method of electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">5. Third-Party Services</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            We use the following third-party services: Supabase (authentication and data storage) and Stripe (payment
            processing). Each service has its own privacy policy governing how they handle your data. We encourage you
            to review the Stripe Privacy Policy and Supabase Privacy Policy for details on their data practices.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">6. Cookies</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            We use essential cookies for authentication session management only. These cookies are strictly necessary
            for the Service to function and cannot be disabled. We do not use tracking cookies, advertising cookies,
            or third-party analytics cookies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">7. Data Retention</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Account data is retained for the lifetime of your account plus one year after deletion to comply with legal
            obligations. Transaction records are retained for seven years for tax and legal compliance. Authentication
            session logs are retained for 90 days. Audio files are never retained as they are processed client-side only.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">8. Your Rights (GDPR and CCPA)</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Depending on your jurisdiction, you may have the following rights regarding your personal data:
          </p>
          <ul className="text-text-secondary text-sm leading-relaxed list-disc list-inside space-y-1">
            <li><span className="text-text-primary font-medium">Right to Access:</span> Request a copy of the personal data we hold about you.</li>
            <li><span className="text-text-primary font-medium">Right to Correction:</span> Request correction of inaccurate personal data.</li>
            <li><span className="text-text-primary font-medium">Right to Deletion:</span> Request deletion of your account and associated data.</li>
            <li><span className="text-text-primary font-medium">Right to Portability:</span> Request your data in a machine-readable format.</li>
            <li><span className="text-text-primary font-medium">Right to Opt-Out:</span> Opt out of non-essential communications at any time.</li>
          </ul>
          <p className="text-text-secondary text-sm leading-relaxed">
            To exercise any of these rights, contact us at josh@teslalightshows.com. We will respond to requests within
            30 days.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">9. Do Not Sell My Personal Information</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            We do not sell, rent, or trade your personal information to third parties. This applies to all users
            regardless of location, including California residents under the California Consumer Privacy Act (CCPA).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">10. Children's Privacy</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            The Service is not directed at children under the age of 13. We do not knowingly collect personal information
            from children under 13. If we become aware that we have collected personal data from a child under 13, we will
            take steps to delete that information promptly.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">11. Data Deletion</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            You may request deletion of your account and all associated personal data by contacting us at
            josh@teslalightshows.com. We will process deletion requests within 30 days. Note that certain transaction
            records may be retained as required by law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">12. International Users</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            The Service is available globally. Your data is stored on servers in the United States. If you are accessing
            the Service from outside the United States, please be aware that your information may be transferred to and
            processed in the United States. By using the Service, you consent to this transfer.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">13. Changes to This Policy</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            We may update this Privacy Policy from time to time. Material changes will be communicated via email or a
            notice on the Service. Continued use of the Service after changes are posted constitutes acceptance of the
            updated policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">14. Contact</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            For privacy-related inquiries, data access requests, or to exercise your rights, please contact us at{' '}
            <a href="mailto:josh@teslalightshows.com" className="text-electric-cyan hover:underline">josh@teslalightshows.com</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
