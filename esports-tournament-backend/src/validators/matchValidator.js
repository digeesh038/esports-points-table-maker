import { body, param } from 'express-validator';

export const submitResultValidator = [
    param('id')
        .isUUID()
        .withMessage('Invalid match ID'),
    body('results')
        .isArray({ min: 1 })
        .withMessage('Results must be an array with at least one entry'),
    body('results.*.teamId')
        .isUUID()
        .withMessage('Invalid team ID'),
    body('results.*.kills')
        .isInt({ min: 0 })
        .withMessage('Kills must be a non-negative integer'),
    body('results.*.placement')
        .isInt({ min: 1 })
        .withMessage('Placement must be a positive integer'),
];

export default {
    submitResultValidator,
};
