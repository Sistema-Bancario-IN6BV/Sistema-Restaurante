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

router.post(
  '/:orderId',
  validateCreateOrderDetail,
  createOrderDetail
);

router.get(
    '/order/:orderId',
    validateGetOrderDetails,
    getOrderDetails
);

router.put(
    '/:id/deactivate',
    validateOrderDetailId,
    deactivateOrderDetail
);

export default router;
