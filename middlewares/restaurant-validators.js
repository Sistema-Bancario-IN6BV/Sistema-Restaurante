
'use strict';
import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';

export const validateCreate = [
    validateJWT,
    requireRole('PLATFORM_ADMIN'),
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 100 }).withMessage('Entre 2 y 100 caracteres'),
    body('address.city')
        .trim()
        .notEmpty().withMessage('La ciudad es requerida'),
    body('category')
        .notEmpty().withMessage('La categoria es requerida')
        .isIn(['ITALIANA', 'MEXICANA', 'JAPONESA', 'CHINA', 'FRANCESA', 'AMERICANA', 'GUATEMALTECA', 'MARISCOS', 'VEGETARIANA', 'VEGANA', 'PARRILLA', 'PIZZERIA', 'CAFE', 'SUSHI', 'TAPAS', 'FUSION', 'PERUANA', 'OTRA']).withMessage('Categoría inválida'),
    body('adminIds')
        .optional()
        .isArray().withMessage('adminIds debe ser un arreglo'),
    body('adminId')
        .optional()
        .isString().withMessage('AdminId debe ser una cadena válida'),
    body().custom(value => {
        if (!value.adminId && (!value.adminIds || value.adminIds.length === 0)) {
            throw new Error('Debe proporcionar adminId o adminIds con al menos un administrador');
        }
        return true;
    }),
    checkValidators,
];

export const validateUpdate = [
    validateJWT,
    requireRole('PLATFORM_ADMIN', 'RESTAURANT_ADMIN'),
    param('id').isMongoId().withMessage('ID inválido de MongoDB'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Entre 2 y 100 caracteres'),
    body('address.city')
        .optional()
        .trim()
        .notEmpty().withMessage('La ciudad es requerida'),
    body('category')
        .optional()
        .isIn(['ITALIANA', 'MEXICANA', 'JAPONESA', 'CHINA', 'FRANCESA', 'AMERICANA', 'GUATEMALTECA', 'MARISCOS', 'VEGETARIANA', 'VEGANA', 'PARRILLA', 'PIZZERIA', 'CAFE', 'SUSHI', 'TAPAS', 'FUSION', 'PERUANA', 'OTRA']).withMessage('Categoría inválida'),
    checkValidators,
];

export const validateGetById = [
    param('id').isMongoId().withMessage('ID inválido de MongoDB'),
    checkValidators,
];
