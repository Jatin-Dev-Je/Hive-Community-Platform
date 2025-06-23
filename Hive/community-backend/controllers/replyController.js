const Reply = require('../models/Reply');
const Post = require('../models/Post');
const { sanitizeObject } = require('../utils/validators');

// @desc    Get all replies for a post
// @route   GET /api/replies/post/:postId
// @access  Public
const getRepliesByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const replies = await Reply.find({ post: postId, status: 'active' })
      .populate('author', 'username firstName lastName avatar reputation')
      .populate('parentReply')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Reply.countDocuments({ post: postId, status: 'active' });

    res.json({
      success: true,
      data: {
        replies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get replies by post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get reply by ID
// @route   GET /api/replies/:id
// @access  Public
const getReplyById = async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.id)
      .populate('author', 'username firstName lastName avatar reputation')
      .populate('parentReply');
    if (!reply || reply.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }
    res.json({ success: true, data: { reply } });
  } catch (error) {
    console.error('Get reply by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create a new reply
// @route   POST /api/replies
// @access  Private
const createReply = async (req, res) => {
  try {
    const { post, content, parentReply, type, attachments } = req.body;
    // Sanitize input
    const sanitizedData = sanitizeObject({ post, content, parentReply, type, attachments });
    const reply = await Reply.create({
      ...sanitizedData,
      author: req.user._id
    });
    // Update post's reply count
    await Post.findByIdAndUpdate(post, { $inc: { repliesCount: 1 } });
    const populatedReply = await Reply.findById(reply._id)
      .populate('author', 'username firstName lastName avatar reputation')
      .populate('parentReply');
    res.status(201).json({ success: true, message: 'Reply created successfully', data: { reply: populatedReply } });
  } catch (error) {
    console.error('Create reply error:', error);
    res.status(500).json({ success: false, message: 'Server error during reply creation' });
  }
};

// @desc    Update a reply
// @route   PUT /api/replies/:id
// @access  Private
const updateReply = async (req, res) => {
  try {
    const { content, attachments, status } = req.body;
    const reply = await Reply.findById(req.params.id);
    if (!reply || reply.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }
    if (reply.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this reply' });
    }
    // Sanitize input
    const sanitizedData = sanitizeObject({ content, attachments, status });
    const updatedReply = await Reply.findByIdAndUpdate(
      req.params.id,
      sanitizedData,
      { new: true, runValidators: true }
    ).populate('author', 'username firstName lastName avatar reputation')
     .populate('parentReply');
    res.json({ success: true, message: 'Reply updated successfully', data: { reply: updatedReply } });
  } catch (error) {
    console.error('Update reply error:', error);
    res.status(500).json({ success: false, message: 'Server error during reply update' });
  }
};

// @desc    Delete a reply
// @route   DELETE /api/replies/:id
// @access  Private
const deleteReply = async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.id);
    if (!reply || reply.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }
    if (reply.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this reply' });
    }
    reply.status = 'deleted';
    await reply.save();
    // Update post's reply count
    await Post.findByIdAndUpdate(reply.post, { $inc: { repliesCount: -1 } });
    res.json({ success: true, message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Delete reply error:', error);
    res.status(500).json({ success: false, message: 'Server error during reply deletion' });
  }
};

// @desc    Like or unlike a reply
// @route   POST /api/replies/:id/like
// @access  Private
const likeReply = async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.id);
    if (!reply || reply.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }
    await reply.toggleLike(req.user._id);
    res.json({ success: true, message: 'Like toggled', data: { likeCount: reply.likes.length } });
  } catch (error) {
    console.error('Like reply error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Dislike or undislike a reply
// @route   POST /api/replies/:id/dislike
// @access  Private
const dislikeReply = async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.id);
    if (!reply || reply.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }
    await reply.toggleDislike(req.user._id);
    res.json({ success: true, message: 'Dislike toggled', data: { dislikeCount: reply.dislikes.length } });
  } catch (error) {
    console.error('Dislike reply error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Mark reply as helpful
// @route   POST /api/replies/:id/helpful
// @access  Private
const markHelpful = async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.id);
    if (!reply || reply.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }
    await reply.markAsHelpful();
    res.json({ success: true, message: 'Reply marked as helpful', data: { helpfulCount: reply.helpfulCount } });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Unmark reply as helpful
// @route   POST /api/replies/:id/unhelpful
// @access  Private
const unmarkHelpful = async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.id);
    if (!reply || reply.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }
    await reply.unmarkAsHelpful();
    res.json({ success: true, message: 'Reply unmarked as helpful', data: { helpfulCount: reply.helpfulCount } });
  } catch (error) {
    console.error('Unmark helpful error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getRepliesByPost,
  getReplyById,
  createReply,
  updateReply,
  deleteReply,
  likeReply,
  dislikeReply,
  markHelpful,
  unmarkHelpful
}; 