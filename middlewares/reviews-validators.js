import { body, param, query } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';
import { checkEntityRestaurantPermission, checkCreateRestaurantPermission } from './check-restaurant-permission.js';
import { USER_ROLES } from './roles.js';

export const validateCreateReview = [
    validateJWT,
    body('restaurantId')
        .notEmpty()
        .withMessage('El restaurante es requerido')
        .isMongoId()
        .withMessage('El restaurante debe ser un ObjectId válido'),
    body('orderId')
        .notEmpty()
        .withMessage('La orden es requerida')
        .isMongoId()
        .withMessage('La orden debe ser un ObjectId válido'),
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

export const validateReviewStatusChange = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateGetReviewById = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateGetReviews = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número mayor a 0'),
    query('limit')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El límite debe ser un número mayor a 0'),
    query('restaurantId')
        .optional()
        .isMongoId()
        .withMessage('El restaurante debe ser un ObjectId válido'),
    checkValidators,
];

export const validateGetReviewsByRestaurant = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateDeleteReview = [
    validateJWT,
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateReplyToReview = [
    validateJWT,
    requireRole(USER_ROLES.RESTAURANT_ADMIN, USER_ROLES.PLATFORM_ADMIN),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkEntityRestaurantPermission('Review', 'restaurantId', 'id'),
    checkValidators,
];
