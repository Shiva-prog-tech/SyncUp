// import { io, Socket } from 'socket.io-client';

// const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// let socket: Socket | null = null;

// export function connectSocket(token: string): Socket {
//   if (socket?.connected) return socket;

//   socket = io(SOCKET_URL, {
//     auth: { token },
//     transports: ['websocket', 'polling'],
//     reconnection: true,
//     reconnectionAttempts: 5,
//     reconnectionDelay: 1000,
//   });

//   socket.on('connect', () => {
//     console.log('🔌 Socket connected:', socket?.id);
//     socket?.emit('get_online_users');
//   });

//   socket.on('connect_error', (err) => {
//     console.warn('Socket connect error:', err.message);
//   });

//   socket.on('disconnect', (reason) => {
//     console.log('Socket disconnected:', reason);
//   });

//   return socket;
// }

// export function getSocket(): Socket | null {
//   return socket;
// }

// export function disconnectSocket() {
//   if (socket) {
//     socket.disconnect();
//     socket = null;
//   }
// }

// export { socket };


import { io, Socket } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL as string) || 'http://localhost:5000';

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  // If already connected with same token, return existing
  if (socket?.connected) return socket;

  // Disconnect stale socket if any
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 10000,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket?.id);
    socket?.emit('get_online_users');
  });

  socket.on('connect_error', (err) => {
    console.warn('⚠️  Socket connect error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔴 Socket disconnected:', reason);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}