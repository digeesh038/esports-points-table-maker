import { Organization, Tournament, Team, Match, Stage, Payment } from '../models/index.js';

export async function getDashboardStats(req, res, next) {
    try {
        const userId = req.user.id;

        // Fetch organizations owned by user
        const orgs = await Organization.findAll({
            where: { ownerId: userId },
            attributes: ['id']
        });
        const orgIds = orgs.map(o => o.id);

        // Fetch tournaments belonging to those organizations
        const tournaments = await Tournament.findAll({
            where: { organizationId: orgIds },
            attributes: ['id']
        });
        const tournamentIds = tournaments.map(t => t.id);

        // Fetch total teams in those tournaments
        const teamCount = await Team.count({
            where: { tournamentId: tournamentIds, status: 'approved' }
        });

        // Fetch total matches in those tournaments
        const stages = await Stage.findAll({
            where: { tournamentId: tournamentIds },
            attributes: ['id']
        });
        const stageIds = stages.map(s => s.id);

        const completedMatchCount = await Match.count({
            where: { stageId: stageIds, status: 'completed' }
        });

        const totalMatchCount = await Match.count({
            where: { stageId: stageIds }
        });

        // Calculate Revenue
        const totalRevenue = await Payment.sum('amount', {
            where: { tournamentId: tournamentIds, status: 'SUCCESS' }
        }) || 0;

        res.json({
            success: true,
            data: {
                organizations: orgIds.length,
                tournaments: tournamentIds.length,
                activeTeams: teamCount,
                completedMatches: completedMatchCount,
                totalMatches: totalMatchCount,
                revenue: totalRevenue
            }
        });
    } catch (error) {
        next(error);
    }
}
