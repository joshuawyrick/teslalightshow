import SeoHead from '../components/SeoHead';
export default function NotFoundPage() {
  return (
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center space-y-6">
      <SeoHead
        title="Page Not Found | EVLightShows.com"
        description="The page you are looking for does not exist."
        canonical="https://evlightshows.com/404"
        noindex
      />
      <h1 className="text-4xl sm:text-5xl font-display font-bold text-text-primary">404</h1>
      <p className="text-text-secondary text-base sm:text-lg max-w-md mx-auto">
        This page does not exist. It may have been moved or the link may be incorrect.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <a href="/" className="inline-flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white text-sm font-semibold rounded-xl px-6 py-3 transition-all">
          Go to Homepage
        </a>
        <a href="/tesla-light-show-generator#upload" className="text-electric-cyan hover:underline text-sm font-medium">
          Try the Light Show Generator
        </a>
      </div>
    </main>
  );
}
