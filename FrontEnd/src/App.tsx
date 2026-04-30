import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Navbar } from './components/layout/Navbar';
import { SidebarLeft } from './components/layout/SidebarLeft';
import { SidebarRight } from './components/layout/SidebarRight';
import { Feed } from './components/feed/Feed';
import { ProfileView } from './components/profile/ProfileView';
import { NotificationsFeed } from './components/notifications/NotificationsFeed';
import { MessagingWidget } from './components/messaging/MessagingWidget';
import { NetworkView } from './pages/NetworkView';
import { JobsView } from './pages/JobsView';
import { Loader2 } from 'lucide-react';

type View = 'home' | 'network' | 'jobs' | 'notifications' | 'profile';

function AppShell() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [view, setView] = useState<View>('home');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))' }}>
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading SyncUp...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return showLogin
      ? <LoginPage onSwitch={() => setShowLogin(false)} />
      : <RegisterPage onSwitch={() => setShowLogin(true)} />;
  }

  const mainContent = () => {
    switch (view) {
      case 'notifications': return <NotificationsFeed />;
      case 'profile': return <ProfileView />;
      case 'network': return <NetworkView />;
      case 'jobs': return <JobsView />;
      default: return <Feed />;
    }
  };

  const hideSidebars = view === 'profile';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Navbar currentView={view} setCurrentView={setView} />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className={`grid gap-6 ${hideSidebars ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-[260px_1fr] lg:grid-cols-[260px_1fr_280px]'}`}>
          {!hideSidebars && (
            <aside className="hidden md:block">
              <SidebarLeft onNavigate={setView} />
            </aside>
          )}
          <div className="min-w-0">{mainContent()}</div>
          {!hideSidebars && (
            <aside className="hidden lg:block">
              <SidebarRight />
            </aside>
          )}
        </div>
      </main>
      <MessagingWidget />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
