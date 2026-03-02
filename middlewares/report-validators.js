import { query } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';
import { USER_ROLES } from './roles.js';

const baseReportQueryValidators = [
    query('from')
        .optional()
        .isISO8601()
        .withMessage('La fecha inicial debe estar en formato ISO8601'),
    query('to')
        .optional()
        .isISO8601()
        .withMessage('La fecha final debe estar en formato ISO8601'),
    query('restaurantId')
        .optional()
        .isMongoId()
        .withMessage('restaurantId debe ser un ObjectId válido')
];

export const validateGetReport = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN),
    ...baseReportQueryValidators,
    checkValidators
];

export const validateExportReport = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN),
    ...baseReportQueryValidators,
    query('format')
        .optional()
        .isIn(['pdf', 'excel'])
        .withMessage('El formato debe ser pdf o excel'),
    checkValidators
];