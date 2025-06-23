const { body, validationResult } = require('express-validator');

// Validation rules
const userValidationRules = () => {
  return [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    
    body('firstName')
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be between 1 and 50 characters')
      .trim(),
    
    body('lastName')
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be between 1 and 50 characters')
      .trim()
  ];
};

const threadValidationRules = () => {
  return [
    body('title')
      .isLength({ min: 5, max: 200 })
      .withMessage('Thread title must be between 5 and 200 characters')
      .trim(),
    
    body('description')
      .isLength({ min: 10, max: 1000 })
      .withMessage('Thread description must be between 10 and 1000 characters')
      .trim(),
    
    body('category')
      .isIn(['general', 'technology', 'career', 'education', 'health', 'finance', 'relationships', 'hobbies', 'mentorship', 'milestones', 'qa', 'other'])
      .withMessage('Invalid category'),
    
    body('type')
      .optional()
      .isIn(['discussion', 'qa', 'milestone', 'mentorship'])
      .withMessage('Invalid thread type'),
    
    body('tags')
      .optional()
      .isArray({ max: 10 })
      .withMessage('Maximum 10 tags allowed'),
    
    body('tags.*')
      .optional()
      .isLength({ min: 1, max: 20 })
      .withMessage('Each tag must be between 1 and 20 characters')
  ];
};

const postValidationRules = () => {
  return [
    body('content')
      .isLength({ min: 1, max: 10000 })
      .withMessage('Post content must be between 1 and 10000 characters')
      .trim(),
    
    body('type')
      .optional()
      .isIn(['discussion', 'question', 'answer', 'milestone', 'mentorship'])
      .withMessage('Invalid post type'),
    
    body('milestone.title')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Milestone title must be between 1 and 100 characters'),
    
    body('milestone.category')
      .optional()
      .isIn(['career', 'education', 'health', 'personal', 'financial', 'other'])
      .withMessage('Invalid milestone category'),
    
    body('mentorshipRequest.topic')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Mentorship topic must be between 1 and 100 characters'),
    
    body('tags')
      .optional()
      .isArray({ max: 10 })
      .withMessage('Maximum 10 tags allowed')
  ];
};

const replyValidationRules = () => {
  return [
    body('content')
      .isLength({ min: 1, max: 5000 })
      .withMessage('Reply content must be between 1 and 5000 characters')
      .trim(),
    
    body('type')
      .optional()
      .isIn(['reply', 'answer', 'comment'])
      .withMessage('Invalid reply type')
  ];
};

// Sanitization functions
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
  return input;
};

const sanitizeObject = (obj) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

// Validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

// Rate limiting helper
const createRateLimit = (windowMs, maxRequests) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests.has(key)) {
      requests.set(key, []);
    }
    
    const userRequests = requests.get(key);
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later'
      });
    }
    
    recentRequests.push(now);
    requests.set(key, recentRequests);
    next();
  };
};

module.exports = {
  userValidationRules,
  threadValidationRules,
  postValidationRules,
  replyValidationRules,
  validate,
  sanitizeInput,
  sanitizeObject,
  createRateLimit
}; 