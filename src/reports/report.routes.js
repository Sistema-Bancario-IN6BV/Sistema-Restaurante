import { Router } from 'express';
import {
    topSellingPlates,
    peakHours,
    restaurantDemand,
    reservationsStats,
    restaurantPerformance,
    ordersByDay,
    generalReportPDF,
    restaurantReportPDF,
    generalReportExcel,
    restaurantReportExcel
} from './report.controller.js';
import {
    validateTopSellingParams,
    validatePeakHoursParams,
    validateRestaurantDemandParams,
    validateReservationsStatsParams,
    validateRestaurantPerformanceParams,
    validateOrdersByDayParams,
    validateGeneralReportParams,
    validateRestaurantReportParams
} from '../../middlewares/report-validators.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';

const router = Router();

router.get('/top-selling-plates', validateJWT, validateTopSellingParams, topSellingPlates);
router.get('/peak-hours', validateJWT, validatePeakHoursParams, peakHours);
router.get('/restaurant-demand', validateJWT, validateRestaurantDemandParams, restaurantDemand);
router.get('/reservations-stats', validateJWT, validateReservationsStatsParams, reservationsStats);
router.get('/restaurant-performance/:restaurantId', validateJWT, validateRestaurantPerformanceParams, restaurantPerformance);
router.get('/orders-by-day', validateJWT, validateOrdersByDayParams, ordersByDay);
router.get('/general-report/pdf', validateJWT, validateGeneralReportParams, generalReportPDF);
router.get('/restaurant-report/pdf/:restaurantId', validateJWT, validateRestaurantReportParams, restaurantReportPDF);
router.get('/general-report/excel', validateJWT, validateGeneralReportParams, generalReportExcel);
router.get('/restaurant-report/excel/:restaurantId', validateJWT, validateRestaurantReportParams, restaurantReportExcel);

export default router;