interface TermsPageProps {
  onNavigate: (to: string) => void;
}

export default function TermsPage({ onNavigate }: TermsPageProps) {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-display font-bold text-text-primary">Terms of Service</h1>

      <p className="text-text-secondary text-sm leading-relaxed">Effective Date: July 8, 2026</p>
      <p className="text-text-secondary text-sm leading-relaxed">These Terms of Service govern your use of TeslaLightShows.com. By using this website, uploading a file, placing an order, or downloading generated files, you agree to these Terms.</p>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">1. Business Information</h2>
        <div className="text-text-secondary text-sm leading-relaxed space-y-1">
          <p>TeslaLightShows.com is operated by a California-based sole proprietor.</p>
          <p>Business Name: TeslaLightShows.com</p>
          <p>Business Type: Sole Proprietorship</p>
          <p>Location: California, United States</p>
          <p>Support Email: support@teslalightshows.com</p>
          <p>Website: https://teslalightshows.com</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">2. Independent Service Disclaimer</h2>
        <div className="text-text-secondary text-sm leading-relaxed space-y-3">
          <p>TeslaLightShows.com is an independent digital service. TeslaLightShows.com is not affiliated with, endorsed by, sponsored by, partnered with, or approved by Tesla, Inc.</p>
          <p>Tesla, Model 3, Model Y, Cybertruck, Model S, Model X, and related names are trademarks of Tesla, Inc. References to Tesla and Tesla vehicle models are used only to identify compatibility and intended use with Tesla vehicles and the Light Show feature.</p>
          <p>TeslaLightShows.com does not sell Tesla vehicles, Tesla products, Tesla parts, Tesla accessories, Tesla software, Tesla repair, or Tesla support services.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">3. Description of Service</h2>
        <div className="text-text-secondary text-sm leading-relaxed space-y-3">
          <p>TeslaLightShows.com allows customers to upload audio files, such as MP3 or WAV files, and receive custom-generated digital light show files intended for compatible Tesla vehicles.</p>
          <p>Generated files may include light show file formats, folder structures, or other downloadable digital materials intended for use with the Light Show feature.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">4. No Guarantee of Compatibility</h2>
        <div className="text-text-secondary text-sm leading-relaxed space-y-3">
          <p>We make reasonable efforts to generate files intended for compatible Light Show use, but we do not guarantee compatibility with every vehicle, software version, USB drive, audio file, or user setup.</p>
          <p>Compatibility may depend on factors outside our control, including vehicle software updates, vehicle model differences, USB formatting, folder placement, file naming, audio quality, and customer setup.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">5. Customer Responsibilities</h2>
        <div className="text-text-secondary text-sm leading-relaxed">
          <p>You are responsible for:</p>
          <ul className="list-disc list-inside space-y-1 pl-2 mt-2">
            <li>Providing accurate order information</li>
            <li>Uploading a usable audio file</li>
            <li>Making sure you have the right to upload and use the audio file</li>
            <li>Downloading and saving your files</li>
            <li>Using a compatible USB drive</li>
            <li>Following Light Show setup instructions</li>
            <li>Testing files safely</li>
            <li>Using light shows only in safe and lawful locations</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">6. Music and Uploaded Content</h2>
        <div className="text-text-secondary text-sm leading-relaxed space-y-3">
          <p>By uploading any audio file or other content, you confirm that you own the content or have the legal right, license, or permission to use it.</p>
          <p>You may not upload content that infringes copyright, trademark, privacy rights, publicity rights, or any other rights of another person or company.</p>
          <p>You keep ownership of your uploaded content. By uploading content, you give TeslaLightShows.com permission to use that content only as needed to provide the requested service, generate light show files, process your order, provide support, and improve site functionality.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">7. Prohibited Uses</h2>
        <div className="text-text-secondary text-sm leading-relaxed space-y-3">
          <p>You may not use TeslaLightShows.com to upload, create, request, or distribute content that is unlawful, infringing, abusive, harmful, deceptive, obscene, or otherwise inappropriate.</p>
          <p>You may not use TeslaLightShows.com to impersonate Tesla, Inc., misrepresent affiliation with Tesla, or create content that falsely suggests endorsement, sponsorship, or approval by Tesla.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">8. Digital Products and Delivery</h2>
        <div className="text-text-secondary text-sm leading-relaxed space-y-3">
          <p>TeslaLightShows.com provides digital products. Delivery may occur through download links, customer account access, email, or another digital delivery method.</p>
          <p>Delivery times may vary depending on file size, system demand, upload quality, processing availability, and technical issues.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">9. Refunds</h2>
        <div className="text-text-secondary text-sm leading-relaxed space-y-3">
          <p>Because our products are custom digital files generated from customer-uploaded audio, completed digital orders are generally not refundable after files have been generated or delivered.</p>
          <p>If there is a technical issue with your order, contact support@teslalightshows.com. We may offer a corrected file, replacement generation, store credit, or refund at our discretion.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">10. No Tesla Account Access</h2>
        <p className="text-text-secondary text-sm leading-relaxed">TeslaLightShows.com does not require access to your Tesla account. Do not provide your Tesla login information, Tesla app credentials, or other sensitive account information through this website.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">11. Safety</h2>
        <div className="text-text-secondary text-sm leading-relaxed space-y-3">
          <p>Light shows should only be used while the vehicle is parked in a safe and appropriate location. You are responsible for complying with all laws, rules, property restrictions, and safety requirements.</p>
          <p>TeslaLightShows.com is not responsible for tickets, violations, property complaints, vehicle issues, accidents, injuries, disturbances, or damages caused by your use of generated files.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">12. Intellectual Property</h2>
        <div className="text-text-secondary text-sm leading-relaxed space-y-3">
          <p>The TeslaLightShows.com website, branding, generated non-customer materials, page content, graphics, and service structure are owned by TeslaLightShows.com or its operator, except for third-party trademarks and customer-uploaded content.</p>
          <p>You may use purchased generated files for personal use with your own compatible vehicle. You may not resell, redistribute, copy, or commercially exploit generated files unless we give written permission.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">13. Third-Party Names and Trademarks</h2>
        <p className="text-text-secondary text-sm leading-relaxed">Third-party names, trademarks, and vehicle model names are used only for identification, compatibility, and descriptive purposes. Their use does not imply affiliation, sponsorship, endorsement, or approval.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">14. Disclaimers</h2>
        <div className="text-text-secondary text-sm leading-relaxed space-y-3">
          <p>TeslaLightShows.com is provided on an "as is" and "as available" basis. We do not guarantee uninterrupted service, error-free operation, perfect file compatibility, or specific results.</p>
          <p>We do not guarantee that generated files will meet every customer expectation or work on every vehicle setup.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">15. Limitation of Liability</h2>
        <p className="text-text-secondary text-sm leading-relaxed">To the fullest extent permitted by law, TeslaLightShows.com and its operator will not be liable for indirect, incidental, special, consequential, or punitive damages, including loss of data, loss of profits, vehicle issues, failed downloads, incompatible files, or customer setup errors.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">16. Changes to the Service</h2>
        <p className="text-text-secondary text-sm leading-relaxed">We may update, change, suspend, or discontinue any part of the website or service at any time.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">17. Changes to These Terms</h2>
        <p className="text-text-secondary text-sm leading-relaxed">We may update these Terms from time to time. The updated version will be posted on this page with a revised effective date.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">18. Contact</h2>
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
