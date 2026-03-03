import { Router } from 'express';
import {
    exportRestaurantPerformanceReport,
    getOverviewReport,
    getRestaurantPerformanceReport
} from './report.controller.js';
import {
    validateExportReport,
    validateGetReport
} from '../../middlewares/report-validators.js';

const router = Router();

router.get('/overview', validateGetReport, getOverviewReport);
router.get('/performance', validateGetReport, getRestaurantPerformanceReport);
router.get('/export', validateExportReport, exportRestaurantPerformanceReport);

export default router;