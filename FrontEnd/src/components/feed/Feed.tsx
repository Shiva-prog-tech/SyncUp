import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { CreatePost } from './CreatePost';
import { PostCard } from './PostCard';
import { Loader2, RefreshCw } from 'lucide-react';

export function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (p = 1, append = false) => {
    try {
      const data = await api.getPosts(p);
      setPosts(prev => append ? [...prev, ...data.posts] : data.posts);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  // Real-time: listen for new posts, updates, deletes
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('new_post', (post: any) => {
      setPosts(prev => [post, ...prev]);
    });

    socket.on('post_updated', (updated: any) => {
      setPosts(prev => prev.map(p => p._id === updated._id ? updated : p));
    });

    socket.on('post_deleted', (postId: string) => {
      setPosts(prev => prev.filter(p => p._id !== postId));
    });

    return () => {
      socket.off('new_post');
      socket.off('post_updated');
      socket.off('post_deleted');
    };
  }, []);

  const handleNewPost = (post: any) => {
    setPosts(prev => [post, ...prev]);
  };

  const handlePostUpdate = (updated: any) => {
    setPosts(prev => prev.map(p => p._id === updated._id ? updated : p));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchPosts(1);
  };

  const handleLoadMore = async () => {
    const next = page + 1;
    setPage(next);
    await fetchPosts(next, true);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex gap-3 mb-4">
              <div className="w-10 h-10 rounded-full" style={{ background: 'var(--bg-elevated)' }} />
              <div className="flex-1 space-y-2">
                <div className="h-3 rounded w-1/3" style={{ background: 'var(--bg-elevated)' }} />
                <div className="h-2 rounded w-1/2" style={{ background: 'var(--bg-elevated)' }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 rounded" style={{ background: 'var(--bg-elevated)' }} />
              <div className="h-3 rounded w-4/5" style={{ background: 'var(--bg-elevated)' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CreatePost onPost={handleNewPost} />

      <div className="flex items-center gap-2">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full transition-all" style={{ color: 'var(--text-secondary)', background: 'var(--bg-elevated)' }}>
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh feed'}
        </button>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      <div className="flex flex-col gap-4">
        {posts.map((post, i) => (
          <div key={post._id} className="fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
            <PostCard post={post} onUpdate={handlePostUpdate} />
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={handleLoadMore}
          className="w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        >
          <Loader2 className="w-4 h-4" />
          Load more posts
        </button>
      )}
    </div>
  );
}
