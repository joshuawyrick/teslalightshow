import { ArrowLeft, Mail, MessageCircle } from 'lucide-react';

export default function SupportPage({ onNavigate }: { onNavigate: (to: string) => void }) {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <button onClick={() => onNavigate('/')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm transition-colors">
        <ArrowLeft size={16} />
        Back to Generator
      </button>

      <div className="space-y-6">
        <h1 className="text-text-primary text-2xl sm:text-3xl font-bold font-display">Support</h1>
        <p className="text-text-secondary text-sm leading-relaxed">
          Need help with TeslaLightShows.com? We are here to assist you.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-charcoal border border-border rounded-xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center">
              <Mail size={18} className="text-electric-cyan" />
            </div>
            <h3 className="text-text-primary font-semibold">Email Support</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              For account issues, payment questions, or technical problems, email us and we will respond within 24 hours.
            </p>
            <a
              href="mailto:support@teslalightshows.com"
              className="inline-block text-electric-cyan text-sm font-medium hover:underline"
            >
              support@teslalightshows.com
            </a>
          </div>

          <div className="bg-charcoal border border-border rounded-xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center">
              <MessageCircle size={18} className="text-electric-cyan" />
            </div>
            <h3 className="text-text-primary font-semibold">FAQ</h3>
            <div className="space-y-2">
              <div>
                <p className="text-text-primary text-sm font-medium">How do I use my light show?</p>
                <p className="text-text-secondary text-xs leading-relaxed">
                  Download the .fseq file, place it on a USB drive with the matching audio file named "lightshow.mp3",
                  and insert the USB into your Tesla. Navigate to Toybox &gt; Light Show.
                </p>
              </div>
              <div>
                <p className="text-text-primary text-sm font-medium">Can I get a refund?</p>
                <p className="text-text-secondary text-xs leading-relaxed">
                  Credits are non-refundable once used to download a light show. If you purchased credits by mistake
                  and have not used them, contact us within 48 hours for a refund.
                </p>
              </div>
              <div>
                <p className="text-text-primary text-sm font-medium">Which Tesla models are supported?</p>
                <p className="text-text-secondary text-xs leading-relaxed">
                  We support Model 3, Model 3 Highland, Model Y, Model Y Juniper, Model S, Model X, and Cybertruck.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
