import { body, param, query } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';

export const validateCreateTable = [
    validateJWT,
    requireRole('ADMIN_ROLE'),

    body('restaurant')
        .notEmpty()
        .withMessage('El restaurante es requerido')
        .isMongoId()
        .withMessage('El restaurante debe ser un ObjectId válido'),

    body('tableNumber')
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
    requireRole('ADMIN_ROLE'),

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

export const validateTableStatusChange = [
    validateJWT,
    requireRole('ADMIN_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateGetTableById = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateGetTables = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número mayor a 0'),

    query('limit')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El límite debe ser un número mayor a 0'),

    query('restaurant')
        .optional()
        .isMongoId()
        .withMessage('El restaurante debe ser un ObjectId válido'),

    checkValidators,
];
