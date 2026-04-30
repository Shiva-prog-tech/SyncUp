const express = require('express');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/users  -- discover people
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('name headline avatarUrl isOnline connections location')
      .limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('connections', 'name headline avatarUrl isOnline');
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Track profile view
    if (req.params.id !== req.user._id.toString()) {
      await User.findByIdAndUpdate(req.params.id, { $inc: { profileViews: 1 } });
      await Notification.create({
        recipient: req.params.id,
        sender: req.user._id,
        type: 'profile_view',
        content: `${req.user.name} viewed your profile`,
      });
    }
    res.json(user.toPublicJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users/:id/connect  -- send/accept connection request
router.post('/:id/connect', auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });
    const myId = req.user._id.toString();
    const targetId = req.params.id;
    const alreadyConnected = req.user.connections.map(c => c.toString()).includes(targetId);
    if (alreadyConnected) return res.status(400).json({ message: 'Already connected' });
    // Add connection both ways
    await User.findByIdAndUpdate(myId, { $addToSet: { connections: targetId } });
    await User.findByIdAndUpdate(targetId, { $addToSet: { connections: myId } });
    const notif = await Notification.create({
      recipient: targetId,
      sender: myId,
      type: 'connection_request',
      content: `${req.user.name} connected with you`,
    });
    const populated = await notif.populate('sender', 'name avatarUrl');
    if (global.io) {
      const socketId = global.onlineUsers?.get(targetId);
      if (socketId) global.io.to(socketId).emit('new_notification', populated);
    }
    res.json({ message: 'Connected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
