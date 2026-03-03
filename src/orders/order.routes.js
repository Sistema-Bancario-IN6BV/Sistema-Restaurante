import { Router } from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    changeOrderStatus
} from './order.controller.js';

import { validateCreateOrder, validateOrderId, validateOrderStatus, validateGetOrders } from '../../middlewares/order-validators.js';

const router = Router();

/**
 * @openapi
 * /orders/create:
 *   post:
 *     tags: [Orders]
 *     summary: Crear orden
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, restaurant]
 *             properties:
 *               userId: { type: string }
 *               restaurant: { type: string }
 *               total: { type: number }
 *     responses:
 *       201:
 *         description: Orden creada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Order'
 */

router.post(
    '/create',
    validateCreateOrder,
    createOrder
);

/**
 * @openapi
 * /orders/get:
 *   get:
 *     tags: [Orders]
 *     summary: Listar órdenes
 *     responses:
 *       200:
 *         description: Listado de órdenes
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
 *                         $ref: '#/components/schemas/Order'
 */

router.get(
    '/get',
    validateGetOrders,
    getOrders
);

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Obtener orden por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orden encontrada
 */

router.get(
    '/:id',
    validateOrderId,
    getOrderById
);

/**
 * @openapi
 * /orders/{id}/status:
 *   put:
 *     tags: [Orders]
 *     summary: Actualizar estado de orden
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estado actualizado
 */

router.put(
    '/:id/status',
    validateOrderStatus,
    updateOrderStatus
);

/**
 * @openapi
 * /orders/{id}/activate:
 *   put:
 *     tags: [Orders]
 *     summary: Activar orden
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orden activada
 */

router.put(
    '/:id/activate',
    validateOrderId,
    changeOrderStatus
);

/**
 * @openapi
 * /orders/{id}/deactivate:
 *   put:
 *     tags: [Orders]
 *     summary: Desactivar orden
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orden desactivada
 */

router.put(
    '/:id/deactivate',
    validateOrderId,
    changeOrderStatus
);

export default router;
