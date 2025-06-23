const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    maxlength: [10000, 'Post content cannot exceed 10000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Thread',
    required: true
  },
  // Post type for different content
  type: {
    type: String,
    enum: ['discussion', 'question', 'answer', 'milestone', 'mentorship'],
    default: 'discussion'
  },
  // For Q&A posts
  isAcceptedAnswer: {
    type: Boolean,
    default: false
  },
  // For milestone posts
  milestone: {
    title: String,
    description: String,
    category: {
      type: String,
      enum: ['career', 'education', 'health', 'personal', 'financial', 'other']
    },
    date: Date,
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  // For mentorship posts
  mentorshipRequest: {
    topic: String,
    description: String,
    preferredMentorType: String,
    timeline: String,
    isOpen: {
      type: Boolean,
      default: true
    }
  },
  // Engagement metrics
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  repliesCount: {
    type: Number,
    default: 0
  },
  // Post status
  status: {
    type: String,
    enum: ['active', 'hidden', 'deleted', 'flagged'],
    default: 'active'
  },
  // Moderation
  isModerated: {
    type: Boolean,
    default: false
  },
  moderationReason: String,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  // Featured content
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredAt: Date,
  // Attachments
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  }],
  // Tags for better categorization
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
postSchema.index({ thread: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ type: 1, status: 1 });
postSchema.index({ content: 'text', tags: 'text' });
postSchema.index({ 'milestone.category': 1, createdAt: -1 });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for dislike count
postSchema.virtual('dislikeCount').get(function() {
  return this.dislikes.length;
});

// Virtual for net score
postSchema.virtual('score').get(function() {
  return this.likes.length - this.dislikes.length;
});

// Ensure virtuals are serialized
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

// Methods
postSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  const dislikeIndex = this.dislikes.indexOf(userId);
  
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push(userId);
    if (dislikeIndex > -1) {
      this.dislikes.splice(dislikeIndex, 1);
    }
  }
  
  return this.save();
};

postSchema.methods.toggleDislike = function(userId) {
  const dislikeIndex = this.dislikes.indexOf(userId);
  const likeIndex = this.likes.indexOf(userId);
  
  if (dislikeIndex > -1) {
    this.dislikes.splice(dislikeIndex, 1);
  } else {
    this.dislikes.push(userId);
    if (likeIndex > -1) {
      this.likes.splice(likeIndex, 1);
    }
  }
  
  return this.save();
};

postSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

postSchema.methods.incrementRepliesCount = function() {
  this.repliesCount += 1;
  return this.save();
};

postSchema.methods.decrementRepliesCount = function() {
  this.repliesCount = Math.max(0, this.repliesCount - 1);
  return this.save();
};

postSchema.methods.acceptAsAnswer = function() {
  if (this.type === 'answer') {
    this.isAcceptedAnswer = true;
    return this.save();
  }
  throw new Error('Only answer posts can be accepted as answers');
};

postSchema.methods.markAsFeatured = function() {
  this.isFeatured = true;
  this.featuredAt = new Date();
  return this.save();
};

// Pre-save middleware to update thread's last activity
postSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Thread = mongoose.model('Thread');
      await Thread.findByIdAndUpdate(this.thread, {
        $inc: { postsCount: 1 },
        lastActivity: new Date()
      });
    } catch (error) {
      console.error('Error updating thread:', error);
    }
  }
  next();
});

// Pre-remove middleware to update thread's post count
postSchema.pre('remove', async function(next) {
  try {
    const Thread = mongoose.model('Thread');
    await Thread.findByIdAndUpdate(this.thread, {
      $inc: { postsCount: -1 }
    });
  } catch (error) {
    console.error('Error updating thread:', error);
  }
  next();
});

module.exports = mongoose.model('Post', postSchema); 