import dotenv from 'dotenv';

dotenv.config();

export const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
export const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

export default {
    secret,
    expiresIn,
};
