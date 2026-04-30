import { useState } from 'react';
import { ThumbsUp, MessageSquare, Share2, MoreHorizontal, Trash2, Send, ChevronDown } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

function timeAgo(date: string) {
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }); }
  catch { return date; }
}

export function PostCard({ post, onUpdate }: { post: any; onUpdate: (p: any) => void }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const isLiked = post.likes?.some((l: any) => (l._id || l) === user?._id);
  const isOwn = post.author?._id === user?._id || post.author?.id === user?._id;

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const updated = await api.likePost(post._id);
      onUpdate(updated);
    } catch (e) { console.error(e); }
    finally { setLikeLoading(false); }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setCommenting(true);
    try {
      const updated = await api.commentPost(post._id, comment);
      onUpdate(updated);
      setComment('');
    } catch (e) { console.error(e); }
    finally { setCommenting(false); }
  };

  const handleDelete = async () => {
    try { await api.deletePost(post._id); }
    catch (e) { console.error(e); }
    setShowMenu(false);
  };

  return (
    <div className="rounded-2xl overflow-hidden transition-all" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="flex items-start justify-between p-5">
        <div className="flex gap-3">
          <Avatar src={post.author?.avatarUrl} alt={post.author?.name} size="md" online={post.author?.isOnline} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{post.author?.name}</span>
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-cyan-dim)', color: 'var(--accent-cyan)' }}>1st</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{post.author?.headline}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {post.createdAt ? timeAgo(post.createdAt) : post.timestamp || 'Just now'} · 🌐
            </p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full transition-all"
            style={{ color: 'var(--text-muted)' }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 z-10 rounded-xl py-1 min-w-32 shadow-2xl slide-down" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              {isOwn ? (
                <button onClick={handleDelete} className="flex items-center gap-2 w-full px-3 py-2 text-sm transition-all" style={{ color: 'var(--accent-red)' }}>
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              ) : (
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm transition-all" style={{ color: 'var(--text-secondary)' }}>
                  Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-4">
        <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)' }}>{post.content}</p>
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.map((t: string) => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-cyan-dim)', color: 'var(--accent-cyan)' }}>{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="mx-0 overflow-hidden" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <img src={post.imageUrl} alt="Post" className="w-full max-h-80 object-cover" />
        </div>
      )}

      {/* Stats */}
      {(post.likes?.length > 0 || post.comments?.length > 0) && (
        <div className="px-5 py-2 flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
          {post.likes?.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex items-center justify-center w-4 h-4 rounded-full" style={{ background: 'var(--accent-cyan)' }}>
                <ThumbsUp className="w-2.5 h-2.5 text-[#0c0d12]" />
              </div>
              <span>{post.likes.length}</span>
            </div>
          )}
          {post.comments?.length > 0 && (
            <button onClick={() => setShowComments(!showComments)} className="hover:underline">
              {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-2 py-1 flex items-center gap-1" style={{ borderTop: '1px solid var(--border)' }}>
        <ActionBtn
          icon={<ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />}
          label="Like"
          active={isLiked}
          onClick={handleLike}
        />
        <ActionBtn
          icon={<MessageSquare className="w-4 h-4" />}
          label="Comment"
          onClick={() => setShowComments(!showComments)}
        />
        <ActionBtn icon={<Share2 className="w-4 h-4" />} label="Share" />
        {post.comments?.length > 0 && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="ml-auto p-2 rounded-full transition-all"
            style={{ color: 'var(--text-muted)' }}
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showComments ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-5 pb-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
          {/* Existing comments */}
          {post.comments?.map((c: any) => (
            <div key={c._id} className="flex gap-2 mt-3">
              <Avatar src={c.author?.avatarUrl} alt={c.author?.name} size="xs" />
              <div className="flex-1 px-3 py-2 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{c.author?.name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{c.content}</p>
              </div>
            </div>
          ))}

          {/* New comment input */}
          <form onSubmit={handleComment} className="flex gap-2 mt-3">
            <Avatar src={user?.avatarUrl} alt={user?.name} size="xs" online />
            <div className="flex-1 flex gap-2">
              <input
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 h-8 px-3 rounded-full text-xs outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
              <button
                type="submit"
                disabled={!comment.trim() || commenting}
                className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-40"
                style={{ background: 'var(--accent-cyan)', color: '#0c0d12' }}
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium flex-1 justify-center transition-all"
      style={{ color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}
    >
      {icon}
      <span className="hidden sm:block">{label}</span>
    </button>
  );
}
