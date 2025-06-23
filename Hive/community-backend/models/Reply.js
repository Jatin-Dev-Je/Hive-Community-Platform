const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Reply content is required'],
    trim: true,
    maxlength: [5000, 'Reply content cannot exceed 5000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  // For nested replies (replies to replies)
  parentReply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reply',
    default: null
  },
  // Reply type
  type: {
    type: String,
    enum: ['reply', 'answer', 'comment'],
    default: 'reply'
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
  // Reply status
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
  // For Q&A - mark as helpful
  isHelpful: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  // Attachments
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
replySchema.index({ post: 1, createdAt: 1 });
replySchema.index({ author: 1, createdAt: -1 });
replySchema.index({ parentReply: 1, createdAt: 1 });
replySchema.index({ content: 'text' });

// Virtual for like count
replySchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for dislike count
replySchema.virtual('dislikeCount').get(function() {
  return this.dislikes.length;
});

// Virtual for net score
replySchema.virtual('score').get(function() {
  return this.likes.length - this.dislikes.length;
});

// Ensure virtuals are serialized
replySchema.set('toJSON', { virtuals: true });
replySchema.set('toObject', { virtuals: true });

// Methods
replySchema.methods.toggleLike = function(userId) {
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

replySchema.methods.toggleDislike = function(userId) {
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

replySchema.methods.markAsHelpful = function() {
  this.isHelpful = true;
  this.helpfulCount += 1;
  return this.save();
};

replySchema.methods.unmarkAsHelpful = function() {
  this.isHelpful = false;
  this.helpfulCount = Math.max(0, this.helpfulCount - 1);
  return this.save();
};

// Pre-save middleware to update post's reply count
replySchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Post = mongoose.model('Post');
      await Post.findByIdAndUpdate(this.post, {
        $inc: { repliesCount: 1 }
      });
    } catch (error) {
      console.error('Error updating post reply count:', error);
    }
  }
  next();
});

// Pre-remove middleware to update post's reply count
replySchema.pre('remove', async function(next) {
  try {
    const Post = mongoose.model('Post');
    await Post.findByIdAndUpdate(this.post, {
      $inc: { repliesCount: -1 }
    });
  } catch (error) {
    console.error('Error updating post reply count:', error);
  }
  next();
});

module.exports = mongoose.model('Reply', replySchema); 