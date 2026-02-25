import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';

export const validateCreateOrder = [
    //validateJWT,
    //requireRole('ADMIN_ROLE', 'USER_ROLE'),

    body('userId')
        .notEmpty()
        .withMessage('El usuario es requerido')
        .isString()
        .withMessage('El usuario debe ser un string válido'),

    body('restaurant')
        .notEmpty()
        .withMessage('El restaurante es requerido')
        .isMongoId()
        .withMessage('El restaurante debe ser un ObjectId válido de MongoDB'),

    checkValidators,
];

export const validateOrderId = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),

    checkValidators,
];

export const validateOrderStatus = [
    //validateJWT,
    //requireRole('ADMIN_ROLE'),

    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),

    body('status')
        .notEmpty()
        .withMessage('El estado es requerido')
        .isIn(['EN_PREPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO'])
        .withMessage('Estado no válido. Opciones: EN_PREPARACION, LISTO, ENTREGADO, CANCELADO'),

    checkValidators,
];
