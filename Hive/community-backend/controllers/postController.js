const Post = require('../models/Post');
const Thread = require('../models/Thread');
const { sanitizeObject } = require('../utils/validators');

// @desc    Get all posts in a thread
// @route   GET /api/posts/thread/:threadId
// @access  Public
const getPostsByThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ thread: threadId, status: 'active' })
      .populate('author', 'username firstName lastName avatar reputation')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ thread: threadId, status: 'active' });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get posts by thread error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username firstName lastName avatar reputation');

    if (!post || post.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    await post.incrementViews();

    res.json({ success: true, data: { post } });
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { thread, content, type, milestone, mentorshipRequest, tags } = req.body;

    // Sanitize input
    const sanitizedData = sanitizeObject({
      thread,
      content,
      type,
      milestone,
      mentorshipRequest,
      tags
    });

    const post = await Post.create({
      ...sanitizedData,
      author: req.user._id
    });

    // Update thread's last activity
    await Thread.findByIdAndUpdate(thread, { lastActivity: new Date() });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username firstName lastName avatar reputation');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post: populatedPost }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, message: 'Server error during post creation' });
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
  try {
    const { content, milestone, mentorshipRequest, tags, status } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post || post.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this post' });
    }
    // Sanitize input
    const sanitizedData = sanitizeObject({ content, milestone, mentorshipRequest, tags, status });
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      sanitizedData,
      { new: true, runValidators: true }
    ).populate('author', 'username firstName lastName avatar reputation');
    res.json({ success: true, message: 'Post updated successfully', data: { post: updatedPost } });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ success: false, message: 'Server error during post update' });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }
    post.status = 'deleted';
    await post.save();
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ success: false, message: 'Server error during post deletion' });
  }
};

// @desc    Like or unlike a post
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    await post.toggleLike(req.user._id);
    res.json({ success: true, message: 'Like toggled', data: { likeCount: post.likes.length } });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Dislike or undislike a post
// @route   POST /api/posts/:id/dislike
// @access  Private
const dislikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    await post.toggleDislike(req.user._id);
    res.json({ success: true, message: 'Dislike toggled', data: { dislikeCount: post.dislikes.length } });
  } catch (error) {
    console.error('Dislike post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Mark post as accepted answer (Q&A)
// @route   POST /api/posts/:id/accept
// @access  Private
const acceptAnswer = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.status !== 'active' || post.type !== 'answer') {
      return res.status(404).json({ success: false, message: 'Answer post not found' });
    }
    // Only thread author can accept answer
    const thread = await Thread.findById(post.thread);
    if (thread.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to accept answer' });
    }
    await post.acceptAsAnswer();
    res.json({ success: true, message: 'Answer accepted' });
  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getPostsByThread,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  dislikePost,
  acceptAnswer
}; 