const User = require('../models/User');
const { sanitizeObject } = require('../utils/validators');

// @desc    Get all users (with pagination and filters)
// @route   GET /api/users
// @access  Public
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, category, isMentor, isSeekingMentor, expertise } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    if (isMentor === 'true') {
      filter.isMentor = true;
    }
    
    if (isSeekingMentor === 'true') {
      filter.isSeekingMentor = true;
    }
    
    if (expertise) {
      filter.expertise = { $in: [expertise] };
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ reputation: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('postsCount repliesCount milestonesCount');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
const searchUsers = async (req, res) => {
  try {
    const { q, expertise, goals, interests } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    if (q) {
      filter.$text = { $search: q };
    }

    if (expertise) {
      filter.expertise = { $in: [expertise] };
    }

    if (goals) {
      filter.goals = { $in: [goals] };
    }

    if (interests) {
      filter.interests = { $in: [interests] };
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ reputation: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get mentors
// @route   GET /api/users/mentors
// @access  Public
const getMentors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { expertise, interests } = req.query;

    const filter = { 
      isActive: true, 
      isMentor: true 
    };

    if (expertise) {
      filter.expertise = { $in: [expertise] };
    }

    if (interests) {
      filter.mentorInterests = { $in: [interests] };
    }

    const mentors = await User.find(filter)
      .select('-password')
      .sort({ reputation: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        mentors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get users seeking mentorship
// @route   GET /api/users/mentees
// @access  Public
const getMentees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { goals, interests } = req.query;

    const filter = { 
      isActive: true, 
      isSeekingMentor: true 
    };

    if (goals) {
      filter.goals = { $in: [goals] };
    }

    if (interests) {
      filter.interests = { $in: [interests] };
    }

    const mentees = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        mentees,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get mentees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user reputation
// @route   PUT /api/users/:id/reputation
// @access  Private
const updateReputation = async (req, res) => {
  try {
    const { action } = req.body; // 'upvote', 'downvote', 'milestone', 'helpful'
    const points = {
      upvote: 1,
      downvote: -1,
      milestone: 5,
      helpful: 3
    };

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.reputation += points[action] || 0;
    await user.save();

    res.json({
      success: true,
      message: 'Reputation updated successfully',
      data: {
        reputation: user.reputation
      }
    });
  } catch (error) {
    console.error('Update reputation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Public
const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('postsCount repliesCount milestonesCount reputation createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate additional stats
    const daysSinceJoined = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));
    const avgReputationPerDay = daysSinceJoined > 0 ? (user.reputation / daysSinceJoined).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        stats: {
          postsCount: user.postsCount,
          repliesCount: user.repliesCount,
          milestonesCount: user.milestonesCount,
          reputation: user.reputation,
          daysSinceJoined,
          avgReputationPerDay: parseFloat(avgReputationPerDay)
        }
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  searchUsers,
  getMentors,
  getMentees,
  updateReputation,
  getUserStats
}; 