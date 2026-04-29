import { body, param, query } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';
import { USER_ROLES } from './roles.js';

export const validateCreateReservation = [
    validateJWT,
    body('restaurant')
        .notEmpty().withMessage('El restaurante es requerido')
        .isMongoId().withMessage('Debe ser un ObjectId válido'),

    body('table')
        .notEmpty().withMessage('La mesa es requerida')
        .isMongoId().withMessage('Debe ser un ObjectId válido'),

    body('reservationDate')
        .notEmpty().withMessage('La fecha es requerida')
        .isISO8601().withMessage('Fecha inválida'),

    checkValidators
];

export const validateReservationId = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateReservationStatusChange = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    body('status')
        .notEmpty()
        .withMessage('El estado es requerido')
        .isIn(['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'FINALIZADA'])
        .withMessage('Estado de reserva no válido'),
    checkValidators,
];

export const validateGetReservations = [
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

    query('reservationDate')
        .optional()
        .isISO8601()
        .withMessage('La fecha debe ser una fecha válida'),

    checkValidators,
];

export const validateGetMyReservations = [
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

    query('reservationDate')
        .optional()
        .isISO8601()
        .withMessage('La fecha debe ser una fecha válida'),

    checkValidators,
];

export const validateGetReservationsByRestaurant = [
    validateJWT,
    requireRole(USER_ROLES.RESTAURANT_ADMIN),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateGetReservationById = [
    validateJWT,
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateUpdateReservation = [
    validateJWT,
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateCancelReservation = [
    validateJWT,
    requireRole(USER_ROLES.RESTAURANT_ADMIN),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateConfirmReservation = [
    validateJWT,
    requireRole(USER_ROLES.RESTAURANT_ADMIN),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];