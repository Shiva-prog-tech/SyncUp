import { Search, Home, Users, Briefcase, Bell, Zap, X, MessageSquare, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';

type View = 'home' | 'network' | 'jobs' | 'notifications' | 'profile';

interface NavbarProps {
  currentView: View;
  setCurrentView: (v: View) => void;
}

export function Navbar({ currentView, setCurrentView }: NavbarProps) {
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { id: 'home' as View, icon: Home, label: 'Home' },
    { id: 'network' as View, icon: Users, label: 'Network' },
    { id: 'jobs' as View, icon: Briefcase, label: 'Jobs' },
    { id: 'notifications' as View, icon: Bell, label: 'Alerts' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full" style={{
      background: 'rgba(12,13,18,0.9)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => setCurrentView('home')}>
          <div className="flex items-center justify-center w-8 h-8 rounded-xl" style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg hidden sm:block" style={{ color: 'var(--text-primary)' }}>
            Sync<span style={{ color: 'var(--accent-cyan)' }}>Up</span>
          </span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-sm hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search people, jobs, posts..."
              className="w-full h-9 pl-9 pr-4 text-sm rounded-full outline-none transition-all"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent-cyan)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
        </div>

        {/* Nav */}
        <div className="flex items-center gap-1">
          <button className="md:hidden p-2 rounded-full" style={{ color: 'var(--text-secondary)' }} onClick={() => setSearchOpen(!searchOpen)}>
            {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>

          {navItems.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setCurrentView(id)}
              className="flex flex-col items-center justify-center px-3 py-2 rounded-xl text-xs transition-all cursor-pointer gap-0.5"
              style={{ color: currentView === id ? 'var(--accent-cyan)' : 'var(--text-secondary)', background: currentView === id ? 'var(--accent-cyan-dim)' : 'transparent' }}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden lg:block font-medium" style={{ fontSize: 11 }}>{label}</span>
            </button>
          ))}

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2 py-1 rounded-full transition-all"
              style={{
                background: currentView === 'profile' ? 'var(--accent-cyan-dim)' : 'transparent',
                border: `1px solid ${currentView === 'profile' ? 'var(--accent-cyan)' : 'transparent'}`,
              }}
            >
              <Avatar src={user?.avatarUrl} alt={user?.name} size="sm" online />
              <span className="text-xs font-medium hidden md:block" style={{ color: 'var(--text-secondary)' }}></span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-10 z-50 rounded-2xl py-2 w-52 shadow-2xl slide-down" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-accent)' }}>
                <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{user?.headline}</p>
                </div>
                <button onClick={() => { setCurrentView('profile'); setShowUserMenu(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-all"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  View Profile
                </button>
                <button onClick={() => { logout(); setShowUserMenu(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-all"
                  style={{ color: 'var(--accent-red)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="md:hidden px-4 pb-3 slide-down">
          <input autoFocus type="text" placeholder="Search SyncUp..."
            className="w-full h-9 px-4 text-sm rounded-full outline-none"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--accent-cyan)', color: 'var(--text-primary)' }}
          />
        </div>
      )}
    </nav>
  );
}
