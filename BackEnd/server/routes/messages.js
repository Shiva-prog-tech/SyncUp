const express = require('express');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/messages/conversations  -- list all conversations for current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    // Find latest message per conversation
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    }).sort({ createdAt: -1 });

    const convMap = new Map();
    for (const msg of messages) {
      const otherId = msg.sender.toString() === userId ? msg.receiver.toString() : msg.sender.toString();
      if (!convMap.has(otherId)) convMap.set(otherId, msg);
    }

    const conversations = [];
    for (const [otherId, lastMsg] of convMap.entries()) {
      const otherUser = await User.findById(otherId).select('name headline avatarUrl isOnline lastSeen');
      const unread = await Message.countDocuments({ sender: otherId, receiver: req.user._id, read: false });
      conversations.push({ user: otherUser, lastMessage: lastMsg, unreadCount: unread });
    }
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/messages/:userId  -- get messages with a specific user
router.get('/:userId', auth, async (req, res) => {
  try {
    const conversationId = Message.getConversationId(req.user._id, req.params.userId);
    const messages = await Message.find({ conversationId })
      .populate('sender', 'name avatarUrl')
      .sort({ createdAt: 1 });
    // Mark as read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, read: false },
      { read: true }
    );
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/messages/:userId  -- send a message (REST fallback)
router.post('/:userId', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Message text required' });
    const receiver = await User.findById(req.params.userId);
    if (!receiver) return res.status(404).json({ message: 'Recipient not found' });
    const conversationId = Message.getConversationId(req.user._id, req.params.userId);
    const message = await Message.create({
      sender: req.user._id,
      receiver: req.params.userId,
      text: text.trim(),
      conversationId,
    });
    const populated = await Message.findById(message._id).populate('sender', 'name avatarUrl');
    // Emit via socket
    if (global.io) {
      const receiverSocketId = global.onlineUsers?.get(req.params.userId);
      if (receiverSocketId) global.io.to(receiverSocketId).emit('new_message', populated);
    }
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/messages/users/search?q=  -- search users to start a chat
router.get('/users/search', auth, async (req, res) => {
  try {
    const q = req.query.q || '';
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { headline: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ]
    }).select('name headline avatarUrl isOnline email').limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
