import { Organization, Tournament, Team, Match, Stage, User } from './src/models/index.js';
import fs from 'fs';

async function check(userId) {
    let out = `Checking stats for User ID: ${userId}\n`;
    try {
        const orgs = await Organization.findAll({
            where: { ownerId: userId }
        });
        const orgIds = orgs.map(o => o.id);
        out += `Found Orgs: ${orgs.length} (${orgIds.join(', ')})\n`;

        const tournaments = await Tournament.findAll({
            where: { organizationId: orgIds }
        });
        const tournamentIds = tournaments.map(t => t.id);
        out += `Found Tournaments: ${tournaments.length} (${tournamentIds.join(', ')})\n`;

        const teamCount = await Team.count({
            where: { tournamentId: tournamentIds }
        });
        out += `Team Count: ${teamCount}\n`;

        const stages = await Stage.findAll({
            where: { tournamentId: tournamentIds }
        });
        const stageIds = stages.map(s => s.id);
        out += `Found Stages: ${stages.length} (${stageIds.join(', ')})\n`;

        const matchCount = await Match.count({
            where: { stageId: stageIds }
        });
        out += `Match Count: ${matchCount}\n`;

        if (tournamentIds.length > 0) {
            const sampleTour = await Tournament.findByPk(tournamentIds[0]);
            out += `Sample Tournament ${sampleTour.name} OrgId: ${sampleTour.organizationId}\n`;
        }

        fs.writeFileSync('debug_stats_results.log', out);
        process.exit(0);
    } catch (e) {
        fs.writeFileSync('debug_stats_results.log', out + '\n' + e.stack);
        process.exit(1);
    }
}

// User ID from the requester in debug_auth.log
check('d6aee70c-e136-428a-94c7-aa89df288fd3');
