import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import PricingModal from './components/PricingModal';
import GeneratorPage from './pages/GeneratorPage';
import MyDownloadsPage from './pages/MyDownloadsPage';
import GalleryPage from './pages/GalleryPage';
import AdminPage from './pages/AdminPage';
import SuccessPage from './pages/SuccessPage';

// ---- Simple hash-based router ----
function getHashPath(): string {
  const hash = window.location.hash;
  if (!hash || hash === '#' || hash === '#/') return '/';
  const path = hash.slice(1).split('?')[0];
  return path || '/';
}

function getHashParam(key: string): string | null {
  const hash = window.location.hash;
  const qi = hash.indexOf('?');
  if (qi === -1) return null;
  return new URLSearchParams(hash.slice(qi + 1)).get(key);
}

// Also read top-level query params (for Stripe redirects: ?checkout=success&session_id=...)
function getQueryParam(key: string): string | null {
  return new URLSearchParams(window.location.search).get(key);
}

function AppInner() {
  const [path, setPath] = useState<string>(() => getHashPath());
  const [showAuth, setShowAuth] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    const onHash = () => setPath(getHashPath());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (to: string) => {
    window.location.hash = to;
    setPath(to);
  };

  // Detect Stripe checkout result from query params (Stripe appends to root URL)
  const checkoutStatus = getQueryParam('checkout');
  const stripeSessionId = getQueryParam('session_id');

  const renderPage = () => {
    if (checkoutStatus === 'success') {
      return <SuccessPage sessionId={stripeSessionId} onNavigate={navigate} />;
    }
    if (checkoutStatus === 'cancel') {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="bg-white/3 border border-white/10 rounded-2xl p-10 max-w-md w-full text-center space-y-4">
            <p className="text-white font-bold text-xl">Purchase cancelled</p>
            <p className="text-white/40 text-sm">No charge was made. You can buy credits any time from the generator.</p>
            <button onClick={() => { window.history.replaceState({}, '', window.location.pathname); navigate('/'); }} className="w-full bg-white/8 hover:bg-white/12 border border-white/10 text-white font-semibold rounded-xl py-3 transition-colors duration-150">
              Back to generator
            </button>
          </div>
        </div>
      );
    }

    switch (path) {
      case '/downloads': return <MyDownloadsPage />;
      case '/gallery':   return <GalleryPage />;
      case '/admin':     return <AdminPage />;
      default:           return <GeneratorPage onOpenAuth={() => setShowAuth(true)} onOpenPricing={() => setShowPricing(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white font-sans">
      <Header
        currentPath={path}
        onNavigate={navigate}
        onAuthClick={() => setShowAuth(true)}
      />

      {renderPage()}

      <footer className="border-t border-white/8 mt-16 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-tesla-500/20 border border-tesla-500/30 flex items-center justify-center">
              <Zap size={11} className="text-tesla-400" />
            </div>
            <span className="text-white/20 text-xs" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              TeslaLightShows.com
            </span>
          </div>
          <p className="text-white/20 text-xs text-center">
            Generates files in Tesla's official FSEQ v2.0 format. Not affiliated with Tesla, Inc.
          </p>
        </div>
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
