import { useState, useEffect } from 'react';
import { Shield, Clock, Cloud, Heart } from 'lucide-react';
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
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import SupportPage from './pages/SupportPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import DisclaimerPage from './pages/DisclaimerPage';
import RefundPage from './pages/RefundPage';
import CopyrightPage from './pages/CopyrightPage';
import FaqPage from './pages/FaqPage';
import { supabase } from './lib/supabase';

// ---- Simple hash-based router ----
function getHashPath(): string {
  const hash = window.location.hash;
  if (!hash || hash === '#' || hash === '#/') return '/';
  const path = hash.slice(1).split('?')[0];
  return path || '/';
}

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
    window.scrollTo(0, 0);
  };

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
            <p className="text-text-primary font-bold text-xl font-display">Purchase cancelled</p>
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
      case '/terms':     return <TermsPage onNavigate={navigate} />;
      case '/privacy':   return <PrivacyPage onNavigate={navigate} />;
      case '/support':   return <SupportPage onNavigate={navigate} />;
      case '/about':     return <AboutPage onNavigate={navigate} />;
      case '/contact':   return <ContactPage onNavigate={navigate} />;
      case '/independent-service-disclaimer': return <DisclaimerPage onNavigate={navigate} />;
      case '/refund-policy': return <RefundPage onNavigate={navigate} />;
      case '/copyright-music-upload-policy': return <CopyrightPage onNavigate={navigate} />;
      case '/faq':       return <FaqPage onNavigate={navigate} />;
      default:           return <GeneratorPage onOpenAuth={() => setShowAuth(true)} onOpenPricing={() => setShowPricing(true)} />;
    }
  };

  const isHomePage = path === '/' && !checkoutStatus;

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

        {/* Homepage Independent Service Notice */}
        {isHomePage && (
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6 mt-10 sm:mt-12">
            <div className="border border-border rounded-xl p-4 sm:p-6 bg-charcoal/50">
              <h3 className="text-text-primary text-sm font-semibold mb-2">Independent Service Notice</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                TeslaLightShows.com is an independent digital service that creates custom light show files intended for compatible Tesla vehicles that support the Light Show feature. TeslaLightShows.com is not affiliated with, endorsed by, sponsored by, or approved by Tesla, Inc. References to Tesla and Tesla vehicle names are used only to describe compatibility and intended file use.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-border mt-8 sm:mt-12">
          {/* Trust icons row */}
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center shrink-0">
                  <Shield size={14} className="text-electric-cyan" />
                </div>
                <div>
                  <p className="text-text-primary text-xs sm:text-sm font-medium">Trusted &amp; Secure</p>
                  <p className="text-text-secondary text-[10px] sm:text-xs hidden sm:block">Your data is private and safe.</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center shrink-0">
                  <Clock size={14} className="text-electric-cyan" />
                </div>
                <div>
                  <p className="text-text-primary text-xs sm:text-sm font-medium">Lightning Fast</p>
                  <p className="text-text-secondary text-[10px] sm:text-xs hidden sm:block">Shows generated in seconds.</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center shrink-0">
                  <Cloud size={14} className="text-electric-cyan" />
                </div>
                <div>
                  <p className="text-text-primary text-xs sm:text-sm font-medium">Cloud Powered</p>
                  <p className="text-text-secondary text-[10px] sm:text-xs hidden sm:block">Access anywhere, anytime.</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center shrink-0">
                  <Heart size={14} className="text-electric-cyan" />
                </div>
                <div>
                  <p className="text-text-primary text-xs sm:text-sm font-medium">Independent Service</p>
                  <p className="text-text-secondary text-[10px] sm:text-xs hidden sm:block">Built for Tesla enthusiasts.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fine print + links */}
          <div className="border-t border-border py-6 sm:py-8 px-4 sm:px-6">
            <div className="max-w-[1320px] mx-auto flex flex-col items-center gap-5">
              <img
                src="/ChatGPT_Image_Jul_6__2026__03_28_39_PM-removebg-preview.png"
                alt="TeslaLightShows.com"
                className="h-8 sm:h-9 w-auto"
              />

              {/* Fine print disclaimer */}
              <p className="text-text-secondary/60 text-[10px] sm:text-xs text-center leading-relaxed max-w-3xl">
                TeslaLightShows.com is an independent digital service and is not affiliated with, endorsed by, sponsored by, or approved by Tesla, Inc. Tesla and related vehicle names are trademarks of Tesla, Inc. References to Tesla are used only to describe compatibility and intended file use.
              </p>
              <p className="text-text-secondary/60 text-[10px] sm:text-xs text-center leading-relaxed">
                TeslaLightShows.com is operated by a California-based sole proprietor. California, United States | support@teslalightshows.com
              </p>

              {/* Footer link row */}
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                <button onClick={() => navigate('/about')} className="text-text-secondary/60 hover:text-text-primary text-[11px] sm:text-xs transition-colors">About</button>
                <span className="text-text-secondary/30 text-[10px]">|</span>
                <button onClick={() => navigate('/contact')} className="text-text-secondary/60 hover:text-text-primary text-[11px] sm:text-xs transition-colors">Contact</button>
                <span className="text-text-secondary/30 text-[10px]">|</span>
                <button onClick={() => navigate('/terms')} className="text-text-secondary/60 hover:text-text-primary text-[11px] sm:text-xs transition-colors">Terms of Service</button>
                <span className="text-text-secondary/30 text-[10px]">|</span>
                <button onClick={() => navigate('/privacy')} className="text-text-secondary/60 hover:text-text-primary text-[11px] sm:text-xs transition-colors">Privacy Policy</button>
                <span className="text-text-secondary/30 text-[10px]">|</span>
                <button onClick={() => navigate('/refund-policy')} className="text-text-secondary/60 hover:text-text-primary text-[11px] sm:text-xs transition-colors">Refund Policy</button>
                <span className="text-text-secondary/30 text-[10px]">|</span>
                <button onClick={() => navigate('/copyright-music-upload-policy')} className="text-text-secondary/60 hover:text-text-primary text-[11px] sm:text-xs transition-colors">Copyright &amp; Music Upload Policy</button>
                <span className="text-text-secondary/30 text-[10px]">|</span>
                <button onClick={() => navigate('/independent-service-disclaimer')} className="text-text-secondary/60 hover:text-text-primary text-[11px] sm:text-xs transition-colors">Independent Service Disclaimer</button>
                <span className="text-text-secondary/30 text-[10px]">|</span>
                <button onClick={() => navigate('/faq')} className="text-text-secondary/60 hover:text-text-primary text-[11px] sm:text-xs transition-colors">FAQ</button>
              </div>
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
