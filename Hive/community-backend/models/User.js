const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // username: {
  //   type: String,
  //   unique: true,
  //   trim: true,
  //   minlength: [3, 'Username must be at least 3 characters'],
  //   maxlength: [30, 'Username cannot exceed 30 characters']
  // },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  // Community platform specific fields
  goals: [{
    type: String,
    trim: true
  }],
  interests: [{
    type: String,
    trim: true
  }],
  expertise: [{
    type: String,
    trim: true
  }],
  // Mentorship preferences
  isMentor: {
    type: Boolean,
    default: true
  },
  isSeekingMentor: {
    type: Boolean,
    default: false
  },
  mentorInterests: [{
    type: String,
    trim: true
  }],
  // Community stats
  reputation: {
    type: Number,
    default: 0
  },
  postsCount: {
    type: Number,
    default: 0
  },
  repliesCount: {
    type: Number,
    default: 0
  },
  milestonesCount: {
    type: Number,
    default: 0
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  refreshTokens: [{
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Index for search functionality
userSchema.index({ firstName: 'text', lastName: 'text', bio: 'text' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Update last seen
userSchema.methods.updateLastSeen = function() {
  this.lastSeen = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema); 