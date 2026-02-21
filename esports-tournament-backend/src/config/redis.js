import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient = null;

try {
    if (process.env.REDIS_URL) {
        redisClient = new Redis(process.env.REDIS_URL);
        console.log('🌍 Using production Redis');
    } else if (process.env.REDIS_HOST) {
        redisClient = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
        });
        console.log('💻 Using local Redis');
    }

    if (redisClient) {
        redisClient.on('connect', () => {
            console.log('✅ Redis connected successfully');
        });

        redisClient.on('error', (err) => {
            console.warn('⚠️ Redis connection error:', err.message);
        });
    }
} catch (error) {
    console.warn('⚠️ Redis initialization failed:', error.message);
}

/* ---------- Helper Functions ---------- */

export const getCache = async (key) => {
    if (!redisClient) return null;
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.warn('Redis GET error:', error.message);
        return null;
    }
};

export const setCache = async (key, value, expirySeconds = 3600) => {
    if (!redisClient) return false;
    try {
        await redisClient.setex(key, expirySeconds, JSON.stringify(value));
        return true;
    } catch (error) {
        console.warn('Redis SET error:', error.message);
        return false;
    }
};

export const deleteCache = async (key) => {
    if (!redisClient) return false;
    try {
        await redisClient.del(key);
        return true;
    } catch (error) {
        console.warn('Redis DELETE error:', error.message);
        return false;
    }
};

export const clearCachePattern = async (pattern) => {
    if (!redisClient) return false;
    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(...keys);
        }
        return true;
    } catch (error) {
        console.warn('Redis CLEAR error:', error.message);
        return false;
    }
};

export default redisClient;