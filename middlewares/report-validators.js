import { query, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';

// Validadores para endpoints de reportes
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
    // No se requieren parámetros adicionales por ahora
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
