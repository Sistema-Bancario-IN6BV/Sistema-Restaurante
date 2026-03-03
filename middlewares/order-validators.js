import { body, param, query } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';
import { USER_ROLES } from './roles.js';

// Crear orden
export const validateCreateOrder = [
    validateJWT,

    body('restaurant')
        .notEmpty()
        .withMessage('El restaurante es requerido')
        .isMongoId()
        .withMessage('El restaurante debe ser un ObjectId válido'),

    body('total')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El total no puede ser negativo'),

    body('status')
        .optional()
        .isIn(['EN_PREPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO'])
        .withMessage('Estado no válido'),

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
	requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),
	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),
	body('status')
		.notEmpty()
		.withMessage('El estado es requerido')
		.isIn(['EN_PREPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO'])
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

