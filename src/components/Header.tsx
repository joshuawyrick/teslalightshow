import { Zap, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
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
    <button
      onClick={() => { onNavigate(path); setMobileOpen(false); }}
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
    </button>
  );

  return (
    <header className="border-b border-border bg-midnight/90 backdrop-blur-xl sticky top-0 z-30">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-6">
        {/* Wordmark */}
        <button
          onClick={() => { onNavigate('/'); setMobileOpen(false); }}
          className="flex items-center gap-2.5 shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-accent-red/20 border border-accent-red/30 flex items-center justify-center">
            <Zap size={15} className="text-accent-red" />
          </div>
          <span className="text-text-primary font-display font-bold text-base sm:text-lg tracking-tight">
            Tesla<span className="text-accent-red">Light</span>Shows<span className="text-accent-red">.com</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLink('/', 'Generator')}
          {navLink('/gallery', 'Gallery')}
          {user && navLink('/downloads', 'My Shows')}
          {profile?.is_admin && navLink('/admin', 'Admin')}
        </nav>

        {/* Auth area */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
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
              <button
                onClick={onAuthClick}
                className="bg-accent-red hover:bg-accent-red/90 text-white text-sm font-semibold rounded-xl px-4 py-2 transition-all duration-150 glow-red"
              >
                Sign up free
              </button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="md:hidden text-text-secondary hover:text-text-primary transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-charcoal px-4 py-4 space-y-3">
          {navLink('/', 'Generator')}
          {navLink('/gallery', 'Gallery')}
          {user && navLink('/downloads', 'My Shows')}
          {profile?.is_admin && navLink('/admin', 'Admin')}
          <div className="pt-3 border-t border-border">
            {user && profile ? (
              <div className="space-y-2">
                <div className="text-text-secondary text-sm">
                  {profile.email} &bull; <span className={profile.credits > 0 ? 'text-electric-cyan' : 'text-text-secondary/50'}>{profile.credits} credit{profile.credits !== 1 ? 's' : ''}</span>
                </div>
                <button onClick={signOut} className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-sm transition-colors">
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={onAuthClick} className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors">Log in</button>
                <button onClick={onAuthClick} className="bg-accent-red hover:bg-accent-red/90 text-white text-sm font-semibold rounded-xl px-4 py-2 transition-all glow-red">Sign up free</button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
