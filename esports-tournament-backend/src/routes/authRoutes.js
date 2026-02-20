import { Router } from 'express';
import { googleSignIn, getProfile } from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// Public routes - Google Sign-In only
router.post('/google-signin', googleSignIn);

// Protected routes
router.get('/profile', authenticate, getProfile);

export default router;
