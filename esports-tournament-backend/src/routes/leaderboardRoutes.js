import { Router } from 'express';
import {
    getTournamentLeaderboardController,
    getStageLeaderboardController,
    exportStageLeaderboardController,
    recalculateStageLeaderboardController
} from '../controllers/leaderboardController.js';

const router = Router();

// Leaderboard routes
router.get('/tournament/:tournamentId', getTournamentLeaderboardController);
router.get('/stage/:stageId', getStageLeaderboardController);
router.post('/stage/:stageId/recalculate', recalculateStageLeaderboardController);
router.get('/stage/:stageId/export', exportStageLeaderboardController);

export default router;
