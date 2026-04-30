// import { useState, useEffect, useRef, useCallback } from 'react';
// import { MessageSquare, X, Search, Send, Loader2, Check, CheckCheck, ChevronLeft, Plus } from 'lucide-react';
// import { Avatar } from '../ui/Avatar';
// import { api } from '../../lib/api';
// import { getSocket } from '../../lib/socket';
// import { useAuth } from '../../context/AuthContext';
// import { formatDistanceToNow } from 'date-fns';

// export function MessagingWidget() {
//   const { user } = useAuth();
//   const [open, setOpen] = useState(false);
//   const [view, setView] = useState<'list' | 'chat' | 'new'>('list');
//   const [conversations, setConversations] = useState<any[]>([]);
//   const [activeUser, setActiveUser] = useState<any>(null);
//   const [messages, setMessages] = useState<any[]>([]);
//   const [text, setText] = useState('');
//   const [sending, setSending] = useState(false);
//   const [typing, setTyping] = useState(false);
//   const [typingTimeout, setTypingTimeout] = useState<any>(null);
//   const [searchQ, setSearchQ] = useState('');
//   const [searchResults, setSearchResults] = useState<any[]>([]);
//   const [loadingConvs, setLoadingConvs] = useState(false);
//   const [loadingMsgs, setLoadingMsgs] = useState(false);
//   const [unreadTotal, setUnreadTotal] = useState(0);
//   const bottomRef = useRef<HTMLDivElement>(null);

//   const loadConversations = useCallback(async () => {
//     setLoadingConvs(true);
//     try {
//       const data = await api.getConversations();
//       setConversations(data);
//       setUnreadTotal(data.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0));
//     } catch (e) { console.error(e); }
//     finally { setLoadingConvs(false); }
//   }, []);

//   useEffect(() => {
//     if (open && view === 'list') loadConversations();
//   }, [open, view, loadConversations]);

//   useEffect(() => {
//     const socket = getSocket();
//     if (!socket) return;

//     socket.on('new_message', (msg: any) => {
//       setMessages(prev => [...prev, msg]);
//       if (view === 'list' || activeUser?._id !== (msg.sender?._id || msg.sender)) {
//         setUnreadTotal(prev => prev + 1);
//         loadConversations();
//       }
//     });

//     socket.on('message_sent', (msg: any) => {
//       setMessages(prev => {
//         const exists = prev.some(m => m._id === msg._id);
//         return exists ? prev : [...prev, msg];
//       });
//     });

//     socket.on('user_typing', ({ userId }: any) => {
//       if (activeUser?._id === userId) setTyping(true);
//     });

//     socket.on('user_stopped_typing', ({ userId }: any) => {
//       if (activeUser?._id === userId) setTyping(false);
//     });

//     socket.on('messages_read', () => {
//       setMessages(prev => prev.map(m => ({ ...m, read: true })));
//     });

//     return () => {
//       socket.off('new_message');
//       socket.off('message_sent');
//       socket.off('user_typing');
//       socket.off('user_stopped_typing');
//       socket.off('messages_read');
//     };
//   }, [activeUser, view, loadConversations]);

//   const openChat = async (chatUser: any) => {
//     setActiveUser(chatUser);
//     setView('chat');
//     setLoadingMsgs(true);
//     try {
//       const data = await api.getMessages(chatUser._id);
//       setMessages(data);
//       // Mark as read
//       const socket = getSocket();
//       socket?.emit('mark_read', { senderId: chatUser._id });
//       setUnreadTotal(prev => Math.max(0, prev - (conversations.find(c => c.user?._id === chatUser._id)?.unreadCount || 0)));
//     } catch (e) { console.error(e); }
//     finally { setLoadingMsgs(false); }
//   };

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages, typing]);

//   const handleSend = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!text.trim() || !activeUser || sending) return;
//     setSending(true);
//     const socket = getSocket();
//     // Optimistic message
//     const optimistic = {
//       _id: `temp_${Date.now()}`,
//       sender: { _id: user?._id, name: user?.name, avatarUrl: user?.avatarUrl },
//       text: text.trim(),
//       createdAt: new Date().toISOString(),
//       read: false,
//       isOptimistic: true,
//     };
//     setMessages(prev => [...prev, optimistic]);
//     const sentText = text.trim();
//     setText('');
//     // Send via WebSocket (real-time) + REST fallback
//     if (socket?.connected) {
//       socket.emit('send_message', { receiverId: activeUser._id, text: sentText });
//       setSending(false);
//     } else {
//       try {
//         await api.sendMessage(activeUser._id, sentText);
//       } catch (e) { console.error(e); }
//       finally { setSending(false); }
//     }
//     // Clear optimistic after server confirms
//     socket?.emit('stop_typing', { receiverId: activeUser._id });
//   };

//   const handleTextChange = (val: string) => {
//     setText(val);
//     const socket = getSocket();
//     if (!activeUser || !socket) return;
//     socket.emit('typing_start', { receiverId: activeUser._id });
//     if (typingTimeout) clearTimeout(typingTimeout);
//     const t = setTimeout(() => {
//       socket.emit('typing_stop', { receiverId: activeUser._id });
//     }, 1500);
//     setTypingTimeout(t);
//   };

//   const handleSearch = async (q: string) => {
//     setSearchQ(q);
//     if (!q.trim()) { setSearchResults([]); return; }
//     try {
//       const data = await api.searchUsers(q);
//       setSearchResults(data);
//     } catch (e) { console.error(e); }
//   };

//   const isMine = (msg: any) => {
//     const senderId = msg.sender?._id || msg.sender;
//     return senderId === user?._id;
//   };

//   return (
//     <>
//       {/* Floating Button */}
//       {!open && (
//         <button
//           onClick={() => setOpen(true)}
//           className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl z-50 transition-all hover:scale-105"
//           style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))' }}
//         >
//           <MessageSquare className="w-6 h-6 text-white" />
//           {unreadTotal > 0 && (
//             <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center text-[#0c0d12]" style={{ background: 'var(--accent-cyan)' }}>
//               {unreadTotal > 9 ? '9+' : unreadTotal}
//             </span>
//           )}
//         </button>
//       )}

//       {/* Widget Panel */}
//       {open && (
//         <div
//           className="fixed bottom-6 right-6 w-80 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
//           style={{ height: 500, background: 'var(--bg-card)', border: '1px solid var(--border-accent)' }}
//         >
//           {/* Header */}
//           <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
//             {view === 'chat' ? (
//               <div className="flex items-center gap-2">
//                 <button onClick={() => { setView('list'); setActiveUser(null); setMessages([]); }} style={{ color: 'var(--text-muted)' }}>
//                   <ChevronLeft className="w-5 h-5" />
//                 </button>
//                 <Avatar src={activeUser?.avatarUrl} alt={activeUser?.name} size="sm" online={activeUser?.isOnline} />
//                 <div>
//                   <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{activeUser?.name}</p>
//                   <p className="text-xs" style={{ color: activeUser?.isOnline ? 'var(--accent-green)' : 'var(--text-muted)' }}>
//                     {activeUser?.isOnline ? 'Online' : 'Offline'}
//                   </p>
//                 </div>
//               </div>
//             ) : view === 'new' ? (
//               <div className="flex items-center gap-2">
//                 <button onClick={() => { setView('list'); setSearchQ(''); setSearchResults([]); }} style={{ color: 'var(--text-muted)' }}>
//                   <ChevronLeft className="w-5 h-5" />
//                 </button>
//                 <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>New Message</span>
//               </div>
//             ) : (
//               <div className="flex items-center gap-2">
//                 <Avatar src={user?.avatarUrl} alt={user?.name} size="xs" online />
//                 <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Messages</span>
//               </div>
//             )}
//             <div className="flex items-center gap-1">
//               {view === 'list' && (
//                 <button onClick={() => setView('new')} className="p-1.5 rounded-full transition-all" style={{ color: 'var(--text-secondary)' }}>
//                   <Plus className="w-4 h-4" />
//                 </button>
//               )}
//               <button onClick={() => setOpen(false)} className="p-1.5 rounded-full transition-all" style={{ color: 'var(--text-secondary)' }}>
//                 <X className="w-4 h-4" />
//               </button>
//             </div>
//           </div>

//           {/* Conversation List */}
//           {view === 'list' && (
//             <div className="flex-1 overflow-y-auto">
//               {loadingConvs ? (
//                 <div className="flex items-center justify-center h-full">
//                   <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text-muted)' }} />
//                 </div>
//               ) : conversations.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
//                   <MessageSquare className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
//                   <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>No conversations yet. Start chatting!</p>
//                   <button onClick={() => setView('new')} className="px-4 py-2 rounded-full text-xs font-semibold" style={{ background: 'var(--accent-cyan)', color: '#0c0d12' }}>
//                     New Message
//                   </button>
//                 </div>
//               ) : (
//                 conversations.map((conv) => (
//                   <button
//                     key={conv.user?._id}
//                     onClick={() => openChat(conv.user)}
//                     className="w-full flex items-center gap-3 px-4 py-3 transition-all text-left"
//                     style={{ borderBottom: '1px solid var(--border)' }}
//                     onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
//                     onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
//                   >
//                     <Avatar src={conv.user?.avatarUrl} alt={conv.user?.name} size="md" online={conv.user?.isOnline} />
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center justify-between">
//                         <span className="text-sm font-semibold truncate" style={{ color: conv.unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{conv.user?.name}</span>
//                         <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
//                           {conv.lastMessage?.createdAt ? formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false }) : ''}
//                         </span>
//                       </div>
//                       <div className="flex items-center justify-between mt-0.5">
//                         <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{conv.lastMessage?.text}</p>
//                         {conv.unreadCount > 0 && (
//                           <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ml-1 text-[#0c0d12]" style={{ background: 'var(--accent-cyan)' }}>
//                             {conv.unreadCount}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </button>
//                 ))
//               )}
//             </div>
//           )}

//           {/* New Chat Search */}
//           {view === 'new' && (
//             <div className="flex-1 flex flex-col overflow-hidden">
//               <div className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
//                   <input
//                     autoFocus
//                     value={searchQ}
//                     onChange={e => handleSearch(e.target.value)}
//                     placeholder="Search users..."
//                     className="w-full h-8 pl-8 pr-3 rounded-full text-xs outline-none"
//                     style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
//                   />
//                 </div>
//               </div>
//               <div className="flex-1 overflow-y-auto">
//                 {searchResults.map(u => (
//                   <button
//                     key={u._id}
//                     onClick={() => { setSearchQ(''); setSearchResults([]); openChat(u); }}
//                     className="w-full flex items-center gap-3 px-4 py-3 transition-all"
//                     onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
//                     onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
//                   >
//                     <Avatar src={u.avatarUrl} alt={u.name} size="md" online={u.isOnline} />
//                     <div className="text-left">
//                       <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
//                       <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.headline}</p>
//                     </div>
//                   </button>
//                 ))}
//                 {searchQ && searchResults.length === 0 && (
//                   <p className="text-center text-xs mt-8" style={{ color: 'var(--text-muted)' }}>No users found</p>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Chat View */}
//           {view === 'chat' && (
//             <div className="flex-1 flex flex-col overflow-hidden">
//               <div className="flex-1 overflow-y-auto p-4 space-y-3">
//                 {loadingMsgs ? (
//                   <div className="flex justify-center pt-8">
//                     <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text-muted)' }} />
//                   </div>
//                 ) : (
//                   <>
//                     {messages.map(msg => {
//                       const mine = isMine(msg);
//                       return (
//                         <div key={msg._id} className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
//                           {!mine && <Avatar src={activeUser?.avatarUrl} alt={activeUser?.name} size="xs" />}
//                           <div className={`max-w-[75%] flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
//                             <div
//                               className="px-3 py-2 rounded-2xl text-sm"
//                               style={{
//                                 background: mine ? 'var(--accent-cyan)' : 'var(--bg-elevated)',
//                                 color: mine ? '#0c0d12' : 'var(--text-primary)',
//                                 borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
//                                 opacity: msg.isOptimistic ? 0.7 : 1,
//                               }}
//                             >
//                               {msg.text}
//                             </div>
//                             <div className="flex items-center gap-1 mt-0.5">
//                               <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
//                                 {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
//                               </span>
//                               {mine && (msg.read ? <CheckCheck className="w-3 h-3" style={{ color: 'var(--accent-cyan)' }} /> : <Check className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />)}
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                     {typing && (
//                       <div className="flex items-end gap-2">
//                         <Avatar src={activeUser?.avatarUrl} alt={activeUser?.name} size="xs" />
//                         <div className="px-3 py-2 rounded-2xl flex gap-1" style={{ background: 'var(--bg-elevated)' }}>
//                           {[0, 1, 2].map(i => (
//                             <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: `${i * 0.15}s` }} />
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                     <div ref={bottomRef} />
//                   </>
//                 )}
//               </div>
//               <form onSubmit={handleSend} className="p-3 flex gap-2 items-center" style={{ borderTop: '1px solid var(--border)' }}>
//                 <input
//                   value={text}
//                   onChange={e => handleTextChange(e.target.value)}
//                   placeholder="Write a message..."
//                   onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend(e as any))}
//                   className="flex-1 h-9 px-3 rounded-full text-sm outline-none"
//                   style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
//                 />
//                 <button
//                   type="submit"
//                   disabled={!text.trim() || sending}
//                   className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 disabled:opacity-40 transition-all"
//                   style={{ background: 'var(--accent-cyan)', color: '#0c0d12' }}
//                 >
//                   <Send className="w-4 h-4" />
//                 </button>
//               </form>
//             </div>
//           )}
//         </div>
//       )}
//     </>
//   );
// }


import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, X, Search, Send, Loader2,
  Check, CheckCheck, ChevronLeft, Plus, Phone, Video
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { api } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { useAuth } from '../../context/AuthContext';

/* ─── helpers ─────────────────────────────────── */
function fmt(iso: string) {
  try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}
function fmtAgo(iso: string) {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'now';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  } catch { return ''; }
}

/* ─── types ────────────────────────────────────── */
interface Msg { _id: string; sender: any; text: string; createdAt: string; read: boolean; isOptimistic?: boolean; }
interface Conv { user: any; lastMessage: any; unreadCount: number; }

export function MessagingWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'list' | 'chat' | 'new'>('list');

  // conversations list
  const [convs, setConvs] = useState<Conv[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(false);

  // active chat
  const [activeUser, setActiveUser] = useState<any>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const activeUserRef = useRef<any>(null); // stable ref so socket handlers see latest value

  // input
  const msgInputRef = useRef<HTMLInputElement>(null);
  const [sending, setSending] = useState(false);

  // typing
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // new chat search
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // unread badge
  const [unread, setUnread] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);

  /* keep ref in sync */
  useEffect(() => { activeUserRef.current = activeUser; }, [activeUser]);

  /* ── load conversations ── */
  const loadConvs = useCallback(async () => {
    setLoadingConvs(true);
    try {
      const data: Conv[] = await api.getConversations();
      setConvs(data);
      setUnread(data.reduce((s, c) => s + (c.unreadCount || 0), 0));
    } catch (e) { console.error('loadConvs', e); }
    finally { setLoadingConvs(false); }
  }, []);

  useEffect(() => {
    if (open && view === 'list') loadConvs();
  }, [open, view, loadConvs]);

  /* ── socket listeners (mount once) ── */
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    /* incoming message */
    const onNewMsg = (msg: Msg) => {
      const senderId = msg.sender?._id ?? msg.sender;
      const activeId = activeUserRef.current?._id;

      if (activeId && senderId === activeId) {
        // currently chatting with this person — append directly
        setMsgs(prev => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        // mark read immediately
        socket.emit('mark_read', { senderId });
      } else {
        // not in that chat — bump unread + refresh conv list
        setUnread(n => n + 1);
        loadConvs();
      }
    };

    /* confirmation of our own sent message — replace optimistic */
    const onMsgSent = (msg: Msg) => {
      setMsgs(prev => {
        // remove any optimistic placeholder that matches text+time (within 5s)
        const filtered = prev.filter(m => {
          if (!m.isOptimistic) return true;
          const recent = Date.now() - new Date(m.createdAt).getTime() < 5000;
          return !(recent && m.text === msg.text);
        });
        if (filtered.some(m => m._id === msg._id)) return filtered;
        return [...filtered, msg];
      });
    };

    /* typing indicators */
    const onTypingStart = ({ userId }: { userId: string }) => {
      if (userId === activeUserRef.current?._id) setIsTyping(true);
    };
    const onTypingStop = ({ userId }: { userId: string }) => {
      if (userId === activeUserRef.current?._id) setIsTyping(false);
    };

    /* read receipts */
    const onRead = () => setMsgs(prev => prev.map(m => ({ ...m, read: true })));

    socket.on('new_message', onNewMsg);
    socket.on('message_sent', onMsgSent);
    socket.on('user_typing', onTypingStart);
    socket.on('user_stopped_typing', onTypingStop);
    socket.on('messages_read', onRead);

    return () => {
      socket.off('new_message', onNewMsg);
      socket.off('message_sent', onMsgSent);
      socket.off('user_typing', onTypingStart);
      socket.off('user_stopped_typing', onTypingStop);
      socket.off('messages_read', onRead);
    };
  }, [loadConvs]); // stable: only re-runs if loadConvs changes (never)

  /* ── auto-scroll ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, isTyping]);

  /* ── open a chat ── */
  const openChat = useCallback(async (chatUser: any) => {
    setActiveUser(chatUser);
    setView('chat');
    setMsgs([]);
    setIsTyping(false);
    setLoadingMsgs(true);
    try {
      const data: Msg[] = await api.getMessages(chatUser._id);
      setMsgs(data);
      const socket = getSocket();
      socket?.emit('mark_read', { senderId: chatUser._id });
      // update unread count in convs
      setConvs(prev => prev.map(c => c.user?._id === chatUser._id ? { ...c, unreadCount: 0 } : c));
      setUnread(prev => {
        const was = convs.find(c => c.user?._id === chatUser._id)?.unreadCount ?? 0;
        return Math.max(0, prev - was);
      });
    } catch (e) { console.error('openChat', e); }
    finally { setLoadingMsgs(false); }
  }, [convs]);

  /* ── send message ── */
  const handleSend = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = msgInputRef.current?.value.trim();
    if (!text || !activeUser || sending) return;

    // clear input immediately (uncontrolled)
    if (msgInputRef.current) msgInputRef.current.value = '';
    setSending(false); // don't lock UI for ws

    // optimistic bubble
    const optimistic: Msg = {
      _id: `opt_${Date.now()}`,
      sender: { _id: user?._id, name: user?.name, avatarUrl: user?.avatarUrl },
      text,
      createdAt: new Date().toISOString(),
      read: false,
      isOptimistic: true,
    };
    setMsgs(prev => [...prev, optimistic]);

    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('send_message', { receiverId: activeUser._id, text });
    } else {
      // REST fallback when socket disconnected
      try {
        const saved = await api.sendMessage(activeUser._id, text);
        setMsgs(prev => prev.map(m => m._id === optimistic._id ? { ...saved, isOptimistic: false } : m));
      } catch (err) {
        console.error('sendMessage REST', err);
        setMsgs(prev => prev.filter(m => m._id !== optimistic._id));
      }
    }

    // stop typing signal
    stopTypingSignal();
    // refresh conversations list (move to top)
    loadConvs();
  }, [activeUser, user, sending, loadConvs]);

  /* ── typing signals ── */
  const emitTypingStart = () => {
    const socket = getSocket();
    if (!activeUser || !socket) return;
    socket.emit('typing_start', { receiverId: activeUser._id });
  };
  const stopTypingSignal = () => {
    const socket = getSocket();
    if (!activeUser || !socket) return;
    socket.emit('typing_stop', { receiverId: activeUser._id });
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
  };
  const handleInputKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { handleSend(); return; }
    emitTypingStart();
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(stopTypingSignal, 1500);
  };

  /* ── user search ── */
  const handleSearch = useCallback(async (q: string) => {
    setSearchQ(q);
    if (!q.trim()) { setSearchResults([]); return; }
    try { const data = await api.searchUsers(q); setSearchResults(data); }
    catch (e) { console.error(e); }
  }, []);

  /* ── helpers ── */
  const isMine = (msg: Msg) => {
    const sid = msg.sender?._id ?? msg.sender;
    return sid === user?._id;
  };
  const goBack = () => {
    stopTypingSignal();
    setActiveUser(null);
    setMsgs([]);
    setIsTyping(false);
    setView('list');
  };

  /* ════════════════════════════════════════ RENDER ═══ */
  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl z-50 transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))' }}
          aria-label="Open messages"
        >
          <MessageSquare className="w-6 h-6 text-white" />
          {unread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full text-[11px] font-bold flex items-center justify-center"
              style={{ background: 'var(--accent-red)', color: 'white' }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden"
          style={{ width: 340, height: 520, background: 'var(--bg-card)', border: '1px solid var(--border-accent)' }}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-4 h-14 shrink-0"
            style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
            {view === 'chat' && activeUser ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button onClick={goBack} className="p-1 rounded-full shrink-0" style={{ color: 'var(--text-muted)' }}>
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <Avatar src={activeUser.avatarUrl} alt={activeUser.name} size="sm" online={activeUser.isOnline} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{activeUser.name}</p>
                  <p className="text-xs" style={{ color: activeUser.isOnline ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                    {activeUser.isOnline ? '● Online' : 'Offline'}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button className="p-1.5 rounded-full transition-all" style={{ color: 'var(--text-secondary)' }}><Phone className="w-4 h-4" /></button>
                  <button className="p-1.5 rounded-full transition-all" style={{ color: 'var(--text-secondary)' }}><Video className="w-4 h-4" /></button>
                </div>
              </div>
            ) : view === 'new' ? (
              <div className="flex items-center gap-2">
                <button onClick={() => { setView('list'); setSearchQ(''); setSearchResults([]); }} style={{ color: 'var(--text-muted)' }}>
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>New Message</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Avatar src={user?.avatarUrl} alt={user?.name} size="xs" online />
                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Messages</span>
                {unread > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'var(--accent-cyan)', color: '#0c0d12' }}>{unread}</span>
                )}
              </div>
            )}
            <div className="flex items-center gap-1 ml-2 shrink-0">
              {view === 'list' && (
                <button onClick={() => setView('new')} className="p-1.5 rounded-full transition-all" style={{ color: 'var(--text-secondary)' }}>
                  <Plus className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => { setOpen(false); goBack(); }} className="p-1.5 rounded-full transition-all" style={{ color: 'var(--text-secondary)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Conversations list ── */}
          {view === 'list' && (
            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text-muted)' }} />
                </div>
              ) : convs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--bg-elevated)' }}>
                    <MessageSquare className="w-7 h-7" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No conversations yet</p>
                  <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>Start chatting with people in your network</p>
                  <button onClick={() => setView('new')} className="mt-1 px-4 py-2 rounded-full text-xs font-semibold" style={{ background: 'var(--accent-cyan)', color: '#0c0d12' }}>
                    New Message
                  </button>
                </div>
              ) : (
                convs.map(conv => (
                  <button key={conv.user?._id} onClick={() => openChat(conv.user)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Avatar src={conv.user?.avatarUrl} alt={conv.user?.name} size="md" online={conv.user?.isOnline} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-semibold truncate" style={{ color: conv.unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {conv.user?.name}
                        </span>
                        <span className="text-[11px] shrink-0 ml-1" style={{ color: 'var(--text-muted)' }}>
                          {conv.lastMessage?.createdAt ? fmtAgo(conv.lastMessage.createdAt) : ''}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-0.5">
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{conv.lastMessage?.text}</p>
                        {conv.unreadCount > 0 && (
                          <span className="ml-1 shrink-0 min-w-4 h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                            style={{ background: 'var(--accent-cyan)', color: '#0c0d12' }}>
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* ── New chat search ── */}
          {view === 'new' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                  <input
                    autoFocus
                    type="text"
                    value={searchQ}
                    onChange={e => handleSearch(e.target.value)}
                    placeholder="Search users to message..."
                    className="w-full h-9 pl-9 pr-3 rounded-full text-xs outline-none"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-accent)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {searchResults.map(u => (
                  <button key={u._id} onClick={() => { setSearchQ(''); setSearchResults([]); openChat(u); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <Avatar src={u.avatarUrl} alt={u.name} size="md" online={u.isOnline} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                      <p className="text-xs truncate max-w-40" style={{ color: 'var(--text-muted)' }}>{u.headline}</p>
                    </div>
                  </button>
                ))}
                {searchQ && searchResults.length === 0 && (
                  <p className="text-center text-xs mt-10" style={{ color: 'var(--text-muted)' }}>No users found for "{searchQ}"</p>
                )}
                {!searchQ && (
                  <p className="text-center text-xs mt-10" style={{ color: 'var(--text-muted)' }}>Type a name or email to search</p>
                )}
              </div>
            </div>
          )}

          {/* ── Chat view ── */}
          {view === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {loadingMsgs ? (
                  <div className="flex justify-center pt-10">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text-muted)' }} />
                  </div>
                ) : (
                  <>
                    {msgs.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-32 gap-2">
                        <Avatar src={activeUser?.avatarUrl} alt={activeUser?.name} size="lg" />
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{activeUser?.name}</p>
                        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>Say hello 👋</p>
                      </div>
                    )}
                    {msgs.map((msg) => {
                      const mine = isMine(msg);
                      return (
                        <div key={msg._id} className={`flex items-end gap-1.5 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!mine && <Avatar src={activeUser?.avatarUrl} alt={activeUser?.name} size="xs" />}
                          <div className={`flex flex-col max-w-[78%] ${mine ? 'items-end' : 'items-start'}`}>
                            <div
                              className="px-3 py-2 text-sm break-words"
                              style={{
                                background: mine ? 'var(--accent-cyan)' : 'var(--bg-elevated)',
                                color: mine ? '#0c0d12' : 'var(--text-primary)',
                                borderRadius: mine ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                                opacity: msg.isOptimistic ? 0.65 : 1,
                                transition: 'opacity 0.2s',
                              }}
                            >
                              {msg.text}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5 px-0.5">
                              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                {msg.createdAt ? fmt(msg.createdAt) : ''}
                              </span>
                              {mine && !msg.isOptimistic && (
                                msg.read
                                  ? <CheckCheck className="w-3 h-3" style={{ color: 'var(--accent-cyan)' }} />
                                  : <Check className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                              )}
                              {mine && msg.isOptimistic && (
                                <Loader2 className="w-2.5 h-2.5 animate-spin" style={{ color: 'var(--text-muted)' }} />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Typing indicator */}
                    {isTyping && (
                      <div className="flex items-end gap-1.5">
                        <Avatar src={activeUser?.avatarUrl} alt={activeUser?.name} size="xs" />
                        <div className="flex gap-1 px-3 py-2.5 rounded-2xl" style={{ background: 'var(--bg-elevated)' }}>
                          {[0, 1, 2].map(i => (
                            <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                              style={{ background: 'var(--text-muted)', animationDelay: `${i * 0.18}s` }} />
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="px-3 py-3 flex items-center gap-2 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
                <input
                  ref={msgInputRef}
                  type="text"
                  placeholder="Write a message..."
                  defaultValue=""
                  onKeyDown={handleInputKeydown}
                  className="flex-1 h-9 px-3 rounded-full text-sm outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
                <button
                  onClick={() => handleSend()}
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'var(--accent-cyan)', color: '#0c0d12' }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}