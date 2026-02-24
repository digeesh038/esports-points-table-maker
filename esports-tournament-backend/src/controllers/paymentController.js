import razorpay from '../config/razorpay.js';
import crypto from 'crypto';
import { Tournament, Team } from '../models/index.js';

export async function createOrder(req, res, next) {
    try {
        const { tournamentId, amount, currency = 'INR' } = req.body;

        const tournament = await Tournament.findByPk(tournamentId);
        if (!tournament) {
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        }

        if (!tournament.isPaid) {
            return res.status(400).json({ success: false, message: 'This tournament is free' });
        }

        const options = {
            amount: Math.round(amount * 100), // amount in the smallest currency unit (paise for INR)
            currency,
            receipt: `receipt_tournament_${tournamentId}_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: process.env.RAZORPAY_KEY_ID
            }
        });
    } catch (error) {
        console.error('Razorpay Order Error:', error);
        next(error);
    }
}

export async function verifyPayment(req, res, next) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'your_key_secret')
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            return res.json({ success: true, message: "Payment verified successfully" });
        } else {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        console.error('Razorpay Verification Error:', error);
        next(error);
    }
}

export default { createOrder, verifyPayment };
