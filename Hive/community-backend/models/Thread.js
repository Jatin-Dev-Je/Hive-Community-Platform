const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Thread title is required'],
    trim: true,
    maxlength: [200, 'Thread title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Thread description is required'],
    trim: true,
    maxlength: [1000, 'Thread description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Thread category is required'],
    enum: [
      'general',
      'technology',
      'career',
      'education',
      'health',
      'finance',
      'relationships',
      'hobbies',
      'mentorship',
      'milestones',
      'qa',
      'other'
    ],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Thread type for different discussion layers
  type: {
    type: String,
    enum: ['discussion', 'qa', 'milestone', 'mentorship'],
    default: 'discussion'
  },
  // Thread status
  status: {
    type: String,
    enum: ['active', 'closed', 'pinned', 'archived'],
    default: 'active'
  },
  // Engagement metrics
  views: {
    type: Number,
    default: 0
  },
  postsCount: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  // Moderation
  isModerated: {
    type: Boolean,
    default: false
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Privacy settings
  isPrivate: {
    type: Boolean,
    default: false
  },
  allowedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Featured content
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
threadSchema.index({ category: 1, status: 1, createdAt: -1 });
threadSchema.index({ type: 1, status: 1 });
threadSchema.index({ title: 'text', description: 'text', tags: 'text' });
threadSchema.index({ author: 1, createdAt: -1 });

// Update last activity when posts are added
threadSchema.methods.updateLastActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

// Increment post count
threadSchema.methods.incrementPostCount = function() {
  this.postsCount += 1;
  return this.save();
};

// Decrement post count
threadSchema.methods.decrementPostCount = function() {
  this.postsCount = Math.max(0, this.postsCount - 1);
  return this.save();
};

// Increment view count
threadSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Check if user can access private thread
threadSchema.methods.canUserAccess = function(userId) {
  if (!this.isPrivate) return true;
  return this.allowedUsers.includes(userId) || this.author.equals(userId);
};

module.exports = mongoose.model('Thread', threadSchema); 