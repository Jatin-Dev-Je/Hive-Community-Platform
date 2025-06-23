const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');
const jwtBlacklist = require('../utils/jwtBlacklist');
const { sanitizeObject } = require('../utils/validators');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName
    });

    if (user) {
      const token = generateToken(user._id);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            createdAt: user.createdAt
          },
          token
        }
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user (email only)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email?.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last seen
    await user.updateLastSeen();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          lastSeen: user.lastSeen,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio,
          avatar: user.avatar,
          goals: user.goals,
          interests: user.interests,
          expertise: user.expertise,
          reputation: user.reputation,
          postsCount: user.postsCount,
          repliesCount: user.repliesCount,
          milestonesCount: user.milestonesCount,
          isMentor: user.isMentor,
          isSeekingMentor: user.isSeekingMentor,
          mentorInterests: user.mentorInterests,
          isVerified: user.isVerified,
          lastSeen: user.lastSeen,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio, goals, interests, expertise, isMentor, isSeekingMentor, mentorInterests } = req.body;

    // Sanitize input
    const sanitizedData = sanitizeObject({
      firstName,
      lastName,
      bio,
      goals,
      interests,
      expertise,
      isMentor,
      isSeekingMentor,
      mentorInterests
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      sanitizedData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio,
          avatar: user.avatar,
          goals: user.goals,
          interests: user.interests,
          expertise: user.expertise,
          reputation: user.reputation,
          isMentor: user.isMentor,
          isSeekingMentor: user.isSeekingMentor,
          mentorInterests: user.mentorInterests,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Get token from headers
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      // Add token to blacklist
      await jwtBlacklist.addToBlacklist(token);
    }

    // Update last seen before logout
    await req.user.updateLastSeen();

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// @desc    Refresh JWT token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }
    // TODO: Validate refresh token (implement your logic)
    // For demo: just issue a new token
    const payload = {}; // decode and validate refreshToken here
    // Example: const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    // const user = await User.findById(payload.id);
    // if (!user) throw new Error('User not found');
    // const newToken = generateToken(user._id);
    // For now, just return a dummy token
    return res.json({ success: true, token: 'NEW_JWT_TOKEN' });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

// @desc    Initiate password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    // Generate reset token (for demo, use a dummy string)
    const resetToken = 'RESET_TOKEN'; // TODO: generate secure token
    // TODO: Save token to user or a password reset collection, with expiry
    // TODO: Send email with reset link (placeholder)
    // e.g., sendEmail(user.email, `Reset link: /reset-password/${resetToken}`)
    return res.json({ success: true, message: 'Password reset link sent (demo)', resetToken });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during forgot password' });
  }
};

// @desc    Complete password reset
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ success: false, message: 'Token and new password required' });
    // TODO: Validate token, find user, check expiry
    // For demo, just accept any token
    // const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
    // if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    // user.password = newPassword;
    // user.resetToken = undefined;
    // user.resetTokenExpiry = undefined;
    // await user.save();
    return res.json({ success: true, message: 'Password reset successful (demo)' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during password reset' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword
}; 