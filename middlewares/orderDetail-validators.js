import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';

export const validateCreateOrderDetail = [
    //validateJWT,
    //requireRole('ADMIN_ROLE', 'USER_ROLE'),

    body('order')
        .notEmpty()
        .withMessage('La orden es requerida')
        .isMongoId()
        .withMessage('La orden debe ser un ObjectId válido de MongoDB'),

    body('menuItem')
        .notEmpty()
        .withMessage('El platillo es requerido')
        .isMongoId()
        .withMessage('El platillo debe ser un ObjectId válido de MongoDB'),

    body('quantity')
        .notEmpty()
        .withMessage('La cantidad es requerida')
        .isInt({ min: 1 })
        .withMessage('La cantidad debe ser al menos 1'),

    body('price')
        .notEmpty()
        .withMessage('El precio es requerido')
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser mayor o igual a 0'),

    body('subtotal')
        .notEmpty()
        .withMessage('El subtotal es requerido')
        .isFloat({ min: 0 })
        .withMessage('El subtotal debe ser mayor o igual a 0'),

    checkValidators,
];

export const validateOrderDetailId = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),

    checkValidators,
];
