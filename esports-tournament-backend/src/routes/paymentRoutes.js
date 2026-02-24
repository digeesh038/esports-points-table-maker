import express from 'express';
import { getPaymentInfo, verifyTeamPayment } from '../controllers/paymentController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get UPI ID + entry fee for a tournament (frontend generates QR from this)
router.get('/info/:tournamentId', getPaymentInfo);

// Organizer approves or rejects a team's UPI Transaction ID
router.post('/verify-team/:teamId', authenticate, verifyTeamPayment);

export default router;
