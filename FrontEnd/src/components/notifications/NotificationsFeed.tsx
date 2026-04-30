import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { Avatar } from '../ui/Avatar';
import { Bell, ThumbsUp, MessageSquare, UserPlus, Eye, Mail, Loader2, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICON: Record<string, any> = {
  like: { icon: ThumbsUp, color: 'var(--accent-cyan)' },
  comment: { icon: MessageSquare, color: 'var(--accent-violet)' },
  connection_request: { icon: UserPlus, color: 'var(--accent-green)' },
  connection_accepted: { icon: UserPlus, color: 'var(--accent-green)' },
  profile_view: { icon: Eye, color: 'var(--accent-amber)' },
  message: { icon: Mail, color: 'var(--accent-cyan)' },
};

export function NotificationsFeed() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getNotifications()
      .then(setNotifications)
      .catch(console.error)
      .finally(() => setLoading(false));
    api.markAllRead().catch(() => {});
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.on('new_notification', (notif: any) => {
      setNotifications(prev => [notif, ...prev]);
    });
    return () => { socket.off('new_notification'); };
  }, []);

  const markRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    await api.markAllRead();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--text-muted)' }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>Notifications</h1>
        {notifications.some(n => !n.read) && (
          <button
            onClick={() => {
              setNotifications(prev => prev.map(n => ({ ...n, read: true })));
              api.markAllRead();
            }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all"
            style={{ color: 'var(--accent-cyan)', background: 'var(--accent-cyan-dim)' }}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Bell className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-muted)' }}>No notifications yet</p>
          </div>
        ) : (
          notifications.map(notif => {
            const typeInfo = TYPE_ICON[notif.type] || TYPE_ICON.like;
            const Icon = typeInfo.icon;
            return (
              <div
                key={notif._id}
                onClick={() => !notif.read && markRead(notif._id)}
                className="flex items-start gap-4 px-5 py-4 transition-all cursor-pointer"
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: !notif.read ? 'rgba(0,207,190,0.04)' : 'transparent',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                onMouseLeave={e => (e.currentTarget.style.background = !notif.read ? 'rgba(0,207,190,0.04)' : 'transparent')}
              >
                <div className="relative shrink-0">
                  <Avatar src={notif.sender?.avatarUrl} alt={notif.sender?.name} size="md" />
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: typeInfo.color, border: '2px solid var(--bg-card)' }}
                  >
                    <Icon className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{notif.content}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : ''}
                  </p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ background: 'var(--accent-cyan)' }} />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
