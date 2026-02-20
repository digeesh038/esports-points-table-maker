import { Router } from 'express';
import {
    createTournament,
    getAllTournaments,
    getTournament,
    updateTournament,
    deleteTournament,
    forceDeleteTournament,
    getStages,
    createStage,
    deleteStage,
    exportTournamentTeams
} from '../controllers/tournamentController.js';
import { authenticate, optionalAuth } from '../middlewares/authMiddleware.js';
import { createTournamentValidator, updateTournamentValidator } from '../validators/tournamentValidator.js';

const router = Router();

// Public routes
router.get('/', optionalAuth, getAllTournaments);
router.get('/:id/teams/export', exportTournamentTeams);
router.get('/:id', getTournament);

// Protected routes
router.post('/', authenticate, createTournamentValidator, createTournament);
router.put('/:id', authenticate, updateTournamentValidator, updateTournament);
router.get('/:id/stages', optionalAuth, getStages);
router.post('/:id/stages', authenticate, createStage);
router.delete('/:id/stages/:stageId', authenticate, deleteStage);
router.delete('/:id/force-delete', authenticate, forceDeleteTournament);
router.delete('/:id', authenticate, deleteTournament);

export default router;
