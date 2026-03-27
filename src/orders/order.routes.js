import { Router } from 'express';
import {
  createOrder, getMyOrders, getOrdersByRestaurant,
  getOrderById, updateOrderStatus, cancelOrder, deleteOrder,
} from './order.controller.js';
import {
  validateCreateOrder,
  validateOrderStatus,
  validateGetMyOrders,
  validateGetOrdersByRestaurant,
  validateGetOrderById,
  validateCancelOrder,
  validateDeleteOrder,
} from '../../middlewares/order-validators.js';

const router = Router();

router.post('/create', validateCreateOrder, createOrder);
router.get('/my', validateGetMyOrders, getMyOrders);
router.get('/restaurant/:id', validateGetOrdersByRestaurant, getOrdersByRestaurant);
router.get('/:id', validateGetOrderById, getOrderById);
router.patch('/:id/status', validateOrderStatus, updateOrderStatus);
router.patch('/:id/cancel', validateCancelOrder, cancelOrder);
router.delete('/:id', validateDeleteOrder, deleteOrder);

export default router;
