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

/**
 * @openapi
 * /reports/overview:
 *   get:
 *     tags: [Reports]
 *     summary: Obtener reporte general
 *     responses:
 *       200:
 *         description: Reporte general generado
 */

router.get('/overview', validateGetReport, getOverviewReport);

/**
 * @openapi
 * /reports/performance:
 *   get:
 *     tags: [Reports]
 *     summary: Obtener reporte de rendimiento
 *     responses:
 *       200:
 *         description: Reporte de rendimiento generado
 */

router.get('/performance', validateGetReport, getRestaurantPerformanceReport);

/**
 * @openapi
 * /reports/export:
 *   get:
 *     tags: [Reports]
 *     summary: Exportar reporte de rendimiento
 *     responses:
 *       200:
 *         description: Archivo exportado
 */

router.get('/export', validateExportReport, exportRestaurantPerformanceReport);

export default router;