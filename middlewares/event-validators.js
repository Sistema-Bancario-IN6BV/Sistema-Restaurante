import { body, param, query } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';

// Validaciones para crear un evento
export const validateCreateField = [
	validateJWT,
	requireRole('ADMIN_ROLE'),

	body('restaurant')
		.notEmpty()
		.withMessage('El restaurante es requerido')
		.isMongoId()
		.withMessage('El restaurante debe ser un ObjectId válido'),

	body('title')
		.trim()
		.notEmpty()
		.withMessage('El título es requerido')
		.isLength({ min: 2, max: 150 })
		.withMessage('El título debe tener entre 2 y 150 caracteres'),

	body('description')
		.optional()
		.trim()
		.isLength({ max: 500 })
		.withMessage('La descripción no puede exceder 500 caracteres'),

	body('eventDate')
		.notEmpty()
		.withMessage('La fecha es requerida')
		.isISO8601()
		.withMessage('La fecha debe ser una fecha válida'),

	checkValidators,
];

// Validaciones para actualizar un evento
export const validateUpdateFieldRequest = [
	validateJWT,
	requireRole('ADMIN_ROLE'),

	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),

	body('restaurant')
		.optional()
		.isMongoId()
		.withMessage('El restaurante debe ser un ObjectId válido'),

	body('title')
		.optional()
		.trim()
		.isLength({ min: 2, max: 150 })
		.withMessage('El título debe tener entre 2 y 150 caracteres'),

	body('description')
		.optional()
		.trim()
		.isLength({ max: 500 })
		.withMessage('La descripción no puede exceder 500 caracteres'),

	body('eventDate')
		.optional()
		.isISO8601()
		.withMessage('La fecha debe ser una fecha válida'),

	checkValidators,
];

// Activar / Desactivar evento (solo ADMIN)
export const validateFieldStatusChange = [
	validateJWT,
	requireRole('ADMIN_ROLE'),
	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),
	checkValidators,
];

// Obtener evento por ID
export const validateGetFieldById = [
	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),
	checkValidators,
];

export const validateGetEvents = [
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

	query('isActive')
		.optional()
		.isBoolean()
		.withMessage('isActive debe ser un booleano'),

	checkValidators,
];

