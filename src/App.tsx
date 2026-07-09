import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import PricingModal from './components/PricingModal';
import ResetPasswordModal from './components/ResetPasswordModal';
import Footer from './components/Footer';
import GeneratorPage from './pages/GeneratorPage';
import HomePage from './pages/HomePage';
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
import SeoGeneratorPage from './pages/seo/SeoGeneratorPage';
import SeoDownloadsPage from './pages/seo/DownloadsPage';
import HowToPage from './pages/seo/HowToPage';
import BestSoftwarePage from './pages/seo/BestSoftwarePage';
import TroubleshootingPage from './pages/seo/TroubleshootingPage';
import UsbSetupPage from './pages/seo/UsbSetupPage';
import CustomShowPage from './pages/seo/CustomShowPage';
import { ModelsHubPage, ModelYPage, Model3Page, CybertruckPage, ModelSXPage } from './pages/seo/ModelPages';
import { HalloweenPage, ChristmasPage, BirthdayPage, NewYearPage, IdeasPage } from './pages/seo/SeasonalPages';
import FaqHubPage from './pages/seo/FaqHubPage';
import { supabase } from './lib/supabase';

function HashRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#/')) {
      const target = hash.slice(1);
      window.history.replaceState(null, '', target);
      navigate(target, { replace: true });
    }
  }, [location, navigate]);

  return null;
}

function CheckoutHandler({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const checkoutStatus = searchParams.get('checkout');
  const stripeSessionId = searchParams.get('session_id');

  if (checkoutStatus === 'success') {
    return <SuccessPage sessionId={stripeSessionId} onNavigate={(to) => navigate(to)} />;
  }

  if (checkoutStatus === 'cancel') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-charcoal border border-border rounded-2xl p-10 max-w-md w-full text-center space-y-4">
          <p className="text-text-primary font-bold text-xl font-display">Purchase cancelled</p>
          <p className="text-text-secondary text-sm">No charge was made. You can buy credits any time from the generator.</p>
          <button onClick={() => { window.history.replaceState({}, '', '/'); navigate('/'); }} className="w-full bg-steel hover:bg-slate border border-border text-text-primary font-semibold rounded-xl py-3 transition-all duration-150">
            Back to generator
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppInner() {
  const [showAuth, setShowAuth] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowResetPassword(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const onNavigate = (to: string) => {
    navigate(to);
    window.scrollTo(0, 0);
  };

  const isHomePage = location.pathname === '/' && !new URLSearchParams(location.search).get('checkout');

  return (
    <div className="min-h-screen bg-midnight text-text-primary font-body relative">
      <div className="app-bg-glow" />
      <div className="relative z-10">
        <Header
          currentPath={location.pathname}
          onNavigate={onNavigate}
          onAuthClick={() => setShowAuth(true)}
        />

        <CheckoutHandler>
          <Routes>
            <Route path="/" element={<HomePage onOpenAuth={() => setShowAuth(true)} onOpenPricing={() => setShowPricing(true)} />} />
            <Route path="/downloads" element={<MyDownloadsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/terms" element={<TermsPage onNavigate={onNavigate} />} />
            <Route path="/privacy" element={<PrivacyPage onNavigate={onNavigate} />} />
            <Route path="/support" element={<SupportPage onNavigate={onNavigate} />} />
            <Route path="/about" element={<AboutPage onNavigate={onNavigate} />} />
            <Route path="/contact" element={<ContactPage onNavigate={onNavigate} />} />
            <Route path="/independent-service-disclaimer" element={<DisclaimerPage onNavigate={onNavigate} />} />
            <Route path="/refund-policy" element={<RefundPage onNavigate={onNavigate} />} />
            <Route path="/copyright-music-upload-policy" element={<CopyrightPage onNavigate={onNavigate} />} />
            <Route path="/faq" element={<FaqPage onNavigate={onNavigate} />} />

            {/* SEO Pages */}
            <Route path="/tesla-light-show-generator" element={<SeoGeneratorPage onOpenAuth={() => setShowAuth(true)} onOpenPricing={() => setShowPricing(true)} />} />
            <Route path="/tesla-light-show-downloads" element={<SeoDownloadsPage />} />
            <Route path="/how-to-add-custom-light-show-to-tesla" element={<HowToPage />} />
            <Route path="/best-tesla-light-show-software" element={<BestSoftwarePage />} />
            <Route path="/tesla-light-show-not-working" element={<TroubleshootingPage />} />
            <Route path="/tesla-light-show-usb-setup" element={<UsbSetupPage />} />
            <Route path="/custom-tesla-light-show" element={<CustomShowPage />} />
            <Route path="/tesla-light-show-models" element={<ModelsHubPage />} />
            <Route path="/tesla-model-y-light-show" element={<ModelYPage />} />
            <Route path="/tesla-model-3-light-show" element={<Model3Page />} />
            <Route path="/cybertruck-light-show" element={<CybertruckPage />} />
            <Route path="/tesla-model-s-model-x-light-show" element={<ModelSXPage />} />
            <Route path="/tesla-halloween-light-show" element={<HalloweenPage />} />
            <Route path="/tesla-christmas-light-show" element={<ChristmasPage />} />
            <Route path="/tesla-birthday-light-show" element={<BirthdayPage />} />
            <Route path="/tesla-new-year-light-show" element={<NewYearPage />} />
            <Route path="/tesla-light-show-ideas" element={<IdeasPage />} />
            <Route path="/tesla-light-show-faq" element={<FaqHubPage />} />
            <Route path="/tesla-light-show-gallery" element={<GalleryPage />} />

            {/* Fallback */}
            <Route path="*" element={<GeneratorPage onOpenAuth={() => setShowAuth(true)} onOpenPricing={() => setShowPricing(true)} />} />
          </Routes>
        </CheckoutHandler>

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

        <Footer />
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
      {showResetPassword && <ResetPasswordModal onClose={() => setShowResetPassword(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HashRedirect />
        <ScrollToTop />
        <AppInner />
      </AuthProvider>
    </BrowserRouter>
  );
}
