import { Router } from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    changeOrderStatus
} from './order.controller.js';

import { validateCreateOrder, validateOrderId, validateOrderStatus } from '../../middlewares/order-validators.js';

const router = Router();

router.post(
    '/create',
    validateCreateOrder,
    createOrder
);

router.get(
    '/get',
    getOrders
);

router.get(
    '/:id',
    validateOrderId,
    getOrderById
);

router.put(
    '/:id/status',
    validateOrderStatus,
    updateOrderStatus
);

router.put(
    '/:id/activate',
    validateOrderId,
    changeOrderStatus
);

router.put(
    '/:id/deactivate',
    validateOrderId,
    changeOrderStatus
);

export default router;
