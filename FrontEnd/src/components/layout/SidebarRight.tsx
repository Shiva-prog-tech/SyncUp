import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Avatar } from '../ui/Avatar';
import { UserPlus, Loader2, Briefcase, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NEWS = [
  { title: 'Node.js 22 LTS Released — What\'s New', readers: '14.2k', time: '2h ago' },
  { title: 'AI engineers now most in-demand role of 2025', readers: '9.8k', time: '5h ago' },
  { title: 'Redis 8.0 brings vector search built-in', readers: '6.3k', time: '1d ago' },
  { title: 'WebSockets vs. SSE: Which to pick in 2025?', readers: '4.1k', time: '2d ago' },
  { title: 'Next.js 15 App Router performance deep-dive', readers: '11k', time: '3d ago' },
];

export function SidebarRight() {
  const { user } = useAuth();
  const [people, setPeople] = useState<any[]>([]);
  const [connecting, setConnecting] = useState<string[]>([]);
  const [connected, setConnected] = useState<string[]>([]);

  useEffect(() => {
    api.getUsers().then(data => setPeople(data.slice(0, 4))).catch(() => {});
  }, []);

  const handleConnect = async (id: string) => {
    setConnecting(prev => [...prev, id]);
    try {
      await api.connect(id);
      setConnected(prev => [...prev, id]);
    } catch (e) { console.error(e); }
    finally { setConnecting(prev => prev.filter(x => x !== id)); }
  };

  return (
    <div className="flex flex-col gap-4 sticky top-4">
      {/* People you may know */}
      <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h3 className="text-sm font-display font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>People You May Know</h3>
        <div className="space-y-3">
          {people.map(p => (
            <div key={p._id} className="flex items-center gap-3">
              <Avatar src={p.avatarUrl} alt={p.name} size="md" online={p.isOnline} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{p.headline}</p>
              </div>
              <button
                onClick={() => handleConnect(p._id)}
                disabled={connecting.includes(p._id) || connected.includes(p._id) || user?.connections?.some((c: any) => (c._id || c) === p._id)}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all disabled:opacity-50"
                style={{
                  border: '1px solid var(--border-accent)',
                  color: connected.includes(p._id) ? 'var(--accent-green)' : 'var(--text-secondary)',
                  background: 'transparent',
                }}
              >
                {connecting.includes(p._id) ? <Loader2 className="w-3 h-3 animate-spin" /> : connected.includes(p._id) ? '✓' : <UserPlus className="w-3 h-3" />}
                {!connecting.includes(p._id) && <span>{connected.includes(p._id) ? 'Connected' : 'Connect'}</span>}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SyncUp News */}
      <div className="rounded-2xl p-4 sticky top-20" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-4 h-4" style={{ color: 'var(--accent-violet)' }} />
          <h3 className="text-sm font-display font-semibold" style={{ color: 'var(--text-primary)' }}>SyncUp News</h3>
        </div>
        <ul className="space-y-3">
          {NEWS.map((item, i) => (
            <li key={i} className="group cursor-pointer">
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full mt-2 shrink-0 transition-colors" style={{ background: 'var(--text-muted)' }} />
                <div>
                  <p className="text-xs font-medium leading-snug transition-colors" style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--accent-cyan)')}
                    onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--text-primary)')}
                  >{item.title}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.time} · {item.readers} readers</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <button className="flex items-center gap-1 mt-4 text-xs transition-all" style={{ color: 'var(--accent-cyan)' }}>
          Show more <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Footer */}
      <div className="px-2 py-1">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          {['About', 'Help', 'Privacy', 'Terms', 'Accessibility'].map(l => (
            <a key={l} href="#" className="hover:underline" style={{ color: 'var(--text-muted)' }}>{l}</a>
          ))}
        </div>
        <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>SyncUp © 2026</p>
      </div>
    </div>
  );
}
