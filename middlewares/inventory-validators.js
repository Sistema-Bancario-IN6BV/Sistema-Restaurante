'use strict';

import { body, param, query } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';
import { checkEntityRestaurantPermission , checkCreateRestaurantPermission} from './check-restaurant-permission.js';

export const validateCreateIngredient = [
    validateJWT,
    requireRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    checkCreateRestaurantPermission('restaurantId'),
    body('restaurantId').isMongoId().withMessage('Restaurante inválido'),
    body('name').notEmpty().trim().withMessage('Nombre requerido'),
    body('costPerUnit').optional().isFloat({ min: 0 }).withMessage('Costo debe ser positivo'),
    body('unit').toUpperCase().isIn(['KG', 'G', 'LT', 'ML', 'UNIT', 'DOZEN', 'POUND', 'OZ']).withMessage('Unidad inválida'),
    body('currentStock').isFloat({ min: 0 }).withMessage('Stock actual debe ser número positivo'),
    body('minStock').isFloat({ min: 0 }).withMessage('Stock mínimo debe ser número positivo'),
    body('supplier').optional().isString().trim(),
    checkValidators,
];

export const validateGetInventory = [
    param('restaurantId').isMongoId().withMessage('ID restaurante inválido'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('lowStock').optional().isIn(['true', 'false']),
    checkValidators,
];

export const validateIngredientId = [
    param('id').isMongoId().withMessage('ID de ingrediente inválido'),
    checkValidators,
];

export const validateIngredientIdAdmin = [
    validateJWT,
    requireRole('RESTAURANT_ADMIN'),
    param('id').isMongoId().withMessage('ID de ingrediente inválido'),
    checkValidators,
];

export const validateUpdateIngredient = [
    validateJWT,
    requireRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    param('id').isMongoId().withMessage('ID de ingrediente inválido'),
    checkEntityRestaurantPermission('Ingredient', 'restaurantId', 'id'),
    body('name').optional().notEmpty().trim().withMessage('Nombre requerido'),
    body('costPerUnit').optional().isFloat({ min: 0 }).withMessage('Costo debe ser positivo'),
    body('unit').optional().toUpperCase().isIn(['KG', 'G', 'LT', 'ML', 'UNIT', 'DOZEN', 'POUND', 'OZ']).withMessage('Unidad inválida'),
    body('minStock').optional().isFloat({ min: 0 }).withMessage('Stock mínimo debe ser número positivo'),
    body('supplier').optional().isString().trim(),
    body('expiryDate').optional().isISO8601(),
    checkValidators,
];

export const validateRestockIngredient = [
    validateJWT,
    requireRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    param('id').isMongoId().withMessage('ID de ingrediente inválido'),
    checkEntityRestaurantPermission('Ingredient', 'restaurantId', 'id'),
    body('quantity').isInt({ min: 1 }).withMessage('Cantidad debe ser mínimo 1'),
    checkValidators,
];

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
