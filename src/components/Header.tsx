import { Zap, Download, Images, LogOut, User, ShieldCheck, Menu, X } from 'lucide-react';
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

  const navLink = (path: string, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => { onNavigate(path); setMobileOpen(false); }}
      className={`flex items-center gap-2 text-sm font-medium transition-all duration-200 relative py-1 ${
        currentPath === path
          ? 'text-electric-blue'
          : 'text-text-secondary hover:text-text-primary'
      }`}
    >
      {icon}
      {label}
      {currentPath === path && (
        <span className="absolute -bottom-3 left-0 right-0 h-0.5 bg-electric-blue rounded-full" />
      )}
    </button>
  );

  return (
    <header className="border-b border-border bg-charcoal/75 backdrop-blur-xl sticky top-0 z-30">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-6">
        {/* Wordmark */}
        <button
          onClick={() => { onNavigate('/'); setMobileOpen(false); }}
          className="flex items-center gap-2.5 shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-accent-red/15 border border-accent-red/25 flex items-center justify-center">
            <Zap size={15} className="text-accent-red" />
          </div>
          <span className="text-text-primary font-heading font-bold text-base sm:text-lg tracking-tight">
            Tesla<span className="text-text-primary">LightShows</span><span className="text-accent-red">.com</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7">
          {navLink('/', 'Generator', <Zap size={14} />)}
          {navLink('/gallery', 'Gallery', <Images size={14} />)}
          {user && navLink('/downloads', 'My Shows', <Download size={14} />)}
          {profile?.is_admin && navLink('/admin', 'Admin', <ShieldCheck size={14} />)}
        </nav>

        {/* Auth area */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {user && profile ? (
            <>
              <div className="flex items-center gap-2 bg-steel border border-border rounded-full px-3.5 py-1.5">
                <User size={12} className="text-text-secondary" />
                <span className="text-text-secondary text-xs max-w-[120px] truncate">{profile.email}</span>
                <span className="text-border text-xs">|</span>
                <span className={`text-xs font-semibold ${profile.credits > 0 ? 'text-emerald-400' : 'text-text-secondary/50'}`}>
                  {profile.credits} credit{profile.credits !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-sm transition-colors duration-150"
              >
                <LogOut size={14} />
                Sign out
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
          {navLink('/', 'Generator', <Zap size={14} />)}
          {navLink('/gallery', 'Gallery', <Images size={14} />)}
          {user && navLink('/downloads', 'My Shows', <Download size={14} />)}
          {profile?.is_admin && navLink('/admin', 'Admin', <ShieldCheck size={14} />)}
          <div className="pt-3 border-t border-border">
            {user && profile ? (
              <div className="space-y-2">
                <div className="text-text-secondary text-sm">
                  {profile.email} · <span className={profile.credits > 0 ? 'text-emerald-400' : 'text-text-secondary/50'}>{profile.credits} credit{profile.credits !== 1 ? 's' : ''}</span>
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
