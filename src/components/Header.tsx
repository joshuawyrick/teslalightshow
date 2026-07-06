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
      className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-150 ${
        currentPath === path
          ? 'text-white'
          : 'text-white/50 hover:text-white/80'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <header className="border-b border-white/8 bg-[#0d0f14]/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        {/* Wordmark */}
        <button
          onClick={() => { onNavigate('/'); setMobileOpen(false); }}
          className="flex items-center gap-2.5 shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-tesla-500/20 border border-tesla-500/30 flex items-center justify-center">
            <Zap size={16} className="text-tesla-400" />
          </div>
          <span
            className="text-white font-bold text-base sm:text-lg tracking-tight"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            Tesla<span className="text-tesla-400">Light</span>Shows<span className="text-tesla-400">.com</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-5">
          {navLink('/', 'Generator', <Zap size={14} />)}
          {navLink('/gallery', 'Gallery', <Images size={14} />)}
          {user && navLink('/downloads', 'My Downloads', <Download size={14} />)}
          {profile?.is_admin && navLink('/admin', 'Admin', <ShieldCheck size={14} />)}
        </nav>

        {/* Auth area */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {user && profile ? (
            <>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                <User size={12} className="text-white/40" />
                <span className="text-white/60 text-xs max-w-[120px] truncate">{profile.email}</span>
                <span className="text-white/30 text-xs">·</span>
                <span className={`text-xs font-semibold ${profile.credits > 0 ? 'text-emerald-400' : 'text-white/40'}`}>
                  {profile.credits} credit{profile.credits !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors duration-150"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onAuthClick}
                className="text-white/60 hover:text-white text-sm font-medium transition-colors duration-150"
              >
                Log in
              </button>
              <button
                onClick={onAuthClick}
                className="bg-tesla-600 hover:bg-tesla-500 text-white text-sm font-semibold rounded-xl px-4 py-2 transition-colors duration-150"
              >
                Sign up free
              </button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="md:hidden text-white/50 hover:text-white transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/8 bg-[#0d0f14] px-4 py-4 space-y-3">
          {navLink('/', 'Generator', <Zap size={14} />)}
          {navLink('/gallery', 'Gallery', <Images size={14} />)}
          {user && navLink('/downloads', 'My Downloads', <Download size={14} />)}
          {profile?.is_admin && navLink('/admin', 'Admin', <ShieldCheck size={14} />)}
          <div className="pt-2 border-t border-white/8">
            {user && profile ? (
              <div className="space-y-2">
                <div className="text-white/50 text-sm">
                  {profile.email} · <span className={profile.credits > 0 ? 'text-emerald-400' : 'text-white/40'}>{profile.credits} credit{profile.credits !== 1 ? 's' : ''}</span>
                </div>
                <button onClick={signOut} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors">
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={onAuthClick} className="text-white/60 hover:text-white text-sm font-medium transition-colors">Log in</button>
                <button onClick={onAuthClick} className="bg-tesla-600 hover:bg-tesla-500 text-white text-sm font-semibold rounded-xl px-4 py-2 transition-colors">Sign up free</button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
