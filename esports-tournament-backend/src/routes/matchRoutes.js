import { Router } from 'express';
import {
    createMatch,
    getAllMatches,
    getMatch,
    updateMatchStatus,
    submitResult,
    submitBulkResults,
    lockMatch,
    deleteMatch,
    updateMatch,
} from '../controllers/matchController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { submitResultValidator } from '../validators/matchValidator.js';

const router = Router();

// Public routes
router.get('/', getAllMatches);
router.get('/:id', getMatch);

// Protected routes
router.post('/', authenticate, createMatch);
router.put('/:id', authenticate, updateMatch);
router.patch('/:id/status', authenticate, updateMatchStatus);
router.post('/:id/result', authenticate, submitResultValidator, submitResult);
router.post('/:id/result/bulk', authenticate, submitBulkResults);
router.patch('/:id/lock', authenticate, lockMatch);
router.delete('/:id', authenticate, deleteMatch);

export default router;