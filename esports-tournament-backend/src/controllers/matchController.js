import { Match, Stage, Tournament, Organization, MatchResult, Team, Ruleset, PlayerMatchResult } from '../models/index.js';
import { isValidUUID } from '../utils/helpers.js';
import { submitMatchResults, getDefaultRuleset } from '../services/scoringEngine.js';
import websocketService from '../services/websocketService.js';
import { clearCachePattern } from '../config/redis.js';

/**
 * Access Control Utility
 * Ensures the user has permissions for the given stage/match context
 */
async function checkStageAccess(stageId, userId) {
    if (!isValidUUID(stageId)) return null;

    const stage = await Stage.findByPk(stageId, {
        include: [{
            model: Tournament,
            as: 'tournament',
            include: [{
                model: Organization,
                as: 'organization'
            }]
        }]
    });

    if (!stage || !stage.tournament || !stage.tournament.organization) return null;

    // Check if the user is the owner of the organization
    const ownerId = stage.tournament.organization.ownerId;
    if (String(ownerId).toLowerCase() === String(userId).toLowerCase()) {
        return stage;
    }
    return null;
}

/**
 * CREATE Match
 */
export async function createMatch(req, res, next) {
    try {
        const { stageId, matchNumber, mapName, scheduledTime, customTitle } = req.body;

        const stage = await checkStageAccess(stageId, req.user.id);
        if (!stage) {
            return res.status(403).json({ success: false, message: 'Permission denied for this stage' });
        }

        const mNum = parseInt(matchNumber);
        if (isNaN(mNum)) return res.status(400).json({ success: false, message: 'Invalid match order number' });

        const match = await Match.create({
            stageId,
            matchNumber: mNum,
            mapName,
            scheduledTime,
            customTitle,
            status: 'scheduled'
        });

        res.status(201).json({ success: true, data: { match } });
    } catch (error) {
        next(error);
    }
}

/**
 * GET All Matches (Optimized for both Public and Admin views)
 */
export async function getAllMatches(req, res, next) {
    try {
        const { stageId, status } = req.query;
        const where = {};

        if (stageId) {
            if (!isValidUUID(stageId)) return res.status(400).json({ success: false, message: 'Invalid Stage ID' });
            where.stageId = stageId;
        }

        if (status) where.status = status;

        const matches = await Match.findAll({
            where,
            include: [
                {
                    model: Stage,
                    as: 'stage',
                    include: [{
                        model: Tournament,
                        as: 'tournament',
                        attributes: ['id', 'name', 'game']
                    }]
                },
                { model: MatchResult, as: 'results', include: [{ model: Team, as: 'team' }] },
                { model: PlayerMatchResult, as: 'playerResults' }
            ],
            order: [['matchNumber', 'ASC']]
        });

        res.json({ success: true, data: { matches } });
    } catch (error) {
        next(error);
    }
}

/**
 * GET Single Match
 */
export async function getMatch(req, res, next) {
    try {
        const { id } = req.params;
        if (!isValidUUID(id)) return res.status(404).json({ success: false, message: 'Invalid Match ID' });

        const match = await Match.findByPk(id, {
            include: [
                { model: Stage, as: 'stage' },
                { model: MatchResult, as: 'results', include: [{ model: Team, as: 'team' }] },
                { model: PlayerMatchResult, as: 'playerResults' }
            ]
        });

        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

        res.json({ success: true, data: { match } });
    } catch (error) {
        next(error);
    }
}

/**
 * UPDATE Match Parameters
 */
export async function updateMatch(req, res, next) {
    try {
        const { id } = req.params;
        const { matchNumber, mapName, scheduledTime, customTitle, status } = req.body;

        const match = await Match.findByPk(id);
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

        const stage = await checkStageAccess(match.stageId, req.user.id);
        if (!stage) return res.status(403).json({ success: false, message: 'Forbidden' });

        await match.update({
            matchNumber: matchNumber !== undefined ? parseInt(matchNumber) : match.matchNumber,
            mapName: mapName !== undefined ? mapName : match.mapName,
            scheduledTime: scheduledTime || match.scheduledTime,
            customTitle: customTitle !== undefined ? customTitle : match.customTitle,
            status: status || match.status
        });

        websocketService.emitMatchUpdate(id, { updated: true });
        res.json({ success: true, data: { match } });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE Match (Purge)
 */
export async function deleteMatch(req, res, next) {
    try {
        const { id } = req.params;
        const match = await Match.findByPk(id);
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

        const stage = await checkStageAccess(match.stageId, req.user.id);
        if (!stage) return res.status(403).json({ success: false, message: 'Unauthorized removal' });

        await match.destroy();

        await clearCachePattern('leaderboard:*');
        res.json({ success: true, message: 'Match purged successfully' });
    } catch (error) {
        next(error);
    }
}

/**
 * SUBMIT Results (Single Match Scoring)
 */
export async function submitResult(req, res, next) {
    try {
        const { id } = req.params;
        const { results } = req.body;

        const match = await Match.findByPk(id);
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

        const stage = await checkStageAccess(match.stageId, req.user.id);
        if (!stage) return res.status(403).json({ success: false, message: 'Access denied' });

        // Get Ruleset for the stage
        let ruleset = await Ruleset.findOne({ where: { stageId: match.stageId } });
        if (!ruleset) {
            // Assign default ruleset if missing
            const tournament = await Tournament.findByPk(stage.tournamentId);
            const defaultRules = getDefaultRuleset(tournament.game);
            ruleset = await Ruleset.create({
                stageId: match.stageId,
                ...defaultRules
            });
        }

        const updatedResults = await submitMatchResults(id, results, ruleset.id);

        await match.update({ status: 'completed' });
        websocketService.emitMatchUpdate(id, { results: updatedResults });
        await clearCachePattern('leaderboard:*');

        res.json({ success: true, message: 'Results indexed successfully', data: { results: updatedResults } });
    } catch (error) {
        next(error);
    }
}

/**
 * SUBMIT Bulk Results (Legacy support)
 */
export async function submitBulkResults(req, res, next) {
    return submitResult(req, res, next);
}

/**
 * LOCK/UNLOCK results
 */
export async function lockMatch(req, res, next) {
    try {
        const { id } = req.params;
        const match = await Match.findByPk(id);
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

        const stage = await checkStageAccess(match.stageId, req.user.id);
        if (!stage) return res.status(403).json({ success: false, message: 'Forbidden' });

        const newState = !match.isLocked;
        await match.update({ isLocked: newState });

        res.json({ success: true, message: `Results ${newState ? 'LOCKED' : 'OPENED'}` });
    } catch (error) {
        next(error);
    }
}

/**
 * UPDATE Match Status (Simple Patch)
 */
export async function updateMatchStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const match = await Match.findByPk(id);
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

        const stage = await checkStageAccess(match.stageId, req.user.id);
        if (!stage) return res.status(403).json({ success: false, message: 'Unauthorized' });

        await match.update({ status });
        websocketService.emitMatchUpdate(id, { status });

        res.json({ success: true, data: { match } });
    } catch (error) {
        next(error);
    }
}

export default {
    createMatch,
    getAllMatches,
    getMatch,
    updateMatch,
    deleteMatch,
    submitResult,
    submitBulkResults,
    lockMatch,
    updateMatchStatus
};
