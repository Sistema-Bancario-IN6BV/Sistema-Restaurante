'use strict';

import { body, param, query } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';
import { checkEntityRestaurantPermission } from './check-restaurant-permission.js';
import { checkRestaurantPermission } from './check-restaurant-permission.js';

export const validateCreateInvoice = [
  validateJWT,
  body('orderId')
    .notEmpty().withMessage('El ID de la orden es requerido')
    .isMongoId().withMessage('ID de orden inválido'),
  checkValidators,
];

export const validateGetMyInvoices = [
  validateJWT,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  checkValidators,
];

export const validateInvoiceId = [
  param('id').isMongoId().withMessage('ID de factura inválido'),
  checkValidators,
];

export const validateOrderId = [
  param('orderId').isMongoId().withMessage('ID de orden inválido'),
  checkValidators,
];

export const validateGetByRestaurant = [
  validateJWT,
  requireRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
  param('id').isMongoId().withMessage('ID de restaurante inválido'),
  checkRestaurantPermission('id'),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  checkValidators,
];

export const validatePayInvoice = [
  validateJWT,
  requireRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
  param('id').isMongoId().withMessage('ID de factura inválido'),
  checkEntityRestaurantPermission('Invoice', 'restaurantId', 'id'),
  body('paymentMethod').isIn(['CASH', 'CARD', 'TRANSFER', 'DIGITAL_WALLET']).withMessage('Método de pago inválido'),
  checkValidators,
];

export const validateDeleteInvoice = [
  validateJWT,
  requireRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
  param('id').isMongoId().withMessage('ID de factura inválido'),
  checkEntityRestaurantPermission('Invoice', 'restaurantId', 'id'),
  checkValidators,
];
