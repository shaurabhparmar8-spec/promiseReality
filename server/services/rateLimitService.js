const redis = require('redis');
const logger = require('../utils/logger');

class RateLimitService {
  constructor() {
    this.useRedis = process.env.REDIS_URL || process.env.REDIS_HOST;
    this.memoryStore = new Map();
    
    if (this.useRedis) {
      this.initializeRedis();
    }
  }

  async initializeRedis() {
    try {
      this.redisClient = redis.createClient({
        url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
      });
      
      await this.redisClient.connect();
      logger.info('Redis connected for rate limiting');
    } catch (error) {
      logger.warn('Redis connection failed, using memory store for rate limiting:', error.message);
      this.useRedis = false;
    }
  }

  async checkRateLimit(key, maxRequests, windowMinutes) {
    const windowMs = windowMinutes * 60 * 1000;
    const now = Date.now();

    if (this.useRedis && this.redisClient) {
      return await this.checkRateLimitRedis(key, maxRequests, windowMs, now);
    } else {
      return await this.checkRateLimitMemory(key, maxRequests, windowMs, now);
    }
  }

  async checkRateLimitRedis(key, maxRequests, windowMs, now) {
    try {
      const pipeline = this.redisClient.multi();
      const windowStart = now - windowMs;
      
      // Remove old entries
      pipeline.zRemRangeByScore(key, 0, windowStart);
      
      // Count current requests
      pipeline.zCard(key);
      
      // Add current request
      pipeline.zAdd(key, { score: now, value: now.toString() });
      
      // Set expiry
      pipeline.expire(key, Math.ceil(windowMs / 1000));
      
      const results = await pipeline.exec();
      const currentCount = results[1][1];
      
      return {
        allowed: currentCount < maxRequests,
        count: currentCount + 1,
        remaining: Math.max(0, maxRequests - currentCount - 1),
        resetTime: now + windowMs
      };
    } catch (error) {
      logger.error('Redis rate limit check failed:', error);
      // Fallback to memory store
      return await this.checkRateLimitMemory(key, maxRequests, windowMs, now);
    }
  }

  async checkRateLimitMemory(key, maxRequests, windowMs, now) {
    if (!this.memoryStore.has(key)) {
      this.memoryStore.set(key, []);
    }

    const requests = this.memoryStore.get(key);
    const windowStart = now - windowMs;

    // Remove old requests
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    
    // Add current request
    validRequests.push(now);
    
    // Update store
    this.memoryStore.set(key, validRequests);

    // Clean up old keys periodically
    if (Math.random() < 0.01) { // 1% chance
      this.cleanupMemoryStore(now);
    }

    return {
      allowed: validRequests.length <= maxRequests,
      count: validRequests.length,
      remaining: Math.max(0, maxRequests - validRequests.length),
      resetTime: now + windowMs
    };
  }

  cleanupMemoryStore(now) {
    const cutoff = now - (24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [key, requests] of this.memoryStore.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > cutoff);
      
      if (validRequests.length === 0) {
        this.memoryStore.delete(key);
      } else {
        this.memoryStore.set(key, validRequests);
      }
    }
  }

  async checkPasswordResetRateLimit(ipAddress, email) {
    const windowMinutes = parseInt(process.env.RATE_LIMIT_WINDOW_MIN) || 15;
    const maxRequestsPerIP = parseInt(process.env.RESET_MAX_ATTEMPTS_PER_IP) || 5;
    const maxRequestsPerEmail = parseInt(process.env.RESET_MAX_ATTEMPTS_PER_EMAIL) || 3;

    // Check IP-based rate limit
    const ipKey = `reset_ip:${ipAddress}`;
    const ipLimit = await this.checkRateLimit(ipKey, maxRequestsPerIP, windowMinutes);

    // Check email-based rate limit
    const emailKey = `reset_email:${email}`;
    const emailLimit = await this.checkRateLimit(emailKey, maxRequestsPerEmail, windowMinutes);

    const isAllowed = ipLimit.allowed && emailLimit.allowed;
    
    // Log rate limit attempts
    if (!isAllowed) {
      logger.warn('Password reset rate limit exceeded', {
        ipAddress,
        email,
        ipCount: ipLimit.count,
        emailCount: emailLimit.count
      });
    }

    return {
      allowed: isAllowed,
      ipLimit,
      emailLimit,
      retryAfter: Math.max(ipLimit.resetTime, emailLimit.resetTime)
    };
  }

  async recordPasswordResetAttempt(ipAddress, email, success = false) {
    const timestamp = Date.now();
    
    // Record in audit log
    logger.info('Password reset attempt recorded', {
      ipAddress,
      email,
      success,
      timestamp
    });

    // Additional tracking for failed attempts
    if (!success) {
      const failedKey = `reset_failed:${ipAddress}`;
      await this.checkRateLimit(failedKey, 10, 60); // Track failed attempts
    }
  }

  // Progressive delay for repeated requests
  calculateBackoffDelay(attemptCount) {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    
    const delay = Math.min(baseDelay * Math.pow(2, attemptCount - 1), maxDelay);
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay;
    
    return Math.floor(delay + jitter);
  }

  async getBackoffDelay(ipAddress) {
    const key = `backoff:${ipAddress}`;
    
    if (this.useRedis && this.redisClient) {
      try {
        const count = await this.redisClient.incr(key);
        await this.redisClient.expire(key, 3600); // 1 hour expiry
        return this.calculateBackoffDelay(count);
      } catch (error) {
        logger.error('Redis backoff check failed:', error);
      }
    }
    
    // Memory fallback
    const now = Date.now();
    const backoffData = this.memoryStore.get(key) || { count: 0, lastAttempt: now };
    
    // Reset if more than 1 hour passed
    if (now - backoffData.lastAttempt > 3600000) {
      backoffData.count = 0;
    }
    
    backoffData.count++;
    backoffData.lastAttempt = now;
    this.memoryStore.set(key, backoffData);
    
    return this.calculateBackoffDelay(backoffData.count);
  }
}

module.exports = new RateLimitService();