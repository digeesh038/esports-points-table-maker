import { validationResult } from 'express-validator';
import { Organization, Tournament, User } from '../models/index.js';
import { generateSlug, isValidUUID } from '../utils/helpers.js';

export async function createOrganization(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, description, logo } = req.body;
        const slug = await generateSlug(name, Organization);

        const organization = await Organization.create({
            name,
            slug,
            description,
            logo,
            ownerId: req.user.id,
        });

        res.status(201).json({
            success: true,
            message: 'Organization created successfully',
            data: { organization },
        });
    } catch (error) {
        next(error);
    }
}

export async function getAllOrganizations(req, res, next) {
    try {
        const { mine } = req.query;
        const where = {};

        // If mine=true and user is authenticated, only show their organizations
        if (mine === 'true' && req.user) {
            where.ownerId = req.user.id;
        }

        const organizations = await Organization.findAll({
            where,
            include: [{ model: User, as: 'owner', attributes: ['id', 'name'] }],
        });

        res.json({ success: true, data: { organizations } });
    } catch (error) {
        next(error);
    }
}

export async function getOrganization(req, res, next) {
    try {
        const { id } = req.params;

        if (!isValidUUID(id)) {
            return res.status(404).json({ success: false, message: 'Invalid Organization ID' });
        }

        const organization = await Organization.findByPk(id, {
            include: [
                { model: User, as: 'owner', attributes: ['id', 'name'] },
                { model: Tournament, as: 'tournaments' },
            ],
        });

        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        res.json({ success: true, data: { organization } });
    } catch (error) {
        next(error);
    }
}

export async function updateOrganization(req, res, next) {
    try {
        const { id } = req.params;
        const organization = await Organization.findByPk(id);

        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        if (organization.ownerId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await organization.update(req.body);
        res.json({ success: true, data: { organization } });
    } catch (error) {
        next(error);
    }
}

export async function deleteOrganization(req, res, next) {
    try {
        const { id } = req.params;
        const organization = await Organization.findByPk(id);

        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        if (organization.ownerId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await organization.destroy();
        res.json({ success: true, message: 'Organization deleted successfully' });
    } catch (error) {
        next(error);
    }
}

export default {
    createOrganization,
    getAllOrganizations,
    getOrganization,
    updateOrganization,
    deleteOrganization,
};
