import { body, param, query } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';
import { checkEntityRestaurantPermission, checkCreateRestaurantPermission } from './check-restaurant-permission.js';
import { USER_ROLES } from './roles.js';

export const validateCreateMenuItem = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),
    checkCreateRestaurantPermission('restaurant'),

    body('restaurant')
        .notEmpty()
        .withMessage('El restaurante es requerido')
        .isMongoId()
        .withMessage('El restaurante debe ser un ObjectId válido'),

    body('name')
        .trim()
        .notEmpty()
        .withMessage('El nombre del platillo es requerido')
        .isLength({ min: 2, max: 150 })
        .withMessage('El nombre debe tener entre 2 y 150 caracteres'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres'),

    body('price')
        .notEmpty()
        .withMessage('El precio es requerido')
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser mayor o igual a 0'),

    body('type')
        .notEmpty()
        .withMessage('El tipo es requerido')
        .isIn(['STARTER', 'MAIN', 'DESSERT', 'DRINK', 'SIDE', 'SOUP', 'SALAD', 'APPETIZER', 'ENTRADA', 'PLATO_FUERTE', 'POSTRE', 'BEBIDA'])
        .withMessage('Tipo de platillo no válido'),

    body('inventoryIngredients')
        .optional()
        .isArray()
        .withMessage('inventoryIngredients debe ser un arreglo'),
    body('inventoryIngredients.*.ingredientId')
        .optional()
        .isMongoId()
        .withMessage('ID de ingrediente inválido'),
    body('inventoryIngredients.*.quantity')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Cantidad inválida'),

    checkValidators,
];

export const validateUpdateMenuItemRequest = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),

    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),

    body('restaurant')
        .optional()
        .isMongoId()
        .withMessage('El restaurante debe ser un ObjectId válido'),

    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 150 })
        .withMessage('El nombre debe tener entre 2 y 150 caracteres'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres'),

    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser mayor o igual a 0'),

    body('type')
        .optional()
        .isIn(['ENTRADA', 'PLATO_FUERTE', 'POSTRE', 'BEBIDA'])
        .withMessage('Tipo de platillo no válido'),

    checkValidators,
];

export const validateMenuItemStatusChange = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),

    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),

    checkValidators,
];

export const validateGetMenuItemById = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),

    checkValidators,
];

export const validateUpdateMenuItemId = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),
    param('itemId').isMongoId().withMessage('ID inválido'),
    checkEntityRestaurantPermission('MenuItem', 'restaurantId', 'itemId'),
    checkValidators,
];

export const validateToggleAvailabilityId = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),
    param('itemId').isMongoId().withMessage('ID inválido'),
    checkEntityRestaurantPermission('MenuItem', 'restaurantId', 'itemId'),
    checkValidators,
];

export const validateDeleteMenuItemId = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),
    param('itemId').isMongoId().withMessage('ID inválido'),
    checkEntityRestaurantPermission('MenuItem', 'restaurantId', 'itemId'),
    checkValidators,
];

export const validateUploadMenuItemPhotoId = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),
    param('itemId').isMongoId().withMessage('ID inválido'),
    checkEntityRestaurantPermission('MenuItem', 'restaurantId', 'itemId'),
    checkValidators,
];

export const validateLinkIngredients = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),
    param('itemId').isMongoId().withMessage('ID inválido'),
    checkEntityRestaurantPermission('MenuItem', 'restaurantId', 'itemId'),
    body('ingredients').isArray({ min: 1 }).withMessage('Se requiere al menos un ingrediente'),
    checkValidators,
];

export const validateGetMenuItems = [
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
