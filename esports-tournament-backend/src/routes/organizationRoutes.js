import { Router } from 'express';
import {
    createOrganization,
    getAllOrganizations,
    getOrganization,
    updateOrganization,
    deleteOrganization,
} from '../controllers/organizationController.js';
import { authenticate, optionalAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// Public routes
router.get('/', optionalAuth, getAllOrganizations);
router.get('/:id', getOrganization);

// Protected routes
router.post('/', authenticate, createOrganization);
router.put('/:id', authenticate, updateOrganization);
router.delete('/:id', authenticate, deleteOrganization);

export default router;
