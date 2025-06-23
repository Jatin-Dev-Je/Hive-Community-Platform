const Redis = require('ioredis');

// Create Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  showFriendlyErrorStack: process.env.NODE_ENV === 'development'
});

// Handle Redis connection events
redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('close', () => {
  console.log('Redis connection closed');
});

// Utility functions for common Redis operations
const redisUtils = {
  // Set key with expiration
  setEx: async (key, value, expireSeconds) => {
    try {
      await redis.setex(key, expireSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis setEx error:', error);
      return false;
    }
  },

  // Get key
  get: async (key) => {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  },

  // Delete key
  del: async (key) => {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Redis del error:', error);
      return false;
    }
  },

  // Check if key exists
  exists: async (key) => {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  },

  // Increment counter
  incr: async (key) => {
    try {
      return await redis.incr(key);
    } catch (error) {
      console.error('Redis incr error:', error);
      return 0;
    }
  },

  // Set expiration on existing key
  expire: async (key, seconds) => {
    try {
      await redis.expire(key, seconds);
      return true;
    } catch (error) {
      console.error('Redis expire error:', error);
      return false;
    }
  },

  // Add to set
  sadd: async (key, ...members) => {
    try {
      return await redis.sadd(key, ...members);
    } catch (error) {
      console.error('Redis sadd error:', error);
      return 0;
    }
  },

  // Check if member exists in set
  sismember: async (key, member) => {
    try {
      const result = await redis.sismember(key, member);
      return result === 1;
    } catch (error) {
      console.error('Redis sismember error:', error);
      return false;
    }
  },

  // Remove from set
  srem: async (key, ...members) => {
    try {
      return await redis.srem(key, ...members);
    } catch (error) {
      console.error('Redis srem error:', error);
      return 0;
    }
  },

  // Get all members of set
  smembers: async (key) => {
    try {
      return await redis.smembers(key);
    } catch (error) {
      console.error('Redis smembers error:', error);
      return [];
    }
  }
};

module.exports = { redis, redisUtils }; 