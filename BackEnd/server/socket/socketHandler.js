// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const Message = require('../models/Message');
// const Notification = require('../models/Notification');

// // Map: userId -> socketId
// const onlineUsers = new Map();

// function setupSocket(io) {
//   global.io = io;
//   global.onlineUsers = onlineUsers;

//   // Authenticate socket connection
//   io.use(async (socket, next) => {
//     try {
//       const token = socket.handshake.auth.token;
//       if (!token) return next(new Error('Authentication error: no token'));
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(decoded.id).select('-password');
//       if (!user) return next(new Error('Authentication error: user not found'));
//       socket.user = user;
//       next();
//     } catch (err) {
//       next(new Error('Authentication error: invalid token'));
//     }
//   });

//   io.on('connection', async (socket) => {
//     const userId = socket.user._id.toString();
//     onlineUsers.set(userId, socket.id);

//     // Mark user online
//     await User.findByIdAndUpdate(userId, { isOnline: true });

//     // Broadcast online status to all
//     io.emit('user_online', { userId, isOnline: true });

//     console.log(`User connected: ${socket.user.name} (${userId})`);

//     // Join a personal room for direct notifications
//     socket.join(`user:${userId}`);

//     // ── SEND MESSAGE ──
//     socket.on('send_message', async (data) => {
//       try {
//         const { receiverId, text } = data;
//         if (!text || !text.trim() || !receiverId) return;

//         const conversationId = Message.getConversationId(userId, receiverId);
//         const message = await Message.create({
//           sender: userId,
//           receiver: receiverId,
//           text: text.trim(),
//           conversationId,
//         });
//         const populated = await Message.findById(message._id)
//           .populate('sender', 'name avatarUrl');

//         // Send to receiver if online
//         const receiverSocketId = onlineUsers.get(receiverId);
//         if (receiverSocketId) {
//           io.to(receiverSocketId).emit('new_message', populated);
//         }
//         // Also send back to sender for confirmation
//         socket.emit('message_sent', populated);

//         // Create notification if receiver is different
//         const notif = await Notification.create({
//           recipient: receiverId,
//           sender: userId,
//           type: 'message',
//           content: `${socket.user.name} sent you a message`,
//         });
//         if (receiverSocketId) {
//           const populatedNotif = await notif.populate('sender', 'name avatarUrl');
//           io.to(receiverSocketId).emit('new_notification', populatedNotif);
//         }
//       } catch (err) {
//         socket.emit('error', { message: 'Failed to send message' });
//       }
//     });

//     // ── TYPING INDICATORS ──
//     socket.on('typing_start', ({ receiverId }) => {
//       const receiverSocketId = onlineUsers.get(receiverId);
//       if (receiverSocketId) {
//         io.to(receiverSocketId).emit('user_typing', { userId, name: socket.user.name });
//       }
//     });

//     socket.on('typing_stop', ({ receiverId }) => {
//       const receiverSocketId = onlineUsers.get(receiverId);
//       if (receiverSocketId) {
//         io.to(receiverSocketId).emit('user_stopped_typing', { userId });
//       }
//     });

//     // ── MARK MESSAGES READ ──
//     socket.on('mark_read', async ({ senderId }) => {
//       await Message.updateMany(
//         { sender: senderId, receiver: userId, read: false },
//         { read: true }
//       );
//       const senderSocketId = onlineUsers.get(senderId);
//       if (senderSocketId) {
//         io.to(senderSocketId).emit('messages_read', { by: userId });
//       }
//     });

//     // ── GET ONLINE STATUS ──
//     socket.on('get_online_users', () => {
//       const onlineList = Array.from(onlineUsers.keys());
//       socket.emit('online_users', onlineList);
//     });

//     // ── DISCONNECT ──
//     socket.on('disconnect', async () => {
//       onlineUsers.delete(userId);
//       await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
//       io.emit('user_online', { userId, isOnline: false });
//       console.log(`User disconnected: ${socket.user.name}`);
//     });
//   });
// }

// module.exports = { setupSocket, onlineUsers };


const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

// userId  ->  socketId
const onlineUsers = new Map();

function setupSocket(io) {
  global.io = io;
  global.onlineUsers = onlineUsers;

  /* ── Auth middleware ── */
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();

    // If user reconnects remove old entry
    onlineUsers.set(userId, socket.id);

    await User.findByIdAndUpdate(userId, { isOnline: true });
    io.emit('user_online', { userId, isOnline: true });

    console.log(`✅  Connected: ${socket.user.name} (${socket.id})`);

    /* ── Send message ── */
    socket.on('send_message', async ({ receiverId, text }) => {
      if (!text?.trim() || !receiverId) return;
      try {
        const conversationId = Message.getConversationId(userId, receiverId);
        const message = await Message.create({
          sender: userId,
          receiver: receiverId,
          text: text.trim(),
          conversationId,
        });
        const populated = await Message.findById(message._id)
          .populate('sender', 'name avatarUrl');

        // Send to receiver
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new_message', populated);
        }

        // Confirm to sender
        socket.emit('message_sent', populated);

        // Notification (don't await — non-blocking)
        Notification.create({
          recipient: receiverId,
          sender: userId,
          type: 'message',
          content: `${socket.user.name} sent you a message`,
        }).then(async (notif) => {
          const pop = await notif.populate('sender', 'name avatarUrl');
          if (receiverSocketId) io.to(receiverSocketId).emit('new_notification', pop);
        }).catch(() => {});

      } catch (err) {
        console.error('send_message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    /* ── Typing indicators ── */
    socket.on('typing_start', ({ receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', { userId });
      }
    });

    socket.on('typing_stop', ({ receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_stopped_typing', { userId });
      }
    });

    /* ── Mark messages read ── */
    socket.on('mark_read', async ({ senderId }) => {
      try {
        await Message.updateMany(
          { sender: senderId, receiver: userId, read: false },
          { read: true }
        );
        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messages_read', { by: userId });
        }
      } catch (err) {
        console.error('mark_read error:', err);
      }
    });

    /* ── Online users list ── */
    socket.on('get_online_users', () => {
      socket.emit('online_users', Array.from(onlineUsers.keys()));
    });

    /* ── Disconnect ── */
    socket.on('disconnect', async () => {
      // Only remove if this socket is still the current one for this user
      if (onlineUsers.get(userId) === socket.id) {
        onlineUsers.delete(userId);
        await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
        io.emit('user_online', { userId, isOnline: false });
      }
      console.log(`🔴  Disconnected: ${socket.user.name}`);
    });
  });
}

module.exports = { setupSocket, onlineUsers };