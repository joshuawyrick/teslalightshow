import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
const AuthModal = lazy(() => import('./components/AuthModal'));
const PricingModal = lazy(() => import('./components/PricingModal'));
const ResetPasswordModal = lazy(() => import('./components/ResetPasswordModal'));
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import GeneratorPage from './pages/GeneratorPage';
import { supabase } from './lib/supabase';

const MyDownloadsPage = lazy(() => import('./pages/MyDownloadsPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const GallerySubmitPage = lazy(() => import('./pages/GallerySubmitPage'));
const GalleryVideoPage = lazy(() => import('./pages/GalleryVideoPage'));
const MyGallerySubmissionsPage = lazy(() => import('./pages/MyGallerySubmissionsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const SuccessPage = lazy(() => import('./pages/SuccessPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const DisclaimerPage = lazy(() => import('./pages/DisclaimerPage'));
const RefundPage = lazy(() => import('./pages/RefundPage'));
const CopyrightPage = lazy(() => import('./pages/CopyrightPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const SeoGeneratorPage = lazy(() => import('./pages/seo/SeoGeneratorPage'));
const SeoDownloadsPage = lazy(() => import('./pages/seo/DownloadsPage'));
const HowToPage = lazy(() => import('./pages/seo/HowToPage'));
const BestSoftwarePage = lazy(() => import('./pages/seo/BestSoftwarePage'));
const TroubleshootingPage = lazy(() => import('./pages/seo/TroubleshootingPage'));
const UsbSetupPage = lazy(() => import('./pages/seo/UsbSetupPage'));
const CustomShowPage = lazy(() => import('./pages/seo/CustomShowPage'));
const ModelsHubPage = lazy(() => import('./pages/seo/ModelPages').then(m => ({ default: m.ModelsHubPage })));
const ModelYPage = lazy(() => import('./pages/seo/ModelPages').then(m => ({ default: m.ModelYPage })));
const Model3Page = lazy(() => import('./pages/seo/ModelPages').then(m => ({ default: m.Model3Page })));
const CybertruckPage = lazy(() => import('./pages/seo/ModelPages').then(m => ({ default: m.CybertruckPage })));
const ModelSXPage = lazy(() => import('./pages/seo/ModelPages').then(m => ({ default: m.ModelSXPage })));
const HalloweenPage = lazy(() => import('./pages/seo/SeasonalPages').then(m => ({ default: m.HalloweenPage })));
const ChristmasPage = lazy(() => import('./pages/seo/SeasonalPages').then(m => ({ default: m.ChristmasPage })));
const BirthdayPage = lazy(() => import('./pages/seo/SeasonalPages').then(m => ({ default: m.BirthdayPage })));
const NewYearPage = lazy(() => import('./pages/seo/SeasonalPages').then(m => ({ default: m.NewYearPage })));
const IdeasPage = lazy(() => import('./pages/seo/SeasonalPages').then(m => ({ default: m.IdeasPage })));
const FaqHubPage = lazy(() => import('./pages/seo/FaqHubPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));

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
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash.slice(1));
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
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
    if (!to.includes('#')) window.scrollTo(0, 0);
  };

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
          <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-electric-cyan border-t-transparent rounded-full animate-spin" /></div>}>
          <Routes>
            <Route path="/" element={<HomePage onOpenAuth={() => setShowAuth(true)} onOpenPricing={() => setShowPricing(true)} />} />
            <Route path="/downloads" element={<MyDownloadsPage />} />
            <Route path="/gallery" element={<GalleryPage onNavigate={onNavigate} />} />
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
            <Route path="/pricing" element={<PricingPage onOpenAuth={() => setShowAuth(true)} onNavigate={onNavigate} />} />

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
            <Route path="/tesla-light-show-gallery" element={<GalleryPage onNavigate={onNavigate} />} />
            <Route path="/tesla-light-show-gallery/submit" element={<GallerySubmitPage onOpenAuth={() => setShowAuth(true)} />} />
            <Route path="/tesla-light-show-gallery/show/:slug" element={<GalleryVideoPage />} />
            <Route path="/tesla-light-show-gallery/my-submissions" element={<MyGallerySubmissionsPage onOpenAuth={() => setShowAuth(true)} />} />

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </Suspense>
        </CheckoutHandler>

        <Footer />
      </div>

      {showAuth && <Suspense fallback={null}><AuthModal onClose={() => setShowAuth(false)} /></Suspense>}
      {showPricing && <Suspense fallback={null}><PricingModal onClose={() => setShowPricing(false)} /></Suspense>}
      {showResetPassword && <Suspense fallback={null}><ResetPasswordModal onClose={() => setShowResetPassword(false)} /></Suspense>}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HashRedirect />
      <ScrollToTop />
      <AppInner />
    </AuthProvider>
  );
}
