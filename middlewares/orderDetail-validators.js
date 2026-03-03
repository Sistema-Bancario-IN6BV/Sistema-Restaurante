import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';
<<<<<<< HEAD

export const validateCreateOrderDetail = [
    //validateJWT,
    //requireRole('ADMIN_ROLE', 'USER_ROLE'),

    body('order')
        .notEmpty()
        .withMessage('La orden es requerida')
        .isMongoId()
        .withMessage('La orden debe ser un ObjectId válido de MongoDB'),
=======
import { USER_ROLES } from './roles.js';

// Crear detalle de orden
export const validateCreateOrderDetail = [
    validateJWT,

    param('orderId')
        .notEmpty()
        .withMessage('La orden es requerida')
        .isMongoId()
        .withMessage('La orden debe ser un ObjectId válido'),
>>>>>>> origin/develop

    body('menuItem')
        .notEmpty()
        .withMessage('El platillo es requerido')
        .isMongoId()
<<<<<<< HEAD
        .withMessage('El platillo debe ser un ObjectId válido de MongoDB'),
=======
        .withMessage('El platillo debe ser un ObjectId válido'),
>>>>>>> origin/develop

    body('quantity')
        .notEmpty()
        .withMessage('La cantidad es requerida')
        .isInt({ min: 1 })
        .withMessage('La cantidad debe ser al menos 1'),

<<<<<<< HEAD
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
=======
    checkValidators,
];

// Validar ID de detalle en params
export const validateOrderDetailId = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

// Obtener detalles de una orden
export const validateGetOrderDetails = [
    param('orderId')
        .isMongoId()
        .withMessage('orderId debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];
>>>>>>> origin/develop
