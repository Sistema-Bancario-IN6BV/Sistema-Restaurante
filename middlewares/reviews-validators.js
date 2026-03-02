import { body, param, query } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';
import { USER_ROLES } from './roles.js';

// Crear reseña
export const validateCreateReview = [
    validateJWT,
    body('restaurant')
        .notEmpty()
        .withMessage('El restaurante es requerido')
        .isMongoId()
        .withMessage('El restaurante debe ser un ObjectId válido'),
    body('rating')
        .notEmpty()
        .withMessage('La calificación es requerida')
        .isInt({ min: 1, max: 5 })
        .withMessage('La calificación debe ser entre 1 y 5'),
    body('comment')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('El comentario no puede exceder 500 caracteres'),
    checkValidators,
];

// Actualizar reseña
export const validateUpdateReview = [
    validateJWT,
    body('rating')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('La calificación debe ser entre 1 y 5'),
    body('comment')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('El comentario no puede exceder 500 caracteres'),
    checkValidators,
];

// Activar / Desactivar reseña (solo ADMIN)
export const validateReviewStatusChange = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

// Obtener reseña por ID
export const validateGetReviewById = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

// Obtener lista de reseñas (query params)
export const validateGetReviews = [
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
