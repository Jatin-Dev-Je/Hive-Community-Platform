const { redisUtils } = require('../config/redis');
const jwt = require('jsonwebtoken');

class JWTBlacklist {
  constructor() {
    this.blacklistKey = 'jwt_blacklist';
  }

  // Add token to blacklist
  async addToBlacklist(token, expiresIn = null) {
    try {
      if (!expiresIn) {
        // If no expiration provided, decode token to get expiration
        const decoded = jwt.decode(token);
        if (decoded && decoded.exp) {
          expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        } else {
          // Default to 24 hours if no expiration found
          expiresIn = 24 * 60 * 60;
        }
      }

      // Add token to blacklist set with expiration
      await redisUtils.sadd(this.blacklistKey, token);
      await redisUtils.expire(this.blacklistKey, expiresIn);

      return true;
    } catch (error) {
      console.error('Add to blacklist error:', error);
      return false;
    }
  }

  // Check if token is blacklisted
  async isBlacklisted(token) {
    try {
      return await redisUtils.sismember(this.blacklistKey, token);
    } catch (error) {
      console.error('Check blacklist error:', error);
      return false;
    }
  }

  // Remove token from blacklist (useful for admin actions)
  async removeFromBlacklist(token) {
    try {
      await redisUtils.srem(this.blacklistKey, token);
      return true;
    } catch (error) {
      console.error('Remove from blacklist error:', error);
      return false;
    }
  }

  // Get all blacklisted tokens (admin only)
  async getAllBlacklistedTokens() {
    try {
      return await redisUtils.smembers(this.blacklistKey);
    } catch (error) {
      console.error('Get blacklisted tokens error:', error);
      return [];
    }
  }

  // Clear entire blacklist (admin only)
  async clearBlacklist() {
    try {
      await redisUtils.del(this.blacklistKey);
      return true;
    } catch (error) {
      console.error('Clear blacklist error:', error);
      return false;
    }
  }

  // Get blacklist size
  async getBlacklistSize() {
    try {
      const tokens = await redisUtils.smembers(this.blacklistKey);
      return tokens.length;
    } catch (error) {
      console.error('Get blacklist size error:', error);
      return 0;
    }
  }
}

// Create singleton instance
const jwtBlacklist = new JWTBlacklist();

module.exports = jwtBlacklist; 