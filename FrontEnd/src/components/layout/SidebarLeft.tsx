import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { TrendingUp, Eye, Users, BookmarkIcon, Hash, LocationEditIcon } from 'lucide-react';

export function SidebarLeft({ onNavigate }: { onNavigate?: (view: any) => void }) {
  const { user } = useAuth();

  const stats = [
    { label: 'Connections', value: user?.connections?.length || 0, icon: Users, color: 'var(--accent-cyan)' },
    { label: 'Profile Views', value: user?.profileViews || 0, icon: Eye, color: 'var(--accent-violet)' },
  ];

  const tags = ['#nodejs', '#nextjs', '#redis', '#websockets', '#typescript', '#ai'];

  return (
    <div className="flex flex-col gap-4 sticky top-4">
      {/* Profile Card */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {/* Cover */}
        <div className="h-16 relative" style={{ background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-violet) 100%)' }}>
          {user?.coverUrl && <img src={user.coverUrl} alt="Cover" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 opacity-20" style={{ background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>

        <div className="px-4 pb-4">
          <div className="flex justify-between items-end mt-[-28px] mb-3">
            <Avatar src={user?.avatarUrl} alt={user?.name} size="xl" online style={{ border: '3px solid var(--bg-card)', background:'white'}} />
          </div>
          <button onClick={() => onNavigate?.('profile')} className="text-left">
            <h2 className="font-display font-bold text-base hover:underline" style={{ color: 'var(--text-primary)' }}>{user?.name}</h2>
          </button>
          <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{user?.headline}</p>
          {user?.location && <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <LocationEditIcon className='h-3, w-3 text-red-400' /> {user.location}</p>}
        </div>

        <div style={{ borderTop: '1px solid var(--border)' }}>
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex items-center justify-between px-4 py-2.5 transition-all cursor-pointer"
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <div className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5" style={{ color }} />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
              </div>
              <span className="text-xs font-bold" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 flex items-center gap-2 cursor-pointer transition-all" style={{ borderTop: '1px solid var(--border)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          <BookmarkIcon className="w-3.5 h-3.5" style={{ color: 'var(--accent-amber)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Saved items</span>
        </div>
      </div>

      {/* Trending Tags */}
      <div className="rounded-2xl p-4 sticky top-20" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
          <h3 className="text-sm font-display font-semibold" style={{ color: 'var(--text-primary)' }}>Trending</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <button
              key={tag}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--accent-cyan)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-cyan)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
              }}
            >
              <Hash className="w-3 h-3" />
              {tag.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
