const Thread = require('../models/Thread');
const Post = require('../models/Post');
const { sanitizeObject } = require('../utils/validators');

// @desc    Get all threads with pagination and filters
// @route   GET /api/threads
// @access  Public
const getThreads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { category, type, status, search, sortBy = 'lastActivity' } = req.query;

    // Build filter object
    const filter = { status: { $ne: 'deleted' } };
    
    if (category) {
      filter.category = category;
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sortOptions = {};
    switch (sortBy) {
      case 'createdAt':
        sortOptions.createdAt = -1;
        break;
      case 'postsCount':
        sortOptions.postsCount = -1;
        break;
      case 'views':
        sortOptions.views = -1;
        break;
      default:
        sortOptions.lastActivity = -1;
    }

    const threads = await Thread.find(filter)
      .populate('author', 'username firstName lastName avatar reputation')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await Thread.countDocuments(filter);

    res.json({
      success: true,
      data: {
        threads,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get thread by ID
// @route   GET /api/threads/:id
// @access  Public
const getThreadById = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
      .populate('author', 'username firstName lastName avatar reputation')
      .populate('moderators', 'username firstName lastName');

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    if (thread.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    // Check if user can access private thread
    if (thread.isPrivate && req.user) {
      if (!thread.canUserAccess(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to private thread'
        });
      }
    }

    // Increment view count
    await thread.incrementViews();

    res.json({
      success: true,
      data: { thread }
    });
  } catch (error) {
    console.error('Get thread by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new thread
// @route   POST /api/threads
// @access  Private
const createThread = async (req, res) => {
  try {
    const { title, description, category, type, tags, isPrivate, allowedUsers } = req.body;

    // Sanitize input
    const sanitizedData = sanitizeObject({
      title,
      description,
      category,
      type,
      tags,
      isPrivate,
      allowedUsers
    });

    const thread = await Thread.create({
      ...sanitizedData,
      author: req.user._id
    });

    const populatedThread = await Thread.findById(thread._id)
      .populate('author', 'username firstName lastName avatar reputation');

    res.status(201).json({
      success: true,
      message: 'Thread created successfully',
      data: { thread: populatedThread }
    });
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during thread creation'
    });
  }
};

// @desc    Update thread
// @route   PUT /api/threads/:id
// @access  Private
const updateThread = async (req, res) => {
  try {
    const { title, description, category, tags, status } = req.body;

    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    // Check if user is author or moderator
    const isAuthor = thread.author.toString() === req.user._id.toString();
    const isModerator = thread.moderators.includes(req.user._id);

    if (!isAuthor && !isModerator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this thread'
      });
    }

    // Sanitize input
    const sanitizedData = sanitizeObject({
      title,
      description,
      category,
      tags,
      status
    });

    const updatedThread = await Thread.findByIdAndUpdate(
      req.params.id,
      sanitizedData,
      { new: true, runValidators: true }
    ).populate('author', 'username firstName lastName avatar reputation');

    res.json({
      success: true,
      message: 'Thread updated successfully',
      data: { thread: updatedThread }
    });
  } catch (error) {
    console.error('Update thread error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during thread update'
    });
  }
};

// @desc    Delete thread
// @route   DELETE /api/threads/:id
// @access  Private
const deleteThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    // Check if user is author or moderator
    const isAuthor = thread.author.toString() === req.user._id.toString();
    const isModerator = thread.moderators.includes(req.user._id);

    if (!isAuthor && !isModerator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this thread'
      });
    }

    // Soft delete - mark as deleted
    thread.status = 'deleted';
    await thread.save();

    res.json({
      success: true,
      message: 'Thread deleted successfully'
    });
  } catch (error) {
    console.error('Delete thread error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during thread deletion'
    });
  }
};

// @desc    Get threads by category
// @route   GET /api/threads/category/:category
// @access  Public
const getThreadsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const threads = await Thread.find({
      category,
      status: { $ne: 'deleted' }
    })
      .populate('author', 'username firstName lastName avatar reputation')
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Thread.countDocuments({
      category,
      status: { $ne: 'deleted' }
    });

    res.json({
      success: true,
      data: {
        threads,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get threads by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get featured threads
// @route   GET /api/threads/featured
// @access  Public
const getFeaturedThreads = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const threads = await Thread.find({
      isFeatured: true,
      status: { $ne: 'deleted' }
    })
      .populate('author', 'username firstName lastName avatar reputation')
      .sort({ featuredAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: { threads }
    });
  } catch (error) {
    console.error('Get featured threads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Search threads
// @route   GET /api/threads/search
// @access  Public
const searchThreads = async (req, res) => {
  try {
    const { q, category, type } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { status: { $ne: 'deleted' } };

    if (q) {
      filter.$text = { $search: q };
    }

    if (category) {
      filter.category = category;
    }

    if (type) {
      filter.type = type;
    }

    const threads = await Thread.find(filter)
      .populate('author', 'username firstName lastName avatar reputation')
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Thread.countDocuments(filter);

    res.json({
      success: true,
      data: {
        threads,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Search threads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getThreads,
  getThreadById,
  createThread,
  updateThread,
  deleteThread,
  getThreadsByCategory,
  getFeaturedThreads,
  searchThreads
}; 