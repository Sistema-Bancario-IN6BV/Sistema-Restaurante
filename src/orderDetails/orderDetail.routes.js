import { Router } from 'express';
import {
    createOrderDetail,
    getOrderDetails,
    deactivateOrderDetail
} from './orderDetail.controller.js';

import {
    validateCreateOrderDetail,
    validateOrderDetailId
} from '../../middlewares/orderDetail-validators.js';

const router = Router();

router.post(
    '/create',
    validateCreateOrderDetail,
    createOrderDetail
);

router.get(
    '/order/:orderId',
    getOrderDetails
);

router.put(
    '/:id/deactivate',
    validateOrderDetailId,
    deactivateOrderDetail
);

export default router;
