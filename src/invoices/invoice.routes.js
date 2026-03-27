'use strict';

import { Router } from 'express';
import {
  createInvoice,
  getMyInvoices,
  getInvoiceByOrder,
  getInvoicesByRestaurant,
  payInvoice,
  deleteInvoice,
} from './invoice.controller.js';
import {
  validateCreateInvoice,
  validateGetMyInvoices,
  validateInvoiceId,
  validateOrderId,
  validateGetByRestaurant,
  validatePayInvoice,
  validateDeleteInvoice,
} from '../../middlewares/invoice-validators.js';

const router = Router();

// POST /invoices (Crear factura desde una orden)
router.post('/', validateCreateInvoice, createInvoice);

// GET /invoices/my
router.get('/my', validateGetMyInvoices, getMyInvoices);

// GET /invoices/order/:orderId
router.get('/order/:orderId', validateOrderId, getInvoiceByOrder);

// GET /invoices/restaurant/:id
router.get('/restaurant/:id', validateGetByRestaurant, getInvoicesByRestaurant);

// PATCH /invoices/:id/pay
router.patch('/:id/pay', validatePayInvoice, payInvoice);

// DELETE /invoices/:id
router.delete('/:id', validateDeleteInvoice, deleteInvoice);

export default router;
