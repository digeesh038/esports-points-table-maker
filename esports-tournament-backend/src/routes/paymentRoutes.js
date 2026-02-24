import express from 'express';
import { createOrder, verifyPayment, getReceipt } from '../controllers/paymentController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All payment routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/payments/create-order
 * @desc    Create Razorpay Order for tournament entry fee
 */
router.post('/create-order', createOrder);

/**
 * @route   POST /api/payments/verify
 * @desc    Verify Razorpay signature and create team
 */
router.post('/verify', verifyPayment);

/**
 * @route   GET /api/payments/receipt/:paymentId
 * @desc    Get PDF receipt for a successful payment
 */
router.get('/receipt/:paymentId', getReceipt);

export default router;
