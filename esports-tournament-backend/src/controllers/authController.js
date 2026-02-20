import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/index.js';
import { secret, expiresIn } from '../config/jwt.js';
import { googleClientId } from '../config/google.js';

const googleClient = new OAuth2Client(googleClientId);


/**
 * Generate JWT token
 */
const generateToken = (userId) => {
    return jwt.sign({ userId }, secret, { expiresIn });
};

/**
 * Signup - Register new user
 */
export async function signup(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        const { email, password, name } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered',
            });
        }

        // Create user
        const user = await User.create({ email, password, name });

        // Generate token
        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    profilePicture: user.profilePicture,
                },
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Login - Authenticate user
 */
export async function login(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated',
            });
        }

        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    profilePicture: user.profilePicture,
                },
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Google Sign-In - Authenticate user with Google OAuth
 */
export async function googleSignIn(req, res, next) {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: 'Google credential is required',
            });
        }

        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: googleClientId,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Find or create user
        let user = await User.findOne({ where: { googleId } });

        if (!user) {
            // Check if user exists with this email
            user = await User.findOne({ where: { email } });

            if (user) {
                // Link Google account to existing user
                user.googleId = googleId;
                user.profilePicture = picture;
                await user.save();
            } else {
                // Create new user
                user = await User.create({
                    email,
                    name,
                    googleId,
                    profilePicture: picture,
                    password: null, // No password for Google OAuth users
                });
            }
        } else if (user.profilePicture !== picture) {
            // Update picture if it changed
            user.profilePicture = picture;
            await user.save();
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated',
            });
        }

        // Generate token
        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Google sign-in successful',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    profilePicture: user.profilePicture,
                },
            },
        });
    } catch (error) {
        console.error('Google Sign-In Error:', error);
        next(error);
    }
}

/**
 * Get profile
 */
export async function getProfile(req, res, next) {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
        });

        res.json({
            success: true,
            data: { user },
        });
    } catch (error) {
        next(error);
    }
}


export default { signup, login, googleSignIn, getProfile };
