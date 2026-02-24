import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
// import { protect } from '../middleware/authMiddleware.js'; // If auth is needed

const router = express.Router();

router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);

export default router;
