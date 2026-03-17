
import { body, param, query } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';
import { USER_ROLES } from './roles.js';

export const validateCreateField = [
	validateJWT,
	requireRole(USER_ROLES.PLATFORM_ADMIN),

	body('name')
		.trim()
		.notEmpty()
		.withMessage('El nombre es requerido')
		.isLength({ min: 2, max: 150 })
		.withMessage('El nombre debe tener entre 2 y 150 caracteres'),

	body('description')
		.optional()
		.trim()
		.isLength({ max: 500 })
		.withMessage('La descripción no puede exceder 500 caracteres'),

	body('address')
		.trim()
		.notEmpty()
		.withMessage('La dirección es requerida'),

	body('category')
		.optional()
		.trim(),

	body('averagePrice')
		.optional()
		.isFloat({ min: 0 })
		.withMessage('El precio promedio no puede ser negativo'),

	body('contactEmail')
		.optional()
		.isEmail()
		.withMessage('Email de contacto no válido'),

	body('contactPhone')
		.optional()
		.trim(),

	checkValidators,
];

export const validateUpdateFieldRequest = [
	validateJWT,
	requireRole(USER_ROLES.PLATFORM_ADMIN),

	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),

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

	body('address')
		.optional()
		.trim(),

	body('category')
		.optional()
		.trim(),

	body('averagePrice')
		.optional()
		.isFloat({ min: 0 })
		.withMessage('El precio promedio no puede ser negativo'),

	body('contactEmail')
		.optional()
		.isEmail()
		.withMessage('Email de contacto no válido'),

	body('contactPhone')
		.optional()
		.trim(),

	checkValidators,
];

export const validateFieldStatusChange = [
	validateJWT,
	requireRole(USER_ROLES.PLATFORM_ADMIN),
	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),
	checkValidators,
];

export const validateGetFieldById = [
	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),
	checkValidators,
];

export const validateGetRestaurants = [
	query('page')
		.optional()
		.isInt({ min: 1 })
		.withMessage('La página debe ser un número mayor a 0'),

	query('limit')
		.optional()
		.isInt({ min: 1 })
		.withMessage('El límite debe ser un número mayor a 0'),

	query('isActive')
		.optional()
		.isBoolean()
		.withMessage('El estado debe ser true o false'),

	query('category')
		.optional()
		.trim(),

	query('name')
		.optional()
		.trim()
		.isLength({ min: 1, max: 150 })
		.withMessage('El nombre debe tener entre 1 y 150 caracteres'),

	query('city')
		.optional()
		.trim()
		.isLength({ min: 1, max: 100 })
		.withMessage('La ciudad debe tener entre 1 y 100 caracteres'),

	query('averagePrice')
		.optional()
		.isFloat({ min: 0 })
		.withMessage('El precio promedio debe ser un número mayor o igual a 0'),

	query('minAveragePrice')
		.optional()
		.isFloat({ min: 0 })
		.withMessage('El precio promedio mínimo debe ser un número mayor o igual a 0'),

	query('maxAveragePrice')
		.optional()
		.isFloat({ min: 0 })
		.withMessage('El precio promedio máximo debe ser un número mayor o igual a 0')
		.custom((value, { req }) => {
			if (req.query.minAveragePrice && Number(value) < Number(req.query.minAveragePrice)) {
				throw new Error('El precio promedio máximo no puede ser menor que el mínimo');
			}

			return true;
		}),

	checkValidators,
];

const validateSearchPagination = [
	body('page')
		.optional()
		.isInt({ min: 1 })
		.withMessage('La página debe ser un número mayor a 0'),

	body('limit')
		.optional()
		.isInt({ min: 1 })
		.withMessage('El límite debe ser un número mayor a 0'),

	body('isActive')
		.optional()
		.isBoolean()
		.withMessage('El estado debe ser true o false'),
];

export const validateSearchRestaurantsByName = [
	...validateSearchPagination,
	body('name')
		.trim()
		.notEmpty()
		.withMessage('El nombre es requerido')
		.isLength({ min: 1, max: 150 })
		.withMessage('El nombre debe tener entre 1 y 150 caracteres'),
	checkValidators,
];

export const validateSearchRestaurantsByCategory = [
	...validateSearchPagination,
	body('category')
		.trim()
		.notEmpty()
		.withMessage('La categoría es requerida')
		.isLength({ min: 1, max: 100 })
		.withMessage('La categoría debe tener entre 1 y 100 caracteres'),
	checkValidators,
];

export const validateSearchRestaurantsByCity = [
	...validateSearchPagination,
	body('city')
		.trim()
		.notEmpty()
		.withMessage('La ciudad es requerida')
		.isLength({ min: 1, max: 100 })
		.withMessage('La ciudad debe tener entre 1 y 100 caracteres'),
	checkValidators,
];

export const validateSearchRestaurantsByAveragePrice = [
	...validateSearchPagination,
	body('averagePrice')
		.optional()
		.isFloat({ min: 0 })
		.withMessage('El precio promedio debe ser un número mayor o igual a 0'),

	body('minAveragePrice')
		.optional()
		.isFloat({ min: 0 })
		.withMessage('El precio promedio mínimo debe ser un número mayor o igual a 0'),

	body('maxAveragePrice')
		.optional()
		.isFloat({ min: 0 })
		.withMessage('El precio promedio máximo debe ser un número mayor o igual a 0')
		.custom((value, { req }) => {
			if (req.body.minAveragePrice && Number(value) < Number(req.body.minAveragePrice)) {
				throw new Error('El precio promedio máximo no puede ser menor que el mínimo');
			}

			return true;
		}),

	body().custom((value) => {
		const hasExact = typeof value.averagePrice !== 'undefined';
		const hasRange = typeof value.minAveragePrice !== 'undefined' || typeof value.maxAveragePrice !== 'undefined';

		if (!hasExact && !hasRange) {
			throw new Error('Debe enviar averagePrice o un rango con minAveragePrice y/o maxAveragePrice');
		}

		return true;
	}),

	checkValidators,
];

export const validateAdminCreateRestaurant = [
	validateJWT,
	requireRole(USER_ROLES.PLATFORM_ADMIN),

	body('name')
		.trim()
		.notEmpty()
		.withMessage('El nombre es requerido')
		.isLength({ min: 2, max: 150 })
		.withMessage('El nombre debe tener entre 2 y 150 caracteres'),

	body('description')
		.optional()
		.trim()
		.isLength({ max: 500 })
		.withMessage('La descripción no puede exceder 500 caracteres'),

	body('address')
		.trim()
		.notEmpty()
		.withMessage('La dirección es requerida'),

	body('category')
		.optional()
		.trim(),

	body('averagePrice')
		.optional()
		.isFloat({ min: 0 })
		.withMessage('El precio promedio no puede ser negativo'),

	body('contactEmail')
		.optional()
		.isEmail()
		.withMessage('Email de contacto no válido'),

	body('contactPhone')
		.optional()
		.trim(),

	checkValidators,
];

export const validateAdminGetRestaurants = [
	validateJWT,
	requireRole(USER_ROLES.PLATFORM_ADMIN),

	query('page')
		.optional()
		.isInt({ min: 1 })
		.withMessage('La página debe ser un número mayor a 0'),

	query('limit')
		.optional()
		.isInt({ min: 1 })
		.withMessage('El límite debe ser un número mayor a 0'),

	query('name')
		.optional()
		.trim()
		.isLength({ min: 1, max: 150 })
		.withMessage('El nombre debe tener entre 1 y 150 caracteres'),

	query('category')
		.optional()
		.trim()
		.isLength({ min: 1, max: 100 })
		.withMessage('La categoría debe tener entre 1 y 100 caracteres'),

	query('city')
		.optional()
		.trim()
		.isLength({ min: 1, max: 100 })
		.withMessage('La ciudad debe tener entre 1 y 100 caracteres'),

	query('isActive')
		.optional()
		.isBoolean()
		.withMessage('El estado debe ser true o false'),

	checkValidators,
];

export const validateAdminGetRestaurantById = [
	validateJWT,
	requireRole(USER_ROLES.PLATFORM_ADMIN),

	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),

	checkValidators,
];

export const validateAdminUpdateRestaurant = [
	validateJWT,
	requireRole(USER_ROLES.PLATFORM_ADMIN),

	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),

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

	body('address')
		.optional()
		.trim(),

	body('category')
		.optional()
		.trim(),

	body('averagePrice')
		.optional()
		.isFloat({ min: 0 })
		.withMessage('El precio promedio no puede ser negativo'),

	body('contactEmail')
		.optional()
		.isEmail()
		.withMessage('Email de contacto no válido'),

	body('contactPhone')
		.optional()
		.trim(),

	checkValidators,
];

export const validateAdminDeactivateRestaurant = [
	validateJWT,
	requireRole(USER_ROLES.PLATFORM_ADMIN),

	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),

	checkValidators,
];
