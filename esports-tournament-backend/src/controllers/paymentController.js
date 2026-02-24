import razorpayClient from '../config/razorpay.js';
import crypto from 'crypto';
import { Tournament, Team, Player, Organization } from '../models/index.js';
import { generateSlug } from '../utils/helpers.js';

// ─── Helper: Verify Razorpay HMAC Signature ──────────────────────────────────
function verifyRazorpaySignature(orderId, paymentId, signature) {
    const sign = `${orderId}|${paymentId}`;
    const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign)
        .digest('hex');
    return expectedSign === signature;
}

// ─── 1. Create Order for Team Entry Fee ──────────────────────────────────────
export async function createOrder(req, res, next) {
    try {
        const { tournamentId, amount, currency = 'INR' } = req.body;

        if (!tournamentId) {
            return res.status(400).json({ success: false, message: 'Tournament ID is required' });
        }

        const tournament = await Tournament.findByPk(tournamentId);
        if (!tournament) {
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        }
        if (!tournament.isPaid) {
            return res.status(400).json({ success: false, message: 'This tournament is free' });
        }

        const order = await razorpayClient.orders.create({
            amount: Math.round(Number(amount) * 100), // paise
            currency,
            receipt: `entry_${tournamentId.substring(0, 8)}_${Date.now()}`,
        });

        return res.json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: process.env.RAZORPAY_KEY_ID,
            },
        });
    } catch (error) {
        console.error('Razorpay createOrder Error:', error);
        next(error);
    }
}

// ─── 2. Create Platform Order (organizer activation fee) ─────────────────────
export async function createPlatformOrder(req, res, next) {
    try {
        const { amount, currency = 'INR', tournamentName = 'Tournament' } = req.body;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ success: false, message: 'Valid amount is required' });
        }

        const order = await razorpayClient.orders.create({
            amount: Math.round(Number(amount) * 100),
            currency,
            receipt: `platform_${Date.now()}`,
            notes: { purpose: 'tournament_activation', tournamentName },
        });

        return res.json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: process.env.RAZORPAY_KEY_ID,
            },
        });
    } catch (error) {
        console.error('Platform Order Error:', error);
        next(error);
    }
}

// ─── 3. Verify Payment + Create Tournament (atomic, secure) ──────────────────
// This is the ONLY way a paid tournament gets created — after server-side verify
export async function verifyAndCreateTournament(req, res, next) {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            tournamentData,
        } = req.body;

        // 3a. Verify HMAC signature — reject immediately if fake
        if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
            return res.status(400).json({
                success: false,
                message: '🚫 Payment verification failed. Invalid signature — possible fraud attempt blocked.',
            });
        }

        // 3b. Confirm the order is actually captured at Razorpay (prevent replay)
        let razorpayOrder;
        try {
            razorpayOrder = await razorpayClient.orders.fetch(razorpay_order_id);
        } catch {
            return res.status(400).json({ success: false, message: 'Could not verify order with Razorpay.' });
        }

        if (razorpayOrder.status !== 'paid') {
            return res.status(400).json({ success: false, message: `Order not paid. Status: ${razorpayOrder.status}` });
        }

        // 3c. Build tournament record
        const {
            organizationId, name, game, description, format,
            startDate, endDate, maxTeams, registrationDeadline,
            isPublic, isPaid, entryFee, currency,
            paymentMethod, paymentInstructions,
        } = tournamentData;

        const organization = await Organization.findByPk(organizationId);
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }
        if (organization.ownerId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const slug = await generateSlug(name, Tournament);

        const tournament = await Tournament.create({
            organizationId,
            name: name?.trim(),
            slug,
            game: game || 'free_fire',
            description,
            format: format || 'league',
            startDate: startDate || null,
            endDate: endDate || null,
            maxTeams: maxTeams ? parseInt(maxTeams) : null,
            registrationDeadline: registrationDeadline || null,
            isPublic: isPublic !== false,
            isPaid: true,
            entryFee: entryFee || 0,
            currency: currency || 'INR',
            paymentMethod: paymentMethod || 'razorpay',
            paymentInstructions: paymentInstructions || null,
            paymentQrCode: null,
            upiId: null,
            platformPaymentId: razorpay_payment_id,
            platformOrderId: razorpay_order_id,
            status: 'active',
        });

        return res.status(201).json({
            success: true,
            message: 'Payment verified & tournament created successfully',
            data: { tournament, paymentId: razorpay_payment_id },
        });
    } catch (error) {
        console.error('verifyAndCreateTournament Error:', error);
        next(error);
    }
}

// ─── 4. Verify Payment Signature Only (simple check, used elsewhere) ──────────
export async function verifyPayment(req, res, next) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'All payment fields are required' });
        }

        const valid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        if (valid) {
            return res.json({ success: true, message: 'Payment signature verified' });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (error) {
        next(error);
    }
}

export default { createOrder, createPlatformOrder, verifyAndCreateTournament, verifyPayment };
