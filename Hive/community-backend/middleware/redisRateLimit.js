const { redisUtils } = require('../config/redis');

// Redis-based rate limiting middleware
const createRedisRateLimit = (windowMs, maxRequests, keyGenerator = null) => {
  return async (req, res, next) => {
    try {
      // Generate key for rate limiting
      const key = keyGenerator ? keyGenerator(req) : `rate_limit:${req.ip || req.connection.remoteAddress}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Get current requests for this window
      const currentRequests = await redisUtils.get(key) || [];
      
      // Filter out old requests outside the window
      const recentRequests = currentRequests.filter(timestamp => timestamp > windowStart);

      // Check if limit exceeded
      if (recentRequests.length >= maxRequests) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests, please try again later',
          retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
        });
      }

      // Add current request
      recentRequests.push(now);

      // Store updated requests with expiration
      await redisUtils.setEx(key, recentRequests, Math.ceil(windowMs / 1000));

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(0, maxRequests - recentRequests.length),
        'X-RateLimit-Reset': Math.ceil((recentRequests[0] + windowMs) / 1000)
      });

      next();
    } catch (error) {
      console.error('Redis rate limit error:', error);
      // If Redis fails, allow the request to proceed
      next();
    }
  };
};

// Specific rate limiters for different endpoints
const rateLimiters = {
  // Auth endpoints - stricter limits
  auth: createRedisRateLimit(15 * 60 * 1000, 20, (req) => `auth_limit:${req.ip}`), // 20 attempts per 15 minutes
  
  // General API endpoints
  api: createRedisRateLimit(60 * 1000, 100, (req) => `api_limit:${req.ip}`), // 100 requests per minute
  
  // Post creation - prevent spam
  post: createRedisRateLimit(60 * 1000, 10, (req) => `post_limit:${req.user?._id || req.ip}`), // 10 posts per minute
  
  // Search endpoints
  search: createRedisRateLimit(60 * 1000, 30, (req) => `search_limit:${req.ip}`), // 30 searches per minute
  
  // File uploads
  upload: createRedisRateLimit(60 * 1000, 5, (req) => `upload_limit:${req.user?._id || req.ip}`) // 5 uploads per minute
};

module.exports = { createRedisRateLimit, rateLimiters }; 