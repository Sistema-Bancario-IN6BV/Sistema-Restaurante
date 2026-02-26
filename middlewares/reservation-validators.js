import { body, param, query } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';

export const validateCreateReservation = [
    validateJWT,

    body('user')
        .notEmpty()
        .withMessage('El usuario es requerido')
        .isMongoId()
        .withMessage('El usuario debe ser un ObjectId válido'),

    body('restaurant')
        .notEmpty()
        .withMessage('El restaurante es requerido')
        .isMongoId()
        .withMessage('El restaurante debe ser un ObjectId válido'),

    body('table')
        .notEmpty()
        .withMessage('La mesa es requerida')
        .isMongoId()
        .withMessage('La mesa debe ser un ObjectId válido'),

    body('reservationDate')
        .notEmpty()
        .withMessage('La fecha de reserva es requerida')
        .isISO8601()
        .withMessage('La fecha debe ser una fecha válida'),

    body('startTime')
        .notEmpty()
        .withMessage('La hora de inicio es requerida')
        .isISO8601()
        .withMessage('La hora de inicio debe ser una fecha/hora válida'),

    body('endTime')
        .notEmpty()
        .withMessage('La hora de fin es requerida')
        .isISO8601()
        .withMessage('La hora de fin debe ser una fecha/hora válida'),

    checkValidators,
];

export const validateReservationId = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateReservationStatusChange = [
    validateJWT,
    requireRole('ADMIN_ROLE'),
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
