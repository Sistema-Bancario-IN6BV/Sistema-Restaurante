import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';

// Crear detalle de orden
export const validateCreateOrderDetail = [
	validateJWT,
	body('order')
		.notEmpty()
		.withMessage('La orden es requerida')
		.isMongoId()
		.withMessage('La orden debe ser un ObjectId válido'),
	body('menuItem')
		.notEmpty()
		.withMessage('El platillo es requerido')
		.isMongoId()
		.withMessage('El platillo debe ser un ObjectId válido'),
	body('quantity')
		.notEmpty()
		.withMessage('La cantidad es requerida')
		.isInt({ min: 1 })
		.withMessage('La cantidad debe ser al menos 1'),
	checkValidators,
];

// Validar ID de detalle en params
export const validateOrderDetailId = [
	validateJWT,
	requireRole('ADMIN_ROLE'),
	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),
	checkValidators,
];

export const validateGetOrderDetails = [
	param('orderId')
		.isMongoId()
		.withMessage('orderId debe ser un ObjectId válido de MongoDB'),
	checkValidators,
];
