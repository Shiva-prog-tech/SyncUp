const express = require('express');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/posts  -- feed
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const posts = await Post.find({ visibility: 'public' })
      .populate('author', 'name headline avatarUrl isOnline')
      .populate('comments.author', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({ posts, page, hasMore: posts.length === limit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts  -- create post
router.post('/', auth, async (req, res) => {
  try {
    const { content, imageUrl, tags, visibility } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ message: 'Content is required' });
    const post = await Post.create({
      author: req.user._id,
      content: content.trim(),
      imageUrl: imageUrl || '',
      tags: tags || [],
      visibility: visibility || 'public',
    });
    const populated = await Post.findById(post._id)
      .populate('author', 'name headline avatarUrl isOnline');
    // Emit to all connected sockets via global io
    if (global.io) {
      global.io.emit('new_post', populated);
    }
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/posts/:id/like  -- toggle like
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const userId = req.user._id.toString();
    const liked = post.likes.map(l => l.toString()).includes(userId);
    if (liked) {
      post.likes = post.likes.filter(l => l.toString() !== userId);
    } else {
      post.likes.push(req.user._id);
      // Create notification if not own post
      if (post.author.toString() !== userId) {
        const notif = await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: 'like',
          content: `${req.user.name} liked your post`,
          postId: post._id,
        });
        const populatedNotif = await notif.populate('sender', 'name avatarUrl');
        if (global.io) {
          const recipientSocketId = global.onlineUsers?.get(post.author.toString());
          if (recipientSocketId) global.io.to(recipientSocketId).emit('new_notification', populatedNotif);
        }
      }
    }
    await post.save();
    const updated = await Post.findById(post._id).populate('author', 'name headline avatarUrl isOnline');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts/:id/comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ message: 'Comment content required' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.comments.push({ author: req.user._id, content: content.trim() });
    await post.save();
    const updated = await Post.findById(post._id)
      .populate('author', 'name headline avatarUrl isOnline')
      .populate('comments.author', 'name avatarUrl');
    if (global.io) global.io.emit('post_updated', updated);
    // Notify post author
    if (post.author.toString() !== req.user._id.toString()) {
      const notif = await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        content: `${req.user.name} commented on your post`,
        postId: post._id,
      });
      const populatedNotif = await notif.populate('sender', 'name avatarUrl');
      if (global.io) {
        const recipientSocketId = global.onlineUsers?.get(post.author.toString());
        if (recipientSocketId) global.io.to(recipientSocketId).emit('new_notification', populatedNotif);
      }
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/posts/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    await post.deleteOne();
    if (global.io) global.io.emit('post_deleted', req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
