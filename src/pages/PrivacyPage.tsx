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
            handled entirely by Stripe -- we do not store your credit card information. We also store records of your
            generated light show files.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">2. Audio Processing</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Music files you upload are processed entirely within your web browser using client-side audio analysis.
            Your audio files are never uploaded to or stored on our servers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">3. How We Use Your Information</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            We use your email to authenticate your account, deliver purchase confirmations, and communicate important
            service updates. We use purchase and download records to manage your credit balance and provide access to
            your generated files.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">4. Data Storage and Security</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Your account data and generated files are stored securely using Supabase infrastructure with row-level
            security policies ensuring that only you can access your data. All communications are encrypted via HTTPS.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">5. Third-Party Services</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            We use the following third-party services: Supabase (authentication and data storage), Stripe (payment
            processing). Each service has its own privacy policy governing how they handle your data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">6. Data Deletion</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            You may request deletion of your account and all associated data by contacting us through the Support page.
            We will process deletion requests within 30 days.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">7. Cookies</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            We use essential cookies for authentication session management only. We do not use tracking cookies or
            third-party analytics cookies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-text-primary text-lg font-semibold">8. Contact</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            For privacy-related inquiries, please reach out via the Support page.
          </p>
        </section>
      </div>
    </main>
  );
}
