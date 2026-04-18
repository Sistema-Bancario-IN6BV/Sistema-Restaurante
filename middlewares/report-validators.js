import { query, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';
import { checkRestaurantPermission } from './check-restaurant-permission.js';
import { USER_ROLES } from './roles.js';

export const validateGetRestaurantStats = [
    validateJWT,
    requireRole(USER_ROLES.RESTAURANT_ADMIN, USER_ROLES.PLATFORM_ADMIN),
    param('id')
        .isMongoId()
        .withMessage('ID del restaurante debe ser un ObjectId válido'),
    checkRestaurantPermission('id'),
    checkValidators,
];

export const validateGetTopDishes = [
    validateJWT,
    requireRole(USER_ROLES.RESTAURANT_ADMIN, USER_ROLES.PLATFORM_ADMIN),
    param('id')
        .isMongoId()
        .withMessage('ID del restaurante debe ser un ObjectId válido'),
    checkRestaurantPermission('id'),
    checkValidators,
];

export const validateGetRevenue = [
    validateJWT,
    requireRole(USER_ROLES.RESTAURANT_ADMIN, USER_ROLES.PLATFORM_ADMIN),
    param('id')
        .isMongoId()
        .withMessage('ID del restaurante debe ser un ObjectId válido'),
    checkRestaurantPermission('id'),
    checkValidators,
];

export const validateGetPeakHours = [
    validateJWT,
    requireRole(USER_ROLES.RESTAURANT_ADMIN, USER_ROLES.PLATFORM_ADMIN),
    param('id')
        .isMongoId()
        .withMessage('ID del restaurante debe ser un ObjectId válido'),
    checkRestaurantPermission('id'),
    checkValidators,
];

export const validateGetGlobalStats = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN),
    checkValidators,
];

export const validateTopSellingParams = [
    query('restaurantId')
        .optional()
        .isMongoId()
        .withMessage('El ID del restaurante debe ser un ObjectId válido'),
    query('limit')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El límite debe ser un entero mayor a 0'),
    checkValidators,
];

export const validatePeakHoursParams = [
    query('restaurantId')
        .optional()
        .isMongoId()
        .withMessage('El ID del restaurante debe ser un ObjectId válido'),
    checkValidators,
];

export const validateRestaurantDemandParams = [
    query('limit')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El límite debe ser un entero mayor a 0'),
    checkValidators,
];

export const validateReservationsStatsParams = [
    query('restaurantId')
        .optional()
        .isMongoId()
        .withMessage('El ID del restaurante debe ser un ObjectId válido'),
    checkValidators,
];

export const validateRestaurantPerformanceParams = [
    param('restaurantId')
        .notEmpty()
        .withMessage('El ID del restaurante es requerido')
        .isMongoId()
        .withMessage('El ID del restaurante debe ser un ObjectId válido'),
    checkValidators,
];

export const validateOrdersByDayParams = [
    query('restaurantId')
        .optional()
        .isMongoId()
        .withMessage('El ID del restaurante debe ser un ObjectId válido'),
    query('days')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Los días deben ser un entero mayor a 0'),
    checkValidators,
];

export const validateGeneralReportParams = [
    checkValidators,
];

export const validateRestaurantReportParams = [
    param('restaurantId')
        .notEmpty()
        .withMessage('El ID del restaurante es requerido')
        .isMongoId()
        .withMessage('El ID del restaurante debe ser un ObjectId válido'),
    checkValidators,
];
