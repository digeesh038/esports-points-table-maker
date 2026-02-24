import razorpay from '../config/razorpay.js';
import crypto from 'crypto';
import { Payment } from '../models/index.js';

/**
 * Create a new Razorpay order
 * @param {string} tournamentId 
 * @param {number} amount 
 * @param {string} receipt 
 * @returns {Promise<Object>}
 */
export async function createRazorpayOrder(amount, receipt) {
    try {
        const options = {
            amount: amount * 100, // Razorpay amount is in paise
            currency: 'INR',
            receipt: receipt,
        };

        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        console.error('Razorpay Order Creation Error:', error);
        throw new Error('Failed to create payment order');
    }
}

/**
 * Verify Razorpay payment signature
 * @param {string} orderId 
 * @param {string} paymentId 
 * @param {string} signature 
 * @returns {boolean}
 */
export function verifyRazorpaySignature(orderId, paymentId, signature) {
    const text = orderId + "|" + paymentId;
    const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

    return generated_signature === signature;
}

/**
 * Generate a unique receipt number
 * @returns {string}
 */
export function generateReceiptNumber() {
    return `RCPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
