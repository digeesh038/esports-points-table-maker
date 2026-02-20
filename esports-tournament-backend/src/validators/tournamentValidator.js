import { body, param } from 'express-validator';

export const createTournamentValidator = [
    body('organizationId')
        .isUUID()
        .withMessage('Invalid organization ID'),
    body('name')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Tournament name must be at least 3 characters'),
    body('game')
        .trim()
        .notEmpty()
        .withMessage('Game is required'),
    body('format')
        .optional()
        .isIn(['league', 'group_stage', 'bracket', 'swiss'])
        .withMessage('Invalid format'),
    body('maxTeams')
        .optional({ checkFalsy: true })
        .isInt({ min: 2 })
        .withMessage('Max teams must be at least 2'),
    body('startDate')
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage('Invalid start date'),
    body('endDate')
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage('Invalid end date'),
    body('registrationDeadline')
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage('Invalid registration deadline'),
];

export const updateTournamentValidator = [
    param('id')
        .isUUID()
        .withMessage('Invalid tournament ID'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 3 })
        .withMessage('Tournament name must be at least 3 characters'),
];

export default {
    createTournamentValidator,
    updateTournamentValidator,
};
