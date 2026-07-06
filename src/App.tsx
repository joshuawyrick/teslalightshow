import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import PricingModal from './components/PricingModal';
import ResetPasswordModal from './components/ResetPasswordModal';
import GeneratorPage from './pages/GeneratorPage';
import MyDownloadsPage from './pages/MyDownloadsPage';
import GalleryPage from './pages/GalleryPage';
import AdminPage from './pages/AdminPage';
import SuccessPage from './pages/SuccessPage';
import { supabase } from './lib/supabase';

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
  const [showResetPassword, setShowResetPassword] = useState(false);

  useEffect(() => {
    const onHash = () => setPath(getHashPath());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Listen for PASSWORD_RECOVERY event from Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowResetPassword(true);
      }
    });
    return () => subscription.unsubscribe();
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
          <div className="bg-charcoal border border-border rounded-2xl p-10 max-w-md w-full text-center space-y-4">
            <p className="text-text-primary font-bold text-xl font-heading">Purchase cancelled</p>
            <p className="text-text-secondary text-sm">No charge was made. You can buy credits any time from the generator.</p>
            <button onClick={() => { window.history.replaceState({}, '', window.location.pathname); navigate('/'); }} className="w-full bg-steel hover:bg-slate border border-border text-text-primary font-semibold rounded-xl py-3 transition-all duration-150">
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
    <div className="min-h-screen bg-midnight text-text-primary font-body relative">
      <div className="app-bg-glow" />
      <div className="relative z-10">
        <Header
          currentPath={path}
          onNavigate={navigate}
          onAuthClick={() => setShowAuth(true)}
        />

        {renderPage()}

        <footer className="border-t border-border mt-16 py-8 px-4">
          <div className="max-w-[1320px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-accent-red/15 border border-accent-red/25 flex items-center justify-center">
                <Zap size={12} className="text-accent-red" />
              </div>
              <span className="text-text-secondary text-sm font-heading font-semibold tracking-tight">
                Tesla<span className="text-text-primary">LightShows</span><span className="text-accent-red">.com</span>
              </span>
            </div>
            <p className="text-text-secondary/60 text-xs text-center">
              Generates files in Tesla's official FSEQ v2.0 format. Not affiliated with Tesla, Inc.
            </p>
            <div className="flex items-center gap-5">
              <button className="text-text-secondary/60 hover:text-text-primary text-xs transition-colors">Terms</button>
              <button className="text-text-secondary/60 hover:text-text-primary text-xs transition-colors">Privacy</button>
              <button className="text-text-secondary/60 hover:text-text-primary text-xs transition-colors">Support</button>
            </div>
          </div>
        </footer>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
      {showResetPassword && <ResetPasswordModal onClose={() => setShowResetPassword(false)} />}
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
