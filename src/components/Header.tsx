import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onAuthClick: () => void;
}

export default function Header({ currentPath, onNavigate, onAuthClick }: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLink = (path: string, label: string) => (
    <a
      href={path}
      onClick={(e) => { e.preventDefault(); onNavigate(path); setMobileOpen(false); }}
      className={`text-sm font-medium transition-all duration-200 relative py-1 ${
        currentPath === path
          ? 'text-electric-cyan'
          : 'text-text-secondary hover:text-text-primary'
      }`}
    >
      {label}
      {currentPath === path && (
        <span className="absolute -bottom-3 left-0 right-0 h-0.5 bg-electric-cyan rounded-full shadow-[0_0_6px_#00E5FF]" />
      )}
    </a>
  );

  return (
    <header className="border-b border-border bg-midnight/90 backdrop-blur-xl sticky top-0 z-30">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-4 hidden md:grid grid-cols-3 items-center">
        {/* Left nav */}
        <nav className="flex items-center gap-8 justify-self-start">
          {navLink('/', 'Generator')}
          {navLink('/tesla-light-show-gallery', 'Gallery')}
          {user && navLink('/downloads', 'My Shows')}
          {profile?.is_admin && navLink('/admin', 'Admin')}
        </nav>

        {/* Center logo */}
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); onNavigate('/'); setMobileOpen(false); }}
          className="justify-self-center shrink-0"
        >
          <img
            src="/ChatGPT_Image_Jul_6__2026__03_28_39_PM-removebg-preview.png"
            alt="TeslaLightShows.com"
            className="h-[2.85rem] w-auto"
          />
        </a>

        {/* Right - CTA + Auth */}
        <div className="flex items-center gap-6 justify-self-end">
          {navLink('/how-to-add-custom-light-show-to-tesla', 'How It Works')}
          <div className="flex items-center gap-3">
            {user && profile ? (
              <>
                <div className="flex items-center gap-2 bg-charcoal border border-border rounded-full px-4 py-1.5">
                  <span className={`text-sm font-bold ${profile.credits > 0 ? 'text-electric-cyan' : 'text-text-secondary/50'}`}>
                    {profile.credits}
                  </span>
                  <span className="text-text-secondary text-xs">Credits</span>
                </div>
                <div className="flex items-center gap-2 bg-charcoal border border-border rounded-full px-3 py-1.5">
                  <div className="w-5 h-5 rounded-full bg-accent-red/20 flex items-center justify-center">
                    <span className="text-accent-red text-[10px] font-bold">{profile.email?.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-text-secondary text-xs max-w-[100px] truncate">{profile.email}</span>
                </div>
                <button
                  onClick={signOut}
                  className="text-text-secondary hover:text-text-primary text-sm transition-colors duration-150 ml-1"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onAuthClick}
                  className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors duration-150"
                >
                  Log in
                </button>
                <a
                  href="/tesla-light-show-generator"
                  onClick={(e) => { e.preventDefault(); onNavigate('/tesla-light-show-generator'); }}
                  className="bg-accent-red hover:bg-accent-red/90 text-white text-sm font-semibold rounded-xl px-4 py-2 transition-all duration-150 glow-red"
                >
                  Generate My Light Show
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-4 flex md:hidden items-center justify-between">
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); onNavigate('/'); setMobileOpen(false); }}
          className="shrink-0"
        >
          <img
            src="/ChatGPT_Image_Jul_6__2026__03_28_39_PM-removebg-preview.png"
            alt="TeslaLightShows.com"
            className="h-[2.85rem] w-auto"
          />
        </a>
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-charcoal px-5 py-5 space-y-1">
          <nav className="flex flex-col gap-1">
            {[
              { path: '/', label: 'Generator' },
              { path: '/tesla-light-show-gallery', label: 'Gallery' },
              { path: '/how-to-add-custom-light-show-to-tesla', label: 'How It Works' },
              ...(user ? [{ path: '/downloads', label: 'My Shows' }] : []),
              ...(profile?.is_admin ? [{ path: '/admin', label: 'Admin' }] : []),
            ].map(item => (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => { e.preventDefault(); onNavigate(item.path); setMobileOpen(false); }}
                className={`text-left text-base font-medium py-3 px-3 rounded-xl transition-all duration-150 ${
                  currentPath === item.path
                    ? 'text-electric-cyan bg-electric-cyan/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="pt-4 mt-3 border-t border-border">
            {user && profile ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-3">
                  <span className="text-text-secondary text-sm truncate max-w-[200px]">{profile.email}</span>
                  <span className={`text-sm font-bold ${profile.credits > 0 ? 'text-electric-cyan' : 'text-text-secondary/50'}`}>
                    {profile.credits} credit{profile.credits !== 1 ? 's' : ''}
                  </span>
                </div>
                <button onClick={() => { signOut(); setMobileOpen(false); }} className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm py-2 px-3 rounded-xl hover:bg-white/5 transition-all w-full">
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 px-3">
                <a
                  href="/tesla-light-show-generator"
                  onClick={(e) => { e.preventDefault(); onNavigate('/tesla-light-show-generator'); setMobileOpen(false); }}
                  className="w-full text-center bg-accent-red hover:bg-accent-red/90 text-white text-sm font-semibold rounded-xl px-4 py-3 transition-all glow-red"
                >
                  Generate My Light Show
                </a>
                <button onClick={() => { onAuthClick(); setMobileOpen(false); }} className="w-full text-text-secondary hover:text-text-primary text-sm font-medium py-2 transition-colors">Log in / Sign up</button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
