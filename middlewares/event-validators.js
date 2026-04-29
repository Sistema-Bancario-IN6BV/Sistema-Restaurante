import { body, param, query } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';
import { checkEntityRestaurantPermission, checkCreateRestaurantPermission } from './check-restaurant-permission.js';
import { USER_ROLES } from './roles.js';
<<<<<<< HEAD

export const validateCreateField = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),

    body('restaurant')
        .notEmpty().withMessage('El restaurante es requerido')
        .isMongoId().withMessage('El restaurante debe ser un ObjectId válido'),
=======
// Validaciones para crear un evento
export const validateCreateEvent = [
	validateJWT,
	requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),
	checkCreateRestaurantPermission('restaurantId'),

	body('restaurantId')
		.notEmpty()
		.withMessage('El restaurante es requerido')
		.isMongoId()
		.withMessage('El restaurante debe ser un ObjectId válido'),
>>>>>>> 493daf8dd443696490d6345b57dbcb0c47deafe7

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

<<<<<<< HEAD
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
=======
	body('date')
		.notEmpty()
		.withMessage('La fecha es requerida')
		.isISO8601()
		.withMessage('La fecha debe ser una fecha válida'),

	body('startTime')
		.notEmpty().withMessage('Hora de inicio requerida')
		.matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Formato HH:MM'),

	body('endTime')
		.notEmpty().withMessage('Hora de fin requerida')
		.matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Formato HH:MM'),

	body('capacity')
		.notEmpty().isInt({ min: 1 }).withMessage('Capacidad debe ser número >= 1'),

	checkValidators,
];

// Validaciones para actualizar un evento
export const validateUpdateEvent = [
	validateJWT,
	requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),
>>>>>>> 493daf8dd443696490d6345b57dbcb0c47deafe7

    param('id').isMongoId().withMessage('ID de evento inválido'),

<<<<<<< HEAD
    body('eventDate')
        .optional()
        .isISO8601().withMessage('Formato de fecha inválido')
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error('La nueva fecha debe ser futura');
            }
            return true;
        }),
=======
	checkEntityRestaurantPermission('Event', 'restaurantId', 'id'),
>>>>>>> 493daf8dd443696490d6345b57dbcb0c47deafe7

    body('status')
        .optional()
        .isIn(['ACTIVE', 'CANCELLED', 'FINISHED'])
        .withMessage('Estado no válido (ACTIVE, CANCELLED o FINISHED)'),

<<<<<<< HEAD
    checkValidators,
=======
	body('description')
		.optional()
		.trim()
		.isLength({ max: 500 })
		.withMessage('La descripción no puede exceder 500 caracteres'),

	body('date')
		.optional()
		.isISO8601()
		.withMessage('La fecha debe ser una fecha válida'),

	checkValidators,
>>>>>>> 493daf8dd443696490d6345b57dbcb0c47deafe7
];

// Activar / Desactivar evento (solo ADMIN)
export const validateEventStatusChange = [
	validateJWT,
	requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),
	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),
	checkEntityRestaurantPermission('Event', 'restaurantId', 'id'),
	checkValidators,
];

// Obtener evento por ID
export const validateGetEventById = [
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

	query('restaurantId')
		.optional()
		.isMongoId()
		.withMessage('El restaurante debe ser un ObjectId válido'),

	query('isActive')
		.optional()
		.isBoolean()
		.withMessage('isActive debe ser un booleano'),

	checkValidators,
];

export const validateRegisterToEvent = [
	validateJWT,
	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),
	checkValidators,
];

export const validateUnregisterFromEvent = [
	validateJWT,
	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),
	checkValidators,
];

export const validateGetEventRegistrations = [
	validateJWT,
	requireRole(USER_ROLES.RESTAURANT_ADMIN, USER_ROLES.PLATFORM_ADMIN),
	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),
	checkValidators,
];

export const validateCancelEvent = [
	validateJWT,
	requireRole(USER_ROLES.RESTAURANT_ADMIN, USER_ROLES.PLATFORM_ADMIN),
	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),
	checkValidators,
];

