import { Router } from 'express';
import {
    createOrderDetail,
    getOrderDetails,
    deactivateOrderDetail
} from './orderDetail.controller.js';

import {
    validateCreateOrderDetail,
    validateOrderDetailId,
    validateGetOrderDetails
} from '../../middlewares/orderDetail-validators.js';

const router = Router();

/**
 * @openapi
 * /orderDetails/{orderId}:
 *   post:
 *     tags: [Order Details]
 *     summary: Crear detalle de orden
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [menuItem, quantity, price]
 *             properties:
 *               menuItem: { type: string }
 *               quantity: { type: number, minimum: 1 }
 *               price: { type: number, minimum: 0 }
 *     responses:
 *       201:
 *         description: Detalle creado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/OrderDetail'
 */

router.post(
  '/:orderId',
  validateCreateOrderDetail,
  createOrderDetail
);

/**
 * @openapi
 * /orderDetails/order/{orderId}:
 *   get:
 *     tags: [Order Details]
 *     summary: Listar detalles por orden
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalles de la orden
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/OrderDetail'
 */

router.get(
    '/order/:orderId',
    validateGetOrderDetails,
    getOrderDetails
);

/**
 * @openapi
 * /orderDetails/{id}/deactivate:
 *   put:
 *     tags: [Order Details]
 *     summary: Desactivar detalle de orden
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle desactivado
 */

router.put(
    '/:id/deactivate',
    validateOrderDetailId,
    deactivateOrderDetail
);

export default router;
