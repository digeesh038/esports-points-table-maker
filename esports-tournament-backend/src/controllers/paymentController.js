// Payment Controller — Manual UPI/QR flow only.
// Razorpay has been removed. No external gateway required.

import { Tournament, Team } from '../models/index.js';

// ── GET Payment Info for a Tournament ────────────────────────────────────────
// Returns the UPI ID and entry fee so the frontend can render the QR code.
export async function getPaymentInfo(req, res, next) {
    try {
        const { tournamentId } = req.params;

        const tournament = await Tournament.findByPk(tournamentId, {
            attributes: ['id', 'name', 'isPaid', 'entryFee', 'currency', 'upiId', 'paymentInstructions'],
        });

        if (!tournament) {
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        }

        if (!tournament.isPaid) {
            return res.json({ success: true, data: { isPaid: false } });
        }

        return res.json({
            success: true,
            data: {
                isPaid: true,
                entryFee: tournament.entryFee,
                currency: tournament.currency || 'INR',
                upiId: tournament.upiId,
                paymentInstructions: tournament.paymentInstructions,
                // QR is generated on the frontend from upiId + entryFee — no upload needed
            },
        });
    } catch (error) {
        next(error);
    }
}

// ── Verify a Team's UPI Transaction ID (organizer action) ────────────────────
export async function verifyTeamPayment(req, res, next) {
    try {
        const { teamId } = req.params;
        const { action } = req.body; // 'approve' | 'reject'

        const team = await Team.findByPk(teamId);
        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        if (action === 'approve') {
            await team.update({ paymentStatus: 'completed', status: 'approved' });
            return res.json({ success: true, message: 'Payment approved. Team is now active.' });
        } else if (action === 'reject') {
            await team.update({ paymentStatus: 'failed', status: 'rejected' });
            return res.json({ success: true, message: 'Payment rejected. Team registration declined.' });
        } else {
            return res.status(400).json({ success: false, message: "Action must be 'approve' or 'reject'" });
        }
    } catch (error) {
        next(error);
    }
}

export default { getPaymentInfo, verifyTeamPayment };
