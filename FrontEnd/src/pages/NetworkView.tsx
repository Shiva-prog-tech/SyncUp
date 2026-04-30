import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Avatar } from '../components/ui/Avatar';
import { UserPlus, Loader2, Check, Users, LocationEditIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function NetworkView() {
  const { user } = useAuth();
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string[]>([]);
  const [connected, setConnected] = useState<string[]>([]);

  useEffect(() => {
    api.getUsers().then(setPeople).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleConnect = async (id: string) => {
    setConnecting(prev => [...prev, id]);
    try {
      await api.connect(id);
      setConnected(prev => [...prev, id]);
    } catch (e) { console.error(e); }
    finally { setConnecting(prev => prev.filter(x => x !== id)); }
  };

  if (loading) return (
    <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--text-muted)' }} /></div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 px-1">
        <Users className="w-5 h-5" style={{ color: 'var(--accent-cyan)' }} />
        <h1 className="text-xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>Grow Your Network</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {people.map(p => {
          const isAlreadyConnected = user?.connections?.some((c: any) => (c._id || c) === p._id);
          const isConnected = connected.includes(p._id) || isAlreadyConnected;
          return (
            <div key={p._id} className="rounded-2xl overflow-hidden transition-all" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
              <div className="h-16" style={{ background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-violet) 100%)', opacity: 0.7 }} />
              <div className="px-4 pb-4">
                <div className="mt-[-24px] mb-2">
                  <Avatar src={p.avatarUrl} alt={p.name} size="lg" online={p.isOnline} style={{ border: '3px solid var(--bg-card)', background:"#222" }} />
                </div>
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{p.name}</h3>
                <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{p.headline}</p>
                {p.location && <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><LocationEditIcon className='h-3, w-3 text-red-400' /> {p.location}</p>}
                <p className="text-xs mt-1" style={{ color: 'var(--accent-cyan)' }}>{p.connections?.length || 0} connections</p>
                <button
                  onClick={() => !isConnected && handleConnect(p._id)}
                  disabled={connecting.includes(p._id) || isConnected}
                  className="mt-3 w-full flex items-center justify-center gap-2 h-8 rounded-full text-xs font-semibold transition-all disabled:opacity-60"
                  style={isConnected
                    ? { background: 'var(--bg-elevated)', color: 'var(--accent-green)', border: '1px solid var(--accent-green)' }
                    : { background: 'var(--accent-cyan)', color: '#0c0d12' }
                  }
                >
                  {connecting.includes(p._id) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isConnected ? <><Check className="w-3.5 h-3.5" /> Connected</> : <><UserPlus className="w-3.5 h-3.5" /> Connect</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
