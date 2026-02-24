import { Tournament, Team, Player, Payment, sequelize } from '../models/index.js';
import { createRazorpayOrder, verifyRazorpaySignature, generateReceiptNumber } from '../services/paymentService.js';
import { jsPDF } from 'jspdf';

/**
 * Handle Razorpay Order Creation
 */
export async function createOrder(req, res, next) {
    try {
        const { tournamentId } = req.body;
        const userId = req.user.id;

        const tournament = await Tournament.findByPk(tournamentId);
        if (!tournament) {
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        }

        if (tournament.tournamentType !== 'PAID') {
            return res.status(400).json({ success: false, message: 'This is a free tournament registration.' });
        }

        const amount = tournament.entryFee;
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid entry fee defined for this tournament.' });
        }

        // Check if user already has a pending or successful payment for this tournament
        const existingPayment = await Payment.findOne({
            where: {
                tournamentId,
                userId,
                status: ['PENDING', 'SUCCESS']
            }
        });

        if (existingPayment && existingPayment.status === 'SUCCESS') {
            return res.status(400).json({ success: false, message: 'You have already registered for this tournament.' });
        }

        const receipt = generateReceiptNumber();
        const order = await createRazorpayOrder(amount, receipt);

        // Store or Update payment record
        if (existingPayment) {
            await existingPayment.update({
                razorpayOrderId: order.id,
                amount: amount,
                receiptNumber: receipt
            });
        } else {
            await Payment.create({
                tournamentId,
                userId,
                amount,
                razorpayOrderId: order.id,
                status: 'PENDING',
                receiptNumber: receipt
            });
        }

        res.json({
            success: true,
            order_id: order.id,
            amount: amount * 100, // Amount in paise as expected by Razorpay Frontend
            razorpay_key_id: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Create Order Error:', error);
        next(error);
    }
}

/**
 * Verify Payment and Create Team
 */
export async function verifyPayment(req, res, next) {
    const t = await sequelize.transaction();
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            tournamentId,
            teamData
        } = req.body;

        // 1. Verify Signature
        const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        const payment = await Payment.findOne({
            where: { razorpayOrderId: razorpay_order_id },
            transaction: t
        });

        if (!payment) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Payment record not found for this order.' });
        }

        if (!isValid) {
            await payment.update({ status: 'FAILED' }, { transaction: t });
            await t.commit();
            return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
        }

        // 2. Prevent Duplicate Team Name/Registration in this Tournament
        const existingTeam = await Team.findOne({
            where: { tournamentId, name: teamData.name },
            transaction: t
        });

        if (existingTeam) {
            await t.rollback();
            return res.status(400).json({ success: false, message: 'A team with this name is already registered.' });
        }

        // 3. Fetch Tournament and Validate Limits
        const tournament = await Tournament.findByPk(tournamentId, { transaction: t });
        if (tournament.maxTeams) {
            const teamCount = await Team.count({ where: { tournamentId }, transaction: t });
            if (teamCount >= tournament.maxTeams) {
                await t.rollback();
                return res.status(400).json({ success: false, message: 'Registration full for this tournament.' });
            }
        }

        // 4. Create Team
        // Use logic similar to teamController for consistency
        const finalEmail = teamData.contactEmail || teamData.captainEmail || req.user.email;
        const finalPhone = teamData.contactPhone || teamData.captainPhone || '0000000000';
        const finalName = teamData.contactName || teamData.captainName || teamData.name;

        const team = await Team.create({
            tournamentId,
            name: teamData.name,
            tag: teamData.tag || teamData.name.substring(0, 3).toUpperCase(),
            logo: teamData.logo,
            contactEmail: finalEmail,
            contactName: finalName,
            contactPhone: finalPhone,
            status: 'approved',
        }, { transaction: t });

        // 5. Create Players
        if (teamData.players && teamData.players.length > 0) {
            await Player.bulkCreate(
                teamData.players.map(p => ({
                    ...p,
                    teamId: team.id,
                    inGameName: p.inGameName || p.name || (teamData.name + '_Player')
                })),
                { transaction: t }
            );
        }

        // 6. Mark Payment Success and Link Team
        await payment.update({
            status: 'SUCCESS',
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            teamId: team.id
        }, { transaction: t });

        // 7. Clear Caches
        try {
            const { deleteCache } = await import('../config/redis.js');
            await deleteCache(`leaderboard:tournament:${tournamentId}`);
            const stages = await import('../models/index.js').then(m => m.Stage.findAll({ where: { tournamentId }, transaction: t }));
            for (const stage of stages) {
                await deleteCache(`leaderboard:stage:${stage.id}`);
            }
        } catch (cacheErr) {
            console.warn('Cache clear failed but transaction will continue:', cacheErr.message);
        }

        await t.commit();

        res.json({
            success: true,
            message: 'Payment verified and team registered successfully.',
            data: {
                teamId: team.id,
                paymentId: payment.id,
                receiptNumber: payment.receiptNumber
            }
        });
    } catch (error) {
        await t.rollback();
        console.error('Verify Payment Error:', error);
        next(error);
    }
}

/**
 * Generate and Download PDF Receipt
 */
export async function getReceipt(req, res, next) {
    try {
        const { paymentId } = req.params;
        const payment = await Payment.findByPk(paymentId, {
            include: [
                { model: Tournament, as: 'tournament' },
                { model: Team, as: 'team' }
            ]
        });

        if (!payment || payment.status !== 'SUCCESS') {
            return res.status(404).json({ success: false, message: 'Success payment record not found.' });
        }

        // Generate PDF
        const doc = new jsPDF();

        // Design the receipt
        doc.setFillColor(41, 128, 185);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('PAYMENT RECEIPT', 105, 25, { align: 'center' });

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);

        let y = 60;
        doc.text(`Receipt Number: ${payment.receiptNumber}`, 20, y); y += 10;
        doc.text(`Date: ${new Date(payment.updatedAt).toLocaleString()}`, 20, y); y += 10;
        doc.text(`User ID: ${payment.userId}`, 20, y); y += 20;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Registration Details:', 20, y); y += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text(`Tournament: ${payment.tournament.name}`, 30, y); y += 10;
        doc.text(`Team Name: ${payment.team.name}`, 30, y); y += 10;
        doc.text(`Status: ${payment.status}`, 30, y); y += 20;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Billing Details:', 20, y); y += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text(`Amount Paid: INR ${payment.amount}.00`, 30, y); y += 10;
        doc.text(`Payment ID: ${payment.razorpayPaymentId}`, 30, y); y += 10;
        doc.text(`Order ID: ${payment.razorpayOrderId}`, 30, y); y += 20;

        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Thank you for participating in our tournament!', 105, 280, { align: 'center' });

        const pdfOutput = doc.output('arraybuffer');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=receipt-${payment.receiptNumber}.pdf`);
        res.send(Buffer.from(pdfOutput));
    } catch (error) {
        console.error('Get Receipt Error:', error);
        next(error);
    }
}
