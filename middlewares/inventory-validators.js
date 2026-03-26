'use strict';

import { body, param, query } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';
import { checkEntityRestaurantPermission, checkCreateRestaurantPermission } from './check-restaurant-permission.js';

export const validateUpdateIngredientId = [
    validateJWT,
    requireRole('PLATFORM_ADMIN', 'RESTAURANT_ADMIN'),
    param('id').isMongoId().withMessage('ID inválido'),
    checkEntityRestaurantPermission('Ingredient', 'restaurantId', 'id'),
    checkValidators,
];

export const validateRestockIngredientId = [
    validateJWT,
    requireRole('PLATFORM_ADMIN', 'RESTAURANT_ADMIN'),
    param('id').isMongoId().withMessage('ID inválido'),
    checkEntityRestaurantPermission('Ingredient', 'restaurantId', 'id'),
    body('quantity').isFloat({ min: 0.01 }).withMessage('Cantidad debe ser mayor a 0'),
    checkValidators,
];

export const validateDeleteIngredientId = [
    validateJWT,
    requireRole('PLATFORM_ADMIN', 'RESTAURANT_ADMIN'),
    param('id').isMongoId().withMessage('ID inválido'),
    checkEntityRestaurantPermission('Ingredient', 'restaurantId', 'id'),
    checkValidators,
];
