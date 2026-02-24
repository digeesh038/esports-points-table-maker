import { validationResult } from 'express-validator';
import { Team, Tournament, Player, MatchResult } from '../models/index.js';
import { isValidUUID } from '../utils/helpers.js';

export async function createTeam(req, res, next) {
    try {
        const {
            tournamentId, name, tag, logo,
            contactEmail, contactName, contactPhone,
            captainEmail, captainName, captainPhone, // Support both naming styles
            players
        } = req.body;

        if (!isValidUUID(tournamentId)) {
            return res.status(404).json({ success: false, message: 'Invalid Tournament ID' });
        }

        const tournament = await Tournament.findByPk(tournamentId);
        if (!tournament) {
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        }

        // Validate team limit
        if (tournament.maxTeams) {
            const teamCount = await Team.count({ where: { tournamentId } });
            if (teamCount >= tournament.maxTeams) {
                return res.status(400).json({
                    success: false,
                    message: `Registration full. Maximum teams allowed: ${tournament.maxTeams}`
                });
            }
        }

        // Validate required fields
        if (!name) {
            return res.status(400).json({ success: false, message: 'Team name is required' });
        }
        if (!logo) {
            return res.status(400).json({ success: false, message: 'Team logo is mandatory for registry' });
        }

        // Optimized for: Multi-unit deployment (Logo + Players)
        const finalEmail = contactEmail || captainEmail || 'admin@tournament.com';
        const finalPhone = contactPhone || captainPhone || '0000000000';
        const finalName = contactName || captainName || name;

        // Ensure at least one player is present if not provided, or use provided list
        const finalPlayers = (players && players.length > 0) ? players : [];

        // Payment Verification Logic
        let paymentStatus = 'none';
        let razorpayDetails = {};
        let finalPaymentMethod = tournament.paymentMethod || 'razorpay';
        let paymentProof = req.body.paymentProof || null;

        if (tournament.isPaid) {
            if (finalPaymentMethod === 'razorpay') {
                const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

                if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
                    return res.status(400).json({
                        success: false,
                        message: 'Payment details are required for this paid tournament'
                    });
                }

                // Verify signature
                const crypto = await import('crypto');
                const sign = razorpayOrderId + "|" + razorpayPaymentId;
                const expectedSign = crypto.default
                    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'your_key_secret')
                    .update(sign.toString())
                    .digest("hex");

                if (razorpaySignature !== expectedSign) {
                    return res.status(400).json({ success: false, message: 'Invalid payment signature' });
                }

                paymentStatus = 'completed';
                razorpayDetails = {
                    razorpayPaymentId,
                    razorpayOrderId,
                    razorpaySignature
                };
            } else if (finalPaymentMethod === 'manual') {
                if (!paymentProof) {
                    return res.status(400).json({
                        success: false,
                        message: 'Payment proof (screenshot) is required for manual payment'
                    });
                }
                paymentStatus = 'pending'; // Admin needs to verify
            }
        }

        const team = await Team.create({
            tournamentId,
            name,
            tag: tag || name.substring(0, 3).toUpperCase(),
            logo,
            contactEmail: finalEmail,
            contactName: finalName,
            contactPhone: finalPhone,
            status: finalPaymentMethod === 'manual' ? 'pending' : 'approved',
            paymentStatus,
            paymentMethod: finalPaymentMethod,
            paymentProof,
            ...razorpayDetails
        });

        // Create players if provided
        console.log(`👤 Registering ${finalPlayers.length} players for team: ${name}`);
        await Player.bulkCreate(
            finalPlayers.map(p => ({
                ...p,
                teamId: team.id,
                inGameName: p.inGameName || p.name || (name + '_Captain')
            }))
        );

        const teamWithPlayers = await Team.findByPk(team.id, {
            include: [{ model: Player, as: 'players' }],
        });

        console.log('✅ Team fully registered with players:', teamWithPlayers.players?.length || 0);

        // Invalidate leaderboard cache
        const { clearCachePattern, deleteCache } = await import('../config/redis.js');
        await deleteCache(`leaderboard:tournament:${tournamentId}`);

        const stages = await import('../models/index.js').then(m => m.Stage.findAll({ where: { tournamentId } }));
        for (const stage of stages) {
            await deleteCache(`leaderboard:stage:${stage.id}`);
        }

        res.status(201).json({
            success: true,
            message: 'Team registered successfully',
            data: { team: teamWithPlayers },
        });
    } catch (error) {
        console.error('🔥 Team Creation Error:', error);
        next(error);
    }
}

export async function addPlayer(req, res, next) {
    try {
        const { id: teamId } = req.params;
        const { inGameName, inGameId, role } = req.body;

        // Check if team is rejected
        const team = await Team.findByPk(teamId);
        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }
        if (team.status === 'rejected') {
            return res.status(403).json({ success: false, message: 'Cannot modify roster of a rejected team' });
        }

        const newPlayer = await Player.create({ teamId, inGameName, inGameId, role });
        res.json({
            success: true,
            message: 'Player added to roster',
            data: { player: newPlayer }
        });
    } catch (error) {
        next(error);
    }
}

export async function removePlayer(req, res, next) {
    try {
        const { id: teamId, playerId } = req.params;

        // Check if team is rejected
        const team = await Team.findByPk(teamId);
        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }
        if (team.status === 'rejected') {
            return res.status(403).json({ success: false, message: 'Cannot modify roster of a rejected team' });
        }

        const player = await Player.findOne({ where: { id: playerId, teamId } });
        if (!player) {
            return res.status(404).json({ success: false, message: 'Player not found in this team' });
        }

        await player.destroy();
        res.json({ success: true, message: 'Player removed from roster' });
    } catch (error) {
        next(error);
    }
}




export async function updatePlayer(req, res, next) {
    try {
        const { id: teamId, playerId } = req.params;
        const { inGameName, inGameId, role } = req.body;

        // Check if team is rejected
        const team = await Team.findByPk(teamId);
        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }
        if (team.status === 'rejected') {
            return res.status(403).json({ success: false, message: 'Cannot modify roster of a rejected team' });
        }

        const player = await Player.findOne({ where: { id: playerId, teamId } });
        if (!player) {
            return res.status(404).json({ success: false, message: 'Player not found in this team' });
        }

        await player.update({
            inGameName: inGameName || player.inGameName,
            inGameId: inGameId !== undefined ? inGameId : player.inGameId,
            role: role !== undefined ? role : player.role
        });

        res.json({
            success: true,
            message: 'Player updated successfully',
            data: { player }
        });
    } catch (error) {
        next(error);
    }
}


export async function getAllTeams(req, res, next) {
    try {
        const { tournamentId, status } = req.query;
        const where = {};
        if (tournamentId) where.tournamentId = tournamentId;
        if (status) where.status = status;

        const teams = await Team.findAll({
            where,
            include: [
                { model: Tournament, as: 'tournament', attributes: ['id', 'name'] },
                { model: Player, as: 'players' },
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, data: { teams } });
    } catch (error) {
        next(error);
    }
}

export async function getTeam(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(404).json({ success: false, message: 'Invalid Team ID' });
        }

        const team = await Team.findByPk(id, {
            include: [
                { model: Tournament, as: 'tournament' },
                { model: Player, as: 'players' },
                { model: MatchResult, as: 'results' },
            ],
        });

        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        res.json({ success: true, data: { team } });
    } catch (error) {
        next(error);
    }
}

export async function updateTeam(req, res, next) {
    try {
        const { id } = req.params;
        const team = await Team.findByPk(id);

        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        await team.update(req.body);
        res.json({ success: true, data: { team } });
    } catch (error) {
        next(error);
    }
}

export async function deleteTeam(req, res, next) {
    try {
        const { id } = req.params;
        const { Team, Player, MatchResult, PlayerMatchResult } = await import('../models/index.js');

        console.log(`🗑️ Attempting to delete team: ${id}`);

        const team = await Team.findByPk(id);
        if (!team) {
            console.log(`❌ Team not found: ${id}`);
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        // Manually delete associated data to avoid foreign key constraints
        // if CASCADE is not properly set in the DB level
        console.log(`🔗 Cleaning up records for team: ${team.name}`);

        await PlayerMatchResult.destroy({ where: { teamId: id } });
        await MatchResult.destroy({ where: { teamId: id } });
        await Player.destroy({ where: { teamId: id } });

        await team.destroy();

        // Invalidate cache
        const { deleteCache } = await import('../config/redis.js');
        await deleteCache(`leaderboard:tournament:${team.tournamentId}`);

        const stages = await import('../models/index.js').then(m => m.Stage.findAll({ where: { tournamentId: team.tournamentId } }));
        for (const stage of stages) {
            await deleteCache(`leaderboard:stage:${stage.id}`);
        }

        console.log(`✅ Team deleted successfully: ${team.name}`);
        res.json({ success: true, message: 'Team and associated data expunged' });
    } catch (error) {
        console.error('🔥 Delete Team Error:', error);
        next(error);
    }
}

export async function deleteAllTeams(req, res, next) {
    try {
        const { tournamentId } = req.params;
        const { Team, Player, MatchResult, PlayerMatchResult } = await import('../models/index.js');

        if (!isValidUUID(tournamentId)) {
            return res.status(404).json({ success: false, message: 'Invalid Tournament ID' });
        }

        console.log(`⚠️ MASS_EXPUNGE: Deleting all teams for tournament ${tournamentId}`);

        // Get all team IDs for this tournament
        const tournamentTeams = await Team.findAll({
            where: { tournamentId },
            attributes: ['id']
        });

        const teamIds = tournamentTeams.map(t => t.id);

        if (teamIds.length > 0) {
            // Bulk cleanup
            await PlayerMatchResult.destroy({ where: { teamId: teamIds } });
            await MatchResult.destroy({ where: { teamId: teamIds } });
            await Player.destroy({ where: { teamId: teamIds } });
            await Team.destroy({ where: { id: teamIds } });
        }

        // Invalidate cache
        const { deleteCache } = await import('../config/redis.js');
        await deleteCache(`leaderboard:tournament:${tournamentId}`);

        const stages = await import('../models/index.js').then(m => m.Stage.findAll({ where: { tournamentId } }));
        for (const stage of stages) {
            await deleteCache(`leaderboard:stage:${stage.id}`);
        }

        res.json({ success: true, message: `Purged ${teamIds.length} team records successfully.` });
    } catch (error) {
        console.error('🔥 Mass Delete Error:', error);
        next(error);
    }
}

export default { createTeam, getAllTeams, getTeam, updateTeam, deleteTeam, addPlayer, removePlayer, updatePlayer, deleteAllTeams };
