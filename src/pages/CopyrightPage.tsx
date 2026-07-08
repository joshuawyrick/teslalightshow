interface CopyrightPageProps {
  onNavigate: (to: string) => void;
}

export default function CopyrightPage({ onNavigate }: CopyrightPageProps) {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-display font-bold text-text-primary">Copyright &amp; Music Upload Policy</h1>

      <div className="space-y-4 text-text-secondary text-sm leading-relaxed">
        <p>By uploading an MP3, WAV, or other audio file to TeslaLightShows.com, you confirm that you own the file or have permission to use it for this purpose.</p>
        <p>You may not upload copyrighted music or audio files unless you have the right, license, or permission to use that file. You are solely responsible for the content you upload and for any rights, permissions, or licenses required.</p>
        <p>TeslaLightShows.com does not claim ownership of your uploaded music. We use uploaded files only to generate the requested custom light show files and provide the service you ordered.</p>
        <p>We reserve the right to reject, remove, or decline uploaded content that appears unlawful, abusive, infringing, harmful, or otherwise inappropriate.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">Customer Responsibility</h2>
        <p className="text-text-secondary text-sm leading-relaxed">Customers are responsible for making sure they have the right to upload and use any audio submitted to TeslaLightShows.com. Uploading a file does not transfer ownership of that audio to TeslaLightShows.com.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-text-primary">Uploaded Audio Use</h2>
        <p className="text-text-secondary text-sm leading-relaxed">Uploaded audio is used to generate custom light show files requested by the customer. Uploaded files may also be used to troubleshoot order issues, support requests, failed downloads, or file generation problems.</p>
      </section>

      <button onClick={() => onNavigate('/')} className="text-electric-cyan hover:text-electric-cyan/80 text-sm font-medium transition-colors">
        &larr; Back to generator
      </button>
    </main>
  );
}
