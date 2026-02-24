import express from 'express';
import { createOrder, createPlatformOrder, verifyAndCreateTournament, verifyPayment } from '../controllers/paymentController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Team entry fee: create Razorpay order
router.post('/create-order', authenticate, createOrder);

// Platform activation fee: create Razorpay order
router.post('/platform-order', authenticate, createPlatformOrder);

// Verify payment signature THEN create tournament — atomic & secure
router.post('/verify-and-create-tournament', authenticate, verifyAndCreateTournament);

// Simple verify only (used for team registration flow)
router.post('/verify-payment', authenticate, verifyPayment);

export default router;
