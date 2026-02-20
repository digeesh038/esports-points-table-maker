import { getTournamentLeaderboard, getStageLeaderboard } from '../services/leaderboardService.js';
import { isValidUUID } from '../utils/helpers.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function getTournamentLeaderboardController(req, res, next) {
    try {
        const { tournamentId } = req.params;

        if (!isValidUUID(tournamentId) && !tournamentId.includes('-')) {
            // If it's not a UUID and doesn't look like a slug, return 404
            // Wait, slugs might not have dashes. But let's check UUID specifically.
        }

        const leaderboard = await getTournamentLeaderboard(tournamentId);

        res.json({
            success: true,
            data: { leaderboard },
        });
    } catch (error) {
        next(error);
    }
}

export async function getStageLeaderboardController(req, res, next) {
    try {
        const { stageId } = req.params;

        if (!isValidUUID(stageId)) {
            return res.status(404).json({ success: false, message: 'Invalid Stage ID' });
        }

        const response = await getStageLeaderboard(stageId);

        res.json({
            success: true,
            data: {
                leaderboard: response.leaderboard,
                killLeaders: response.killLeaders
            },
        });
    } catch (error) {
        next(error);
    }
}

export async function exportStageLeaderboardController(req, res, next) {
    try {
        const { stageId } = req.params;
        if (!isValidUUID(stageId)) {
            return res.status(404).json({ success: false, message: 'Invalid Stage ID' });
        }

        const responseData = await getStageLeaderboard(stageId);
        const standings = Array.isArray(responseData) ? responseData : (responseData.leaderboard || []);

        if (!standings || standings.length === 0) {
            return res.status(404).json({ success: false, message: 'No standings data found for this stage' });
        }

        // Create PDF
        const doc = new jsPDF();

        // Add Title
        doc.setFontSize(20);
        doc.text('OFFICIAL POINTS TABLE', 105, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });

        // Table Data
        const tableColumn = ["RANK", "TEAM", "WIN", "POINT", "KILLS", "TOTAL"];
        const tableRows = standings.map(entry => {
            const wins = entry.wins || 0;
            const kills = entry.totalKills || 0;
            const posPoints = (entry.totalPoints || 0) - kills;
            const total = entry.totalPoints || 0;
            const rank = entry.rank;

            return [
                rank < 10 ? `0${rank}` : rank,
                (entry.teamName || 'Unknown').toUpperCase(),
                wins < 10 && wins > 0 ? `0${wins}` : (wins === 0 ? '-' : wins),
                posPoints < 10 && posPoints >= 0 ? `0${posPoints}` : posPoints,
                kills < 10 ? `0${kills}` : kills,
                total < 10 ? `0${total}` : total
            ];
        });

        // Generate Table
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'striped',
            headStyles: { fillColor: [26, 11, 11], textColor: [255, 255, 255], fontStyle: 'bold' },
            styles: { fontSize: 10, halign: 'center' },
            columnStyles: {
                1: { halign: 'left', fontStyle: 'bold' } // Team Name
            }
        });

        const pdfOutput = doc.output('arraybuffer');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=PointsTable-${stageId}.pdf`);
        res.send(Buffer.from(pdfOutput));
    } catch (error) {
        console.error('[Export] Error generating PDF:', error);
        next(error);
    }
}

export async function recalculateStageLeaderboardController(req, res, next) {
    try {
        const { stageId } = req.params;
        if (!isValidUUID(stageId)) {
            return res.status(404).json({ success: false, message: 'Invalid Stage ID' });
        }

        const { recalculateStageResults } = await import('../services/scoringEngine.js');
        const { clearCachePattern } = await import('../config/redis.js');
        const { getStageLeaderboard } = await import('../services/leaderboardService.js');
        const websocketService = (await import('../services/websocketService.js')).default;

        console.log(`🔄 Recalculating all results for stage: ${stageId}`);
        await recalculateStageResults(stageId);

        // Purge entire leaderboard cache to be safe
        await clearCachePattern('leaderboard:*');

        // Fetch fresh standings and broadcast to all connected nodes
        const freshLeaderboard = await getStageLeaderboard(stageId);
        websocketService.emitStageLeaderboardUpdate(stageId, freshLeaderboard);

        res.json({
            success: true,
            message: 'Points table recalibrated and synchronized.',
            data: { leaderboard: freshLeaderboard }
        });
    } catch (error) {
        console.error('🔥 Recalculation Error:', error);
        next(error);
    }
}

export default {
    getTournamentLeaderboardController,
    getStageLeaderboardController,
    exportStageLeaderboardController,
    recalculateStageLeaderboardController
};
