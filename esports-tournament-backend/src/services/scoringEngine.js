import { Ruleset, MatchResult } from '../models/index.js';

/**
 * Game presets for scoring rules
 */
export const GAME_PRESETS = {
    FREE_FIRE: {
        killPoints: { perKill: 1 },
        placementPoints: { 1: 12, 2: 9, 3: 8, 4: 7, 5: 5, 6: 4, 7: 3, 8: 2, 9: 1, 10: 1, 11: 0, 12: 0 },
        multiplier: 1.0,
        tieBreakers: ['total_kills', 'highest_placement', 'head_to_head']
    },
    BGMI: {
        killPoints: { perKill: 1 },
        placementPoints: { 1: 15, 2: 12, 3: 10, 4: 8, 5: 6, 6: 4, 7: 2, 8: 1, 9: 1, 10: 1 },
        multiplier: 1.0,
        tieBreakers: ['total_kills', 'highest_placement', 'head_to_head']
    },
    VALORANT: {
        killPoints: { perKill: 1 },
        placementPoints: { 1: 10, 2: 0 }, // Round based
        multiplier: 1.0,
        tieBreakers: ['rounds_won', 'kda']
    }
};

/**
 * Get default ruleset configuration
 */
export const getDefaultRuleset = (game = 'GENERIC') => {
    const preset = GAME_PRESETS[game.toUpperCase()] || {
        killPoints: { perKill: 1 },
        placementPoints: {
            1: 15, 2: 12, 3: 10, 4: 8, 5: 6,
            6: 4, 7: 2, 8: 1, 9: 0, 10: 0
        },
        multiplier: 1.0,
        tieBreakers: ['total_kills', 'highest_single_match_score']
    };
    return preset;
};

/**
 * Calculate points for a team's performance in a match
 */
export const calculateMatchPoints = (kills, placement, ruleset) => {
    const { killPoints, placementPoints, bonusRules, multiplier = 1.0 } = ruleset;

    // Calculate kill points
    const killPts = kills * (killPoints.perKill || 1);

    // Calculate placement points
    const placementPts = (placementPoints[placement] || 0);

    // Calculate bonus points
    let bonusPts = 0;
    if (bonusRules) {
        // Example: First blood, 3+ kills bonus, etc.
        if (bonusRules.threeKillBonus && kills >= 3) bonusPts += bonusRules.threeKillBonusValue || 2;
    }

    const totalPts = (killPts + placementPts + bonusPts) * multiplier;

    return {
        killPoints: killPts,
        placementPoints: placementPts,
        bonusPoints: bonusPts,
        totalPoints: Math.round(totalPts * 100) / 100, // Round to 2 decimal places
    };
};

/**
 * Submit match results and calculate points
 */
export const submitMatchResults = async (matchId, resultsData, rulesetId) => {
    try {
        const { default: leaderboardService } = await import('./leaderboardService.js');
        const { default: Match } = await import('../models/Match.js');

        const match = await Match.findByPk(matchId);
        if (!match) throw new Error('Match not found');

        // Get ruleset
        const ruleset = await Ruleset.findByPk(rulesetId);
        if (!ruleset) {
            throw new Error('Ruleset not found');
        }

        const results = [];

        // Process each team's result
        for (const data of resultsData) {
            const { teamId, kills, placement, topPlayerName, topPlayerId } = data;

            // Calculate points
            const points = calculateMatchPoints(kills, placement, {
                killPoints: ruleset.killPoints,
                placementPoints: ruleset.placementPoints,
                multiplier: ruleset.multiplier,
                bonusRules: ruleset.bonusRules,
            });

            // Check if result exists
            const existingResult = await MatchResult.findOne({
                where: { matchId, teamId }
            });

            let pointsDiff = points.totalPoints;
            let killsDiff = kills;

            if (existingResult) {
                pointsDiff = points.totalPoints - existingResult.totalPoints;
                killsDiff = kills - existingResult.kills;

                // Update existing
                await existingResult.update({
                    kills,
                    placement,
                    killPoints: points.killPoints,
                    placementPoints: points.placementPoints,
                    bonusPoints: points.bonusPoints,
                    totalPoints: points.totalPoints,
                    topPlayerName,
                    topPlayerId,
                });
                results.push(existingResult);
            } else {
                // Create new
                const result = await MatchResult.create({
                    matchId,
                    teamId,
                    kills,
                    placement,
                    killPoints: points.killPoints,
                    placementPoints: points.placementPoints,
                    bonusPoints: points.bonusPoints,
                    totalPoints: points.totalPoints,
                    topPlayerName,
                    topPlayerId,
                });
                results.push(result);
            }

            // Handle individual player kills if provided
            if (data.playerResults && Array.isArray(data.playerResults)) {
                const { PlayerMatchResult } = await import('../models/index.js');
                for (const pk of data.playerResults) {
                    if (pk.playerId) {
                        await PlayerMatchResult.upsert({
                            matchId,
                            teamId,
                            playerId: pk.playerId,
                            kills: pk.kills || 0
                        }, {
                            where: { matchId, teamId, playerId: pk.playerId }
                        });
                    }
                }
            }

            // Atomically update leaderboard in Redis
            await leaderboardService.updateLeaderboardValues(
                match.stageId,
                teamId,
                pointsDiff,
                killsDiff
            );
        }

        return results;
    } catch (error) {
        console.error('Error submitting match results:', error);
        throw error;
    }
};

/**
 * Recalculate all match results for a stage (if ruleset changes)
 */
export const recalculateStageResults = async (stageId) => {
    try {
        const ruleset = await Ruleset.findOne({ where: { stageId } });
        if (!ruleset) {
            throw new Error('Ruleset not found for this stage');
        }

        const results = await MatchResult.findAll({
            include: [{
                association: 'match',
                where: { stageId },
                attributes: [],
            }],
        });

        const updated = [];

        for (const result of results) {
            const points = calculateMatchPoints(
                result.kills,
                result.placement,
                {
                    killPoints: ruleset.killPoints,
                    placementPoints: ruleset.placementPoints,
                    bonusRules: ruleset.bonusRules,
                    multiplier: ruleset.multiplier,
                }
            );

            await result.update({
                killPoints: points.killPoints,
                placementPoints: points.placementPoints,
                bonusPoints: points.bonusPoints,
                totalPoints: points.totalPoints,
            });

            updated.push(result);
        }

        return updated;
    } catch (error) {
        console.error('Error recalculating stage results:', error);
        throw error;
    }
};

export default {
    getDefaultRuleset,
    calculateMatchPoints,
    submitMatchResults,
    recalculateStageResults,
};
