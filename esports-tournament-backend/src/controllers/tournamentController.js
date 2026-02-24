import { validationResult } from 'express-validator';
import { Tournament, Organization, Stage, Team, Ruleset, Player, Match, sequelize } from '../models/index.js';
import { generateSlug, isValidUUID } from '../utils/helpers.js';
import { getDefaultRuleset } from '../services/scoringEngine.js';
import { clearCachePattern } from '../config/redis.js';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function createTournament(req, res, next) {
    try {
        console.log('📝 Creating Tournament Body:', req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation Errors:', errors.array());
            return res.status(400).json({
                success: false,
                message: errors.array().map(e => e.msg).join(', '),
                errors: errors.array()
            });
        }

        const {
            organizationId, name, game, description, format,
            startDate, endDate, maxTeams, registrationDeadline, isPublic,
            isPaid, entryFee, currency,
            paymentMethod, paymentInstructions, paymentQrCode, upiId
        } = req.body;

        const organization = await Organization.findByPk(organizationId);
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        if (organization.ownerId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const slug = await generateSlug(name, Tournament);

        // Sanitize numeric and date fields
        const sanitizedData = {
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
            status: 'draft',
            isPaid: isPaid === true || isPaid === 'true',
            entryFee: entryFee || 0,
            currency: currency || 'INR',
            paymentMethod: paymentMethod || 'razorpay',
            paymentInstructions: paymentInstructions || null,
            paymentQrCode: paymentQrCode || null,
            upiId: upiId || null,
            platformPaymentId: req.body.platformPaymentId || null,
            platformOrderId: req.body.platformOrderId || null,
            status: req.body.status || 'draft',
        };

        const tournament = await Tournament.create(sanitizedData);

        res.status(201).json({
            success: true,
            message: 'Tournament created successfully',
            data: { tournament },
        });
    } catch (error) {
        console.error('🔥 Tournament Creation Error:', error);
        next(error);
    }
}

export async function getAllTournaments(req, res, next) {
    try {
        const { game, status, isPublic, mine, organizationId } = req.query;
        const where = {};
        if (game) where.game = game;
        if (status) where.status = status;
        if (organizationId) where.organizationId = organizationId;
        if (isPublic !== undefined) where.isPublic = isPublic === 'true';

        const include = [
            {
                model: Organization,
                as: 'organization',
                attributes: ['id', 'name', 'logo', 'ownerId'],
            },
            {
                model: Team,
                as: 'teams',
                attributes: ['id'],
            }
        ];

        // Filter by ownership if requested
        if (mine === 'true' && req.user) {
            include[0].where = { ownerId: req.user.id };
        }

        const tournaments = await Tournament.findAll({
            where,
            include,
            order: [['startDate', 'DESC']],
        });

        res.json({ success: true, data: { tournaments } });
    } catch (error) {
        next(error);
    }
}

export async function getTournament(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(404).json({ success: false, message: 'Invalid Tournament ID' });
        }

        const tournament = await Tournament.findByPk(id, {
            include: [
                { model: Organization, as: 'organization', attributes: ['id', 'name', 'logo'] },
                {
                    model: Stage,
                    as: 'stages',
                    include: [
                        { model: Ruleset, as: 'ruleset' },
                        { model: Match, as: 'matches', attributes: ['id', 'status', 'scheduledTime'] }
                    ]
                },
                {
                    model: Team,
                    as: 'teams',
                    include: [{ model: Player, as: 'players' }]
                },
            ],
            order: [[{ model: Stage, as: 'stages' }, 'stageNumber', 'ASC']],
        });

        if (!tournament) {
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        }

        res.json({ success: true, data: { tournament } });
    } catch (error) {
        next(error);
    }
}

export async function updateTournament(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { id } = req.params;
        const tournament = await Tournament.findByPk(id, {
            include: [{ model: Organization, as: 'organization' }]
        });

        if (!tournament) {
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        }

        if (tournament.organization.ownerId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Sanitize numeric fields if they exist in body
        const updateData = { ...req.body };
        if (updateData.maxTeams) updateData.maxTeams = parseInt(updateData.maxTeams);
        if (updateData.entryFee) updateData.entryFee = parseFloat(updateData.entryFee);
        if (updateData.isPaid !== undefined) updateData.isPaid = updateData.isPaid === true || updateData.isPaid === 'true';

        await tournament.update(updateData);

        res.json({
            success: true,
            message: 'Tournament updated successfully',
            data: { tournament },
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteTournament(req, res, next) {
    try {
        const { id } = req.params;
        const tournament = await Tournament.findByPk(id, {
            include: [{ model: Organization, as: 'organization' }]
        });

        if (!tournament) {
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        }

        if (tournament.organization.ownerId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const tournamentId = tournament.id;

        // Explicitly destroy all child records to guarantee cleanup

        const stages = await Stage.findAll({ where: { tournamentId }, attributes: ['id'] });
        const stageIds = stages.map(s => s.id);

        if (stageIds.length > 0) {
            const matches = await Match.findAll({ where: { stageId: stageIds }, attributes: ['id'] });
            const matchIds = matches.map(m => m.id);

            if (matchIds.length > 0) {
                await PlayerMatchResult.destroy({ where: { matchId: matchIds } });
                await MatchResult.destroy({ where: { matchId: matchIds } });
                await Match.destroy({ where: { id: matchIds } });
            }
            // Clear rulesets attached to stages
            await Ruleset.destroy({ where: { stageId: stageIds } });
            await Stage.destroy({ where: { id: stageIds } });
        }

        // Remove teams (which also removes players via standard Sequelize hooks if configured, 
        // but we'll be explicit here to be safe)
        const teams = await Team.findAll({ where: { tournamentId }, attributes: ['id'] });
        const teamIds = teams.map(t => t.id);
        if (teamIds.length > 0) {
            await Player.destroy({ where: { teamId: teamIds } });
            await Team.destroy({ where: { id: teamIds } });
        }

        await tournament.destroy();

        // Flush all relevant caches
        await clearCachePattern(`leaderboard:tournament:${tournamentId}`);
        await clearCachePattern(`leaderboard:stage:*`);
        await clearCachePattern(`tournament:*`);

        res.json({ success: true, message: 'Tournament deleted successfully' });
    } catch (error) {
        next(error);
    }
}

export async function getStages(req, res, next) {
    try {
        const { id: tournamentId } = req.params;

        if (!isValidUUID(tournamentId)) {
            return res.status(404).json({ success: false, message: 'Invalid Tournament ID' });
        }

        const stages = await Stage.findAll({
            where: { tournamentId },
            include: [
                { model: Ruleset, as: 'ruleset' },
                { model: Match, as: 'matches', attributes: ['id', 'status', 'scheduledTime'] }
            ],
            order: [['stageNumber', 'ASC']],
        });

        res.json({ success: true, data: { stages } });
    } catch (error) {
        next(error);
    }
}

export async function createStage(req, res, next) {

    try {
        const { id: tournamentId } = req.params;
        const { name, stageNumber, numberOfMatches, ruleset: rulesetData } = req.body;

        const { Stage, Ruleset, Organization } = await import('../models/index.js');

        const tournament = await Tournament.findByPk(tournamentId, {
            include: [{ model: Organization, as: 'organization' }]
        });

        if (!tournament) {
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        }

        if (tournament.organization.ownerId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Automatic Stage Numbering
        let finalStageNumber = parseInt(stageNumber);

        // If stageNumber is 1 (the default from frontend) or missing, 
        // find the actual next number to prevent duplicates
        const lastStage = await Stage.findOne({
            where: { tournamentId },
            order: [['stageNumber', 'DESC']]
        });

        const nextInternalNumber = lastStage ? lastStage.stageNumber + 1 : 1;

        // If user didn't explicitly set a high number, use the next internal one
        if (!finalStageNumber || finalStageNumber <= 1) {
            finalStageNumber = nextInternalNumber;
        }

        const stage = await Stage.create({
            tournamentId,
            name,
            stageNumber: finalStageNumber,
            totalMatches: numberOfMatches || 0,
            status: 'pending'
        });

        // Create associated ruleset
        if (rulesetData) {
            // Process placement points array into object format { rank: points }
            const placementPointsMap = {};
            if (Array.isArray(rulesetData.placementPoints)) {
                rulesetData.placementPoints.forEach((points, index) => {
                    placementPointsMap[index + 1] = points;
                });
            }

            const defaultForGame = getDefaultRuleset(tournament.game);

            await Ruleset.create({
                stageId: stage.id,
                killPoints: { perKill: rulesetData.killPoint || defaultForGame.killPoints.perKill },
                placementPoints: Object.keys(placementPointsMap).length > 0 ? placementPointsMap : defaultForGame.placementPoints,
                multiplier: rulesetData.multiplier || defaultForGame.multiplier,
                tieBreakers: rulesetData.tieBreakers || defaultForGame.tieBreakers,
                bonusRules: rulesetData.bonusRules || null
            });
        }

        res.status(201).json({
            success: true,
            message: 'Stage created successfully',
            data: { stage }
        });
    } catch (error) {
        console.error('🔥 Stage Creation Error:', error);
        next(error);
    }
}

export async function exportTournamentTeams(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(404).json({ success: false, message: 'Invalid Tournament ID' });
        }

        const tournament = await Tournament.findByPk(id, {
            include: [{
                model: Team,
                as: 'teams',
                include: [{ model: Player, as: 'players' }]
            }]
        });

        if (!tournament) {
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        }

        const teamsData = [];
        // Flatten team data - one row per team
        if (tournament.teams && tournament.teams.length > 0) {
            tournament.teams.forEach((team, index) => {
                const row = {
                    'NO': index + 1,
                    'TEAM NAME': team.name,
                    'TAG': team.tag || '',
                    'STATUS': team.status.toUpperCase(),
                    'CAPTAIN': team.captainName || '',
                    'EMAIL': team.captainEmail || '',
                    'CONTACT': team.captainPhone || ''
                };

                if (team.players && team.players.length > 0) {
                    team.players.forEach((player, pIndex) => {
                        const idx = pIndex + 1;
                        row[`P${idx} IGN`] = player.inGameName;
                        row[`P${idx} ID`] = player.inGameId || '';
                    });
                }
                teamsData.push(row);
            });
        }

        if (teamsData.length === 0) {
            teamsData.push({
                'NO': '-', 'TEAM NAME': 'No Teams', 'TAG': '-', 'STATUS': '-', 'CAPTAIN': '-', 'EMAIL': '-', 'CONTACT': '-'
            });
        }

        // --- Switch to PDF Export ---
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.text(`TEAMS LIST: ${tournament.name.toUpperCase()}`, 105, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });

        // Define columns
        const tableColumn = ["NO", "TEAM NAME", "TAG", "STATUS", "CAPTAIN", "PLAYERS"];

        // Define rows
        const tableRows = tournament.teams.map((team, index) => {
            const playerNames = (team.players || []).map(p => p.inGameName).join(', ');
            return [
                index + 1,
                team.name,
                team.tag || '',
                team.status.toUpperCase(),
                team.captainName || team.contactName || '',
                playerNames
            ];
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { fontSize: 8, cellPadding: 2 },
            columnStyles: {
                0: { cellWidth: 10 },
                1: { cellWidth: 40 },
                5: { cellWidth: 'auto' } // Allow players column to expand
            }
        });

        const pdfOutput = doc.output('arraybuffer');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=tournament-teams-${id}.pdf`);
        res.send(Buffer.from(pdfOutput));

    } catch (error) {
        console.error('Error exporting teams:', error);
        next(error);
    }
}

export async function deleteStage(req, res, next) {
    try {
        const { id: tournamentId, stageId } = req.params;

        if (!isValidUUID(tournamentId) || !isValidUUID(stageId)) {
            return res.status(404).json({ success: false, message: 'Invalid ID format' });
        }

        const stage = await Stage.findByPk(stageId, {
            include: [{ model: Tournament, as: 'tournament', include: [{ model: Organization, as: 'organization' }] }]
        });

        if (!stage || stage.tournamentId !== tournamentId) {
            return res.status(404).json({ success: false, message: 'Stage not found in this tournament' });
        }

        if (stage.tournament.organization.ownerId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await stage.destroy();

        // Clear leaderboard cache
        await clearCachePattern('leaderboard:*');

        res.json({ success: true, message: 'Stage deleted successfully' });
    } catch (error) {
        next(error);
    }
}

/**
 * Force-deletes a tournament and ALL related data using raw SQL inside
 * a transaction. This bypasses any Sequelize cascade issues and is
 * guaranteed to work even if foreign key constraints block normal destroy().
 */
export async function forceDeleteTournament(req, res, next) {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            await t.rollback();
            return res.status(400).json({ success: false, message: 'Invalid tournament ID' });
        }

        // Verify ownership
        const tournament = await Tournament.findByPk(id, {
            include: [{ model: Organization, as: 'organization' }],
            transaction: t
        });

        if (!tournament) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        }

        if (tournament.organization.ownerId !== req.user.id) {
            await t.rollback();
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Raw SQL cascade delete — order matters (children first)
        await sequelize.query(
            `DELETE FROM player_match_results
             WHERE match_id IN (
                 SELECT m.id FROM matches m
                 JOIN stages s ON m.stage_id = s.id
                 WHERE s.tournament_id = :tId
             )`,
            { replacements: { tId: id }, transaction: t }
        );

        await sequelize.query(
            `DELETE FROM match_results
             WHERE match_id IN (
                 SELECT m.id FROM matches m
                 JOIN stages s ON m.stage_id = s.id
                 WHERE s.tournament_id = :tId
             )`,
            { replacements: { tId: id }, transaction: t }
        );

        await sequelize.query(
            `DELETE FROM matches
             WHERE stage_id IN (
                 SELECT id FROM stages WHERE tournament_id = :tId
             )`,
            { replacements: { tId: id }, transaction: t }
        );

        await sequelize.query(
            `DELETE FROM rulesets
             WHERE stage_id IN (
                 SELECT id FROM stages WHERE tournament_id = :tId
             )`,
            { replacements: { tId: id }, transaction: t }
        );

        await sequelize.query(
            `DELETE FROM stages WHERE tournament_id = :tId`,
            { replacements: { tId: id }, transaction: t }
        );

        await sequelize.query(
            `DELETE FROM players WHERE team_id IN (
                 SELECT id FROM teams WHERE tournament_id = :tId
             )`,
            { replacements: { tId: id }, transaction: t }
        );

        await sequelize.query(
            `DELETE FROM teams WHERE tournament_id = :tId`,
            { replacements: { tId: id }, transaction: t }
        );

        await sequelize.query(
            `DELETE FROM tournaments WHERE id = :tId`,
            { replacements: { tId: id }, transaction: t }
        );

        await t.commit();

        // Flush all caches
        await clearCachePattern(`leaderboard:tournament:${id}`);
        await clearCachePattern(`leaderboard:stage:*`);
        await clearCachePattern(`tournament:*`);

        res.json({ success: true, message: 'Tournament and all related data deleted successfully' });
    } catch (error) {
        await t.rollback();
        next(error);
    }
}
