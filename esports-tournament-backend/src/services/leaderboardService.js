import { Team, MatchResult, Tournament, Stage, Match } from '../models/index.js';
import { sequelize } from '../config/database.js';
import { getCache, setCache } from '../config/redis.js';

/**
 * Get leaderboard for a tournament
 */
export const getTournamentLeaderboard = async (tournamentId) => {
    try {
        // Resolve ID if slug is provided
        let actualId = tournamentId;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tournamentId);

        if (!isUuid) {
            const tournament = await Tournament.findOne({ where: { slug: tournamentId } });
            if (!tournament) throw new Error('Tournament not found');
            actualId = tournament.id;
        }

        // Check cache first
        const cacheKey = `leaderboard:tournament:${actualId}`;
        const cached = await getCache(cacheKey);
        if (cached) {
            return cached;
        }

        // Get all teams with their match results
        const teams = await Team.findAll({
            where: { tournamentId: actualId },
            include: [
                {
                    model: MatchResult,
                    as: 'results',
                    include: [
                        {
                            model: Match,
                            as: 'match',
                            attributes: ['status'],
                            where: { status: 'completed' },
                            required: false,
                        },
                    ],
                },
            ],
        });

        // Calculate total points for each team
        const leaderboard = teams.map(team => {
            const completedResults = team.results.filter(
                r => r.match && r.match.status === 'completed'
            );

            const totalKills = completedResults.reduce((sum, r) => sum + r.kills, 0);
            const totalPoints = completedResults.reduce((sum, r) => sum + r.totalPoints, 0);
            const placementPoints = completedResults.reduce((sum, r) => sum + r.placementPoints, 0);
            const matchesPlayed = completedResults.length;
            const wins = completedResults.filter(r => r.placement === 1).length;
            const top5s = completedResults.filter(r => r.placement <= 5).length;

            // Calculate average placement
            const avgPlacement = matchesPlayed > 0
                ? completedResults.reduce((sum, r) => sum + r.placement, 0) / matchesPlayed
                : 0;

            return {
                teamId: team.id,
                teamName: team.name,
                teamTag: team.tag,
                teamLogo: team.logo,
                totalPoints,
                totalKills,
                placementPoints,
                matchesPlayed,
                wins,
                top5s,
                avgPlacement: Math.round(avgPlacement * 100) / 100,
            };
        });

        // Sort by total points (descending)
        leaderboard.sort((a, b) => {
            if (b.totalPoints !== a.totalPoints) {
                return b.totalPoints - a.totalPoints;
            }
            // Tiebreaker: total kills
            return b.totalKills - a.totalKills;
        });

        // Add rank
        leaderboard.forEach((team, index) => {
            team.rank = index + 1;
        });

        // Cache for 5 minutes
        await setCache(cacheKey, leaderboard, 300);

        return leaderboard;
    } catch (error) {
        console.error('Error getting tournament leaderboard:', error);
        throw error;
    }
};

/**
 * Get leaderboard for a specific stage
 */
export const getStageLeaderboard = async (stageId) => {
    try {
        const cacheKey = `leaderboard:stage:${stageId}`;
        const cached = await getCache(cacheKey);
        if (cached) {
            return cached;
        }

        // Get stage with tournament info
        const stage = await Stage.findByPk(stageId, {
            include: [{ model: Tournament, as: 'tournament' }],
        });

        if (!stage) {
            throw new Error('Stage not found');
        }

        const { Player, PlayerMatchResult } = await import('../models/index.js');
        // Get all teams for this tournament
        const teams = await Team.findAll({
            where: {
                tournamentId: stage.tournamentId,
            },
            include: [
                { model: Player, as: 'players' },
                {
                    model: MatchResult,
                    as: 'results',
                    include: [
                        {
                            model: Match,
                            as: 'match',
                            where: { stageId, status: 'completed' },
                            required: false,
                        },
                    ],
                },
                {
                    model: PlayerMatchResult,
                    as: 'playerMatchResults',
                    required: false,
                    include: [
                        {
                            model: Match,
                            as: 'match',
                            where: { stageId },
                            attributes: ['id'],
                        }
                    ]
                }
            ],
        });

        // Calculate points
        const leaderboard = teams.map(team => {
            const stageResults = team.results.filter(
                r => r.match && r.match.stageId === stageId && r.match.status === 'completed'
            );

            const totalKills = stageResults.reduce((sum, r) => sum + r.kills, 0);
            const totalPoints = stageResults.reduce((sum, r) => sum + r.totalPoints, 0);
            const placementPoints = stageResults.reduce((sum, r) => sum + r.placementPoints, 0);
            const matchesPlayed = stageResults.length;

            const avgPlacement = matchesPlayed > 0
                ? stageResults.reduce((sum, r) => sum + r.placement, 0) / matchesPlayed
                : 0;

            // Get last 5 placements for form analysis
            const recentPlacements = stageResults
                .sort((a, b) => new Date(b.match.scheduledTime) - new Date(a.match.scheduledTime))
                .slice(0, 5)
                .map(r => r.placement);

            const wins = stageResults.filter(r => r.placement === 1).length;
            const top5s = stageResults.filter(r => r.placement <= 5).length;

            // Map player stats for this stage
            const playerStats = (team.players || []).map(player => {
                const killsInStage = (team.playerMatchResults || [])
                    .filter(pmr => pmr.playerId === player.id && pmr.match)
                    .reduce((sum, pmr) => sum + pmr.kills, 0);

                return {
                    id: player.id,
                    name: player.inGameName,
                    kills: killsInStage
                };
            }).sort((a, b) => b.kills - a.kills);

            return {
                teamId: team.id,
                teamName: team.name,
                teamTag: team.tag,
                teamLogo: team.logo,
                totalPoints,
                totalKills,
                matchesPlayed,
                avgPlacement: Math.round(avgPlacement * 100) / 100,
                recentPlacements,
                strikeRate: matchesPlayed > 0 ? Math.round((totalPoints / matchesPlayed) * 10) / 10 : 0,
                wins,
                top5s,
                players: playerStats
            };
        });

        // Sort leaderboard by points then kills
        leaderboard.sort((a, b) => {
            if (b.totalPoints !== a.totalPoints) {
                return b.totalPoints - a.totalPoints;
            }
            return b.totalKills - a.totalKills;
        });

        // Assign Rank
        leaderboard.forEach((team, index) => {
            team.rank = index + 1;
        });

        // Calculate Kill Leaders (individual performance)
        const killLeaders = [];
        teams.forEach(team => {
            const stageResults = team.results.filter(
                r => r.match && r.match.stageId === stageId && r.match.status === 'completed'
            );

            stageResults.forEach(res => {
                if (res.topPlayerName) {
                    const existing = killLeaders.find(l => l.name === res.topPlayerName);
                    if (existing) {
                        existing.kills += res.kills;
                        existing.mvpCount += 1;
                    } else {
                        killLeaders.push({
                            name: res.topPlayerName,
                            teamName: team.name,
                            teamLogo: team.logo,
                            kills: res.kills,
                            mvpCount: 1
                        });
                    }
                }
            });
        });

        // Sort kill leaders by MVP count then total kills
        killLeaders.sort((a, b) => {
            if (b.mvpCount !== a.mvpCount) return b.mvpCount - a.mvpCount;
            return b.kills - a.kills;
        });

        const responseData = {
            leaderboard,
            killLeaders: killLeaders.slice(0, 5) // Top 5
        };

        await setCache(cacheKey, responseData, 300);

        return responseData;
    } catch (error) {
        console.error('Error getting stage leaderboard:', error);
        throw error;
    }
};

/**
 * Update leaderboard values in Redis using Sorted Sets
 */
export const updateLeaderboardValues = async (stageId, teamId, pointsDiff, killsDiff) => {
    try {
        const redisKeys = {
            points: `lb:stage:${stageId}:points`,
            kills: `lb:stage:${stageId}:kills`
        };

        const redis = await import('../config/redis.js').then(m => m.default);
        if (!redis) return;

        // Atomically increment points and kills
        await redis.zincrby(redisKeys.points, pointsDiff, teamId);
        await redis.zincrby(redisKeys.kills, killsDiff, teamId);

        // Clear the cache so broadcastUpdate fetches fresh data
        const cacheKey = `leaderboard:stage:${stageId}`;
        const { deleteCache } = await import('../config/redis.js');
        await deleteCache(cacheKey);

        // Notify subscribers via WebSocket
        await broadcastUpdate(stageId);
    } catch (error) {
        console.error('Error updating redis leaderboard:', error);
    }
};

/**
 * Broadcast leaderboard update to all connected clients for a stage
 */
export const broadcastUpdate = async (stageId) => {
    try {
        const websocketService = await import('./websocketService.js').then(m => m.default);
        const data = await getStageLeaderboard(stageId);

        websocketService.broadcastToRoom(`stage:${stageId}`, 'leaderboard_update', {
            stageId,
            leaderboard: data
        });
    } catch (error) {
        console.error('Error broadcasting update:', error);
    }
};

export default {
    getTournamentLeaderboard,
    getStageLeaderboard,
    updateLeaderboardValues,
    broadcastUpdate
};
