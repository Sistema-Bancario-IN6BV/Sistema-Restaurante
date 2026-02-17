import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';

// Validaciones para crear campos (field)
export const validateCreateField = [

];

export const validateUpdateFieldRequest = [
   
];

// Validaciones para activar/desactivar campos
export const validateFieldStatusChange = [
    validateJWT,
    requireRole('ADMIN_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

// Validación para obtener campo por ID
export const validateGetFieldById = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];
