import { ArrowLeft, Mail, HelpCircle, Zap, CreditCard, Usb, Shield } from 'lucide-react';

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
          Need help with TeslaLightShows.com? Check the FAQ below or reach out directly.
        </p>

        <div className="bg-charcoal border border-border rounded-xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center">
            <Mail size={18} className="text-electric-cyan" />
          </div>
          <h3 className="text-text-primary font-semibold">Email Support</h3>
          <p className="text-text-secondary text-sm leading-relaxed">
            For account issues, payment questions, refund requests, or technical problems, email us and we will
            respond within 24-48 business hours.
          </p>
          <a
            href="mailto:support@teslalightshows.com"
            className="inline-block text-electric-cyan text-sm font-medium hover:underline"
          >
            support@teslalightshows.com
          </a>
        </div>

        <div className="space-y-4 pt-4">
          <h2 className="text-text-primary text-xl font-bold font-display flex items-center gap-2">
            <HelpCircle size={20} className="text-electric-cyan" />
            Frequently Asked Questions
          </h2>

          <div className="space-y-1">
            <h3 className="text-text-primary text-sm font-semibold flex items-center gap-2 pt-4 pb-1">
              <Zap size={14} className="text-electric-cyan" />
              Getting Started
            </h3>

            <FaqItem
              q="What audio formats are supported?"
              a="We support MP3, WAV, FLAC, AAC, and OGG files. For best results, use high-quality MP3 or WAV files. There is no strict file size limit, but very large files (over 200MB) may cause slow processing depending on your device's memory."
            />
            <FaqItem
              q="Is my audio uploaded to your servers?"
              a="No. Your audio is processed entirely in your web browser using client-side audio analysis. Your music files never leave your device and are never transmitted to or stored on our servers."
            />
            <FaqItem
              q="Which Tesla models are supported?"
              a="We support Model 3, Model 3 Highland, Model Y, Model Y Juniper, Model S, Model X, and Cybertruck. Select your model in the generator to ensure the light show is optimized for your vehicle's specific light configuration."
            />
            <FaqItem
              q="Does this work on mobile?"
              a="Technically yes, but it is not recommended. The various file types (.fseq, .mp3) are difficult to work with on mobile devices -- you would need to save the files, email them to yourself, then open them on a desktop computer to transfer to a USB drive. Desktop is the ideal way to use TeslaLightShows.com and mobile will not be actively supported."
            />
          </div>

          <div className="space-y-1">
            <h3 className="text-text-primary text-sm font-semibold flex items-center gap-2 pt-4 pb-1">
              <CreditCard size={14} className="text-electric-cyan" />
              Purchasing and Credits
            </h3>

            <FaqItem
              q="How do I buy credits?"
              a="Click 'Purchase Credit' on any generated light show card. You will be taken to a secure Stripe checkout page. Once payment is complete, credits are instantly added to your account."
            />
            <FaqItem
              q="Do credits expire?"
              a="No. Credits remain in your account indefinitely until you use them."
            />
            <FaqItem
              q="Can I get a refund?"
              a="Completed digital orders are generally not refundable once files have been generated or delivered. If you purchased credits by mistake and have not used them, contact us at support@teslalightshows.com and we will review the issue."
            />
            <FaqItem
              q="I was charged but did not receive credits."
              a="This is rare but can happen if the payment confirmation was interrupted. Contact us at support@teslalightshows.com with your email and approximate purchase time, and we will resolve it within 24 hours."
            />
            <FaqItem
              q="What payment methods do you accept?"
              a="We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover) through Stripe. Apple Pay and Google Pay are also available where supported."
            />
          </div>

          <div className="space-y-1">
            <h3 className="text-text-primary text-sm font-semibold flex items-center gap-2 pt-4 pb-1">
              <Usb size={14} className="text-electric-cyan" />
              Using Your Light Show
            </h3>

            <FaqItem
              q="How do I set up my USB drive?"
              a="1. Insert a USB drive into your computer. 2. Format the USB drive as FAT32 or exFAT (not NTFS). 3. After formatting, create a folder at the root of the USB drive called exactly 'LightShow'. 4. All your light show files (.fseq and .mp3) will go inside this LightShow folder."
            />
            <FaqItem
              q="How do I load the light show onto my Tesla?"
              a="After setting up your USB (formatted + LightShow folder created): 1. Download your .fseq file and have your matching .mp3 audio file ready. 2. Drag both the .fseq file and the .mp3 file into the 'LightShow' folder on your USB drive. 3. Both files must have the exact same name -- for example, 'iceicebaby.fseq' and 'iceicebaby.mp3'. 4. Eject the USB from your computer and insert it into your Tesla. 5. Navigate to Toybox > Light Show and select the custom show."
            />
            <FaqItem
              q="What should I name my files?"
              a="Both the .fseq file and the .mp3 file must have exactly the same name (just different extensions). You can name them anything you want -- for example, if the song is 'Ice Ice Baby', you could name them 'iceicebaby.fseq' and 'iceicebaby.mp3'. Just make sure the names match exactly (no spaces recommended)."
            />
            <FaqItem
              q="My light show won't play on my Tesla."
              a="Common fixes: (1) Make sure your USB drive is formatted as FAT32 or exFAT (not NTFS). (2) Ensure there is a folder named exactly 'LightShow' at the root of the drive. (3) Verify both the .fseq and .mp3 files are inside the LightShow folder and have the exact same filename. (4) Check that your Tesla software is up to date -- Light Show requires version 2021.44.25 or later."
            />
            <FaqItem
              q="Can I have multiple light shows on one USB?"
              a="Yes! You can place multiple pairs of files inside the LightShow folder. Each pair must share the same filename (e.g., 'songone.fseq' + 'songone.mp3', 'songtwo.fseq' + 'songtwo.mp3'). Your Tesla will let you choose which show to play."
            />
            <FaqItem
              q="Can I use these for YouTube or commercial purposes?"
              a="The generated .fseq files are licensed for personal use only. If you record a video of your light show, you are responsible for ensuring you have the rights to the underlying music (separate from our service). We do not grant commercial redistribution rights for the light show files themselves."
            />
          </div>

          <div className="space-y-1">
            <h3 className="text-text-primary text-sm font-semibold flex items-center gap-2 pt-4 pb-1">
              <Shield size={14} className="text-electric-cyan" />
              Account and Privacy
            </h3>

            <FaqItem
              q="How do I reset my password?"
              a="Click 'Sign In', then 'Forgot password?' to receive a password reset email. Check your spam folder if you don't see it within a few minutes."
            />
            <FaqItem
              q="How do I delete my account?"
              a="Email support@teslalightshows.com with your account email and request deletion. We will process your request and remove all associated data within 30 days."
            />
            <FaqItem
              q="Is this affiliated with Tesla?"
              a="No. TeslaLightShows.com is an independent digital service and is not affiliated with, endorsed by, sponsored by, or approved by Tesla, Inc. References to Tesla and Tesla vehicle names are used only to describe compatibility and intended file use."
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group bg-steel/50 border border-border rounded-lg overflow-hidden">
      <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer select-none hover:bg-steel transition-colors">
        <span className="text-text-primary text-sm font-medium">{q}</span>
        <span className="text-text-secondary text-xs shrink-0 group-open:rotate-180 transition-transform duration-200">&#9660;</span>
      </summary>
      <div className="px-4 pb-3">
        <p className="text-text-secondary text-sm leading-relaxed">{a}</p>
      </div>
    </details>
  );
}
