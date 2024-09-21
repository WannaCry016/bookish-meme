import rateLimit from 'express-rate-limit';
import redis from 'redis';
import expressLimiter from 'express-limiter';

// Redis client setup
const redisClient = redis.createClient();

const limiter = expressLimiter({
  lookup: ['connection.remoteAddress'],
  total: 100,
  expire: 1000 * 60 * 15, // 15 minutes
  onRateLimited: (req, res, next) => {
    res.status(429).json({ error: 'Too many requests, please try again later.' });
  }
});

export default rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  handler: (req, res) => {
    res.status(429).send('Too many requests');
  },
});
