import { Router } from 'express';
import {
  getRestaurantStats,
  getTopDishes,
  getRevenue,
  getPeakHours,
  getGlobalStats,
} from './report.controller.js';
import {
  validateGetRestaurantStats,
  validateGetTopDishes,
  validateGetRevenue,
  validateGetPeakHours,
  validateGetGlobalStats,
} from '../../middlewares/report-validators.js';

const router = Router();

router.get('/restaurant/:id/stats', validateGetRestaurantStats, getRestaurantStats);
router.get('/restaurant/:id/top-dishes', validateGetTopDishes, getTopDishes);
router.get('/restaurant/:id/revenue', validateGetRevenue, getRevenue);
router.get('/restaurant/:id/peak-hours', validateGetPeakHours, getPeakHours);
router.get('/global', validateGetGlobalStats, getGlobalStats);

export default router;
