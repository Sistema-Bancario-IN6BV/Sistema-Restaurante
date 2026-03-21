import { body, param, query } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';
import { USER_ROLES } from './roles.js';

export const validateCreateTable = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),

    param('id')
        .isMongoId()
        .withMessage('El restaurante debe ser un ObjectId válido'),

    body('number')
        .notEmpty()
        .withMessage('El número de mesa es requerido')
        .isInt({ min: 1 })
        .withMessage('El número de mesa debe ser un entero mayor o igual a 1'),

    body('capacity')
        .notEmpty()
        .withMessage('La capacidad es requerida')
        .isInt({ min: 1 })
        .withMessage('La capacidad debe ser al menos 1 persona'),

    body('location')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('La ubicación no puede exceder 200 caracteres'),

    checkValidators,
];

export const validateUpdateTableRequest = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),

    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),

    body('restaurant')
        .optional()
        .isMongoId()
        .withMessage('El restaurante debe ser un ObjectId válido'),

    body('tableNumber')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El número de mesa debe ser un entero mayor o igual a 1'),

    body('capacity')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La capacidad debe ser al menos 1 persona'),

    body('location')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('La ubicación no puede exceder 200 caracteres'),

    checkValidators,
];

export const validateTableActiveChange = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateGetTableById = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateGetTables = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateChangeTableStatus = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    body('status')
        .notEmpty()
        .withMessage('El estado es requerido')
        .isIn(['AVAILABLE', 'OCCUPIED', 'RESERVED'])
        .withMessage('Estado de mesa no válido'),
    checkValidators,
];
