'use strict';

import {
    getTopSellingPlates,
    getPeakHours,
    getRestaurantDemand,
    getReservationStats,
    getRestaurantPerformance,
    getOrdersByDay,
    generateGeneralReportPDF,
    generateRestaurantReportPDF,
    generateGeneralReportExcel,
    generateRestaurantReportExcel
} from './report.service.js';

// ==================== REPORTES DE DEMANDA (ENDPOINTS JSON) ====================

/**
 * GET /reports/top-selling-plates
 * Obtiene los platos más vendidos
 */
export const topSellingPlates = async (req, res) => {
    try {
        const { restaurantId, limit = 10 } = req.query;
        
        const data = await getTopSellingPlates(restaurantId, parseInt(limit));
        
        res.status(200).json({
            success: true,
            data: data,
            message: 'Platos más vendidos obtenidos exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET /reports/peak-hours
 * Obtiene las horas pico
 */
export const peakHours = async (req, res) => {
    try {
        const { restaurantId } = req.query;
        
        const data = await getPeakHours(restaurantId);
        
        res.status(200).json({
            success: true,
            data: data,
            message: 'Horas pico obtenidas exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET /reports/restaurant-demand
 * Obtiene la demanda de restaurantes (ingresos)
 */
export const restaurantDemand = async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        
        const data = await getRestaurantDemand(parseInt(limit));
        
        res.status(200).json({
            success: true,
            data: data,
            message: 'Demanda de restaurantes obtenida exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET /reports/reservations-stats
 * Obtiene estadísticas de reservaciones
 */
export const reservationsStats = async (req, res) => {
    try {
        const { restaurantId } = req.query;
        
        const data = await getReservationStats(restaurantId);
        
        res.status(200).json({
            success: true,
            data: data,
            message: 'Estadísticas de reservaciones obtenidas exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET /reports/restaurant-performance/:restaurantId
 * Obtiene el desempeño detallado de un restaurante
 */
export const restaurantPerformance = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        
        const data = await getRestaurantPerformance(restaurantId);
        
        res.status(200).json({
            success: true,
            data: data,
            message: 'Desempeño del restaurante obtenido exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET /reports/orders-by-day
 * Obtiene pedidos por día
 */
export const ordersByDay = async (req, res) => {
    try {
        const { restaurantId, days = 30 } = req.query;
        
        const data = await getOrdersByDay(restaurantId, parseInt(days));
        
        res.status(200).json({
            success: true,
            data: data,
            message: 'Pedidos por día obtenidos exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================== REPORTES EN PDF ====================

/**
 * GET /reports/general-report/pdf
 * Genera reporte general en PDF
 */
export const generalReportPDF = async (req, res) => {
    try {
        await generateGeneralReportPDF(res);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET /reports/restaurant-report/pdf/:restaurantId
 * Genera reporte de restaurante en PDF
 */
export const restaurantReportPDF = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        
        await generateRestaurantReportPDF(restaurantId, res);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================== REPORTES EN EXCEL ====================

/**
 * GET /reports/general-report/excel
 * Genera reporte general en Excel
 */
export const generalReportExcel = async (req, res) => {
    try {
        await generateGeneralReportExcel(res);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET /reports/restaurant-report/excel/:restaurantId
 * Genera reporte de restaurante en Excel
 */
export const restaurantReportExcel = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        
        await generateRestaurantReportExcel(restaurantId, res);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
