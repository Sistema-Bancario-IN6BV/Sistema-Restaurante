
import { body, param, query } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';
import { checkEntityRestaurantPermission } from './check-restaurant-permission.js';

// Crear orden
export const validateCreateOrder = [
    validateJWT,
    body('restaurant')
        .optional()
        .isMongoId()
        .withMessage('El restaurante debe ser un ObjectId válido'),
    body('restaurantId')
        .optional()
        .isMongoId()
        .withMessage('El restaurantId debe ser un ObjectId válido'),
    body('items')
        .isArray({ min: 1 })
        .withMessage('Se requiere al menos un item'),
    body('total')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El total no puede ser negativo'),
    checkValidators,
];

// Validar ID de orden en params
export const validateOrderId = [
	validateJWT,
	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),
	checkValidators,
];

// Validar cambio de estado
export const validateOrderStatus = [
	validateJWT,
	requireRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),
	checkEntityRestaurantPermission('Order', 'restaurantId', 'id'),
	body('status')
		.notEmpty()
		.withMessage('El estado es requerido')
		.isIn(['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'])
		.withMessage('Estado de orden no válido'),
	checkValidators,
];

export const validateGetOrders = [
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

export const validateGetMyOrders = [
	validateJWT,
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

export const validateGetOrdersByRestaurant = [
	validateJWT,
	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),
	checkValidators,
];

export const validateGetOrderById = [
	validateJWT,
	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),
	checkValidators,
];

export const validateCancelOrder = [
	validateJWT,
	requireRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),
	checkEntityRestaurantPermission('Order', 'restaurantId', 'id'),
	checkValidators,
];

export const validateDeleteOrder = [
	validateJWT,
	requireRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),
	checkEntityRestaurantPermission('Order', 'restaurantId', 'id'),
	checkValidators,
];
