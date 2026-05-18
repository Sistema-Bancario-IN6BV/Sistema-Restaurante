'use strict';

import { param } from 'express-validator';
import { checkValidators } from '../../middlewares/checkValidators.js';

import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireRole } from '../../middlewares/validate-role.js';
import { USER_ROLES } from '../../middlewares/roles.js';

// NOTA: si ya tienes middlewares equivalentes para DELETE, puedes reutilizarlos.
export const validateDeleteEvent = [
    validateJWT,
    requireRole(USER_ROLES.PLATFORM_ADMIN, USER_ROLES.RESTAURANT_ADMIN),
    param('id').isMongoId().withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

