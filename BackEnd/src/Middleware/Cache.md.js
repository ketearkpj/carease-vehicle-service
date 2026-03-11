// ===== src/middleware/cache.js =====
const Redis = require('ioredis');
const { logger } = require('./Logger.md.js');

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    if (times > 3) {
      logger.error('Redis connection failed');
      return null;
    }
    return Math.min(times * 100, 3000);
  }
});

redisClient.on('connect', () => {
  logger.info('Redis connected successfully');
});

redisClient.on('error', (err) => {
  logger.error('Redis error:', err);
});

// ===== CACHE MIDDLEWARE =====
exports.cache = (duration = 300) => {
  return async (req, res, next) => {
    // Skip cache for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip cache if user is authenticated (to avoid serving stale user-specific data)
    if (req.user) {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        const data = JSON.parse(cachedData);
        return res.status(200).json(data);
      }

      // Store original json method
      const originalJson = res.json;

      // Override json method to cache response
      res.json = function(data) {
        redisClient.setex(key, duration, JSON.stringify(data)).catch(err => {
          logger.error('Cache set error:', err);
        });
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

// ===== CLEAR CACHE BY PATTERN =====
exports.clearCache = async (pattern) => {
  try {
    const keys = await redisClient.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info(`Cleared ${keys.length} cache keys matching ${pattern}`);
    }
  } catch (error) {
    logger.error('Cache clear error:', error);
  }
};

// ===== CACHE HELPER FUNCTIONS =====
exports.cacheHelpers = {
  // Get from cache
  get: async (key) => {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  },

  // Set in cache
  set: async (key, data, duration = 300) => {
    try {
      await redisClient.setex(key, duration, JSON.stringify(data));
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  },

  // Delete from cache
  del: async (key) => {
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  },

  // Delete by pattern
  delPattern: async (pattern) => {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      logger.error('Cache delete pattern error:', error);
    }
  }
};