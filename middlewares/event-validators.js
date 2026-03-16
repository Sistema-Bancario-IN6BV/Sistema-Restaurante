import { body, param, query } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';
import { USER_ROLES } from './roles.js';

export const validateCreateField = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),

    body('restaurant')
        .notEmpty().withMessage('El restaurante es requerido')
        .isMongoId().withMessage('El restaurante debe ser un ObjectId válido'),

    body('title')
        .trim()
        .notEmpty().withMessage('El título es requerido')
        .isLength({ min: 2, max: 150 }).withMessage('El título debe tener entre 2 y 150 caracteres'),

    body('eventDate')
        .notEmpty().withMessage('La fecha es requerida')
        .isISO8601().withMessage('Formato de fecha inválido')
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error('La fecha del evento debe ser una fecha futura');
            }
            return true;
        }),

    body('maxCapacity')
        .notEmpty().withMessage('La capacidad máxima es requerida')
        .isInt({ min: 1 }).withMessage('La capacidad debe ser un número mayor a 0'),

    body('tags')
        .optional()
        .isArray().withMessage('Los servicios adicionales (tags) deben ser un arreglo'),

    checkValidators,
];

export const validateUpdateFieldRequest = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),

    param('id').isMongoId().withMessage('ID de evento inválido'),

    body('eventDate')
        .optional()
        .isISO8601().withMessage('Formato de fecha inválido')
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error('La nueva fecha debe ser futura');
            }
            return true;
        }),

    body('status')
        .optional()
        .isIn(['ACTIVE', 'CANCELLED', 'FINISHED'])
        .withMessage('Estado no válido (ACTIVE, CANCELLED o FINISHED)'),

    checkValidators,
];

// Activar / Desactivar evento (solo ADMIN)
export const validateFieldStatusChange = [
	validateJWT,
	requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),
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

