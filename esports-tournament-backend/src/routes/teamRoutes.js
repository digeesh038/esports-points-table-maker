import { Router } from 'express';
import {
    createTeam,
    getAllTeams,
    getTeam,
    updateTeam,
    deleteTeam,
    addPlayer,
    removePlayer,
    updatePlayer,
    deleteAllTeams,
} from '../controllers/teamController.js';
import { authenticate, optionalAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// Public routes
router.get('/', optionalAuth, getAllTeams);
router.get('/:id', getTeam);
router.post('/', optionalAuth, createTeam); // Allow public registration

// Protected routes (Organizer/Owner)
router.put('/:id', authenticate, updateTeam);
router.delete('/:id', authenticate, deleteTeam);
router.delete('/tournament/:tournamentId', authenticate, deleteAllTeams);

// Player Management - Using optionalAuth for now
router.post('/:id/players', optionalAuth, addPlayer);
router.put('/:id/players/:playerId', optionalAuth, updatePlayer);
router.delete('/:id/players/:playerId', optionalAuth, removePlayer);

export default router;
