'use strict';

import Order from '../orders/order.model.js';
import Invoice from '../invoices/invoice.model.js';
import Review from '../reviews/review.model.js';
import Reservation from '../reservations/reservation.model.js';
import Restaurant from '../restaurants/restaurant.model.js';
import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { generateDoughnutChart, generateBarChart, generateLineChart } from '../../helpers/chart-generator.js';

const { Types } = mongoose;

// GET /reports/restaurant/:id/stats
export const getRestaurantStats = async (req, res) => {
    try {
        const restaurantId = new Types.ObjectId(req.params.id);
        const { from, to, format = 'pdf' } = req.query;
        const dateFilter = {};
        if (from) dateFilter.$gte = new Date(from);
        if (to) dateFilter.$lte = new Date(to);
        const matchDate = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};

        const [orderStats, revenueStats, reviewStats, reservationStats, restaurant] = await Promise.all([
            Order.aggregate([
                { $match: { restaurantId, active: true, ...matchDate } },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            Invoice.aggregate([
                { $match: { restaurantId, status: 'PAID', ...matchDate } },
                { $group: { _id: null, totalRevenue: { $sum: '$total' }, invoiceCount: { $sum: 1 } } },
            ]),
            Review.aggregate([
                { $match: { restaurantId, active: true } },
                { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
            ]),
            Reservation.aggregate([
                { $match: { restaurantId, active: true, ...matchDate } },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            Restaurant.findById(restaurantId).select('name email phone'),
        ]);

        const stats = {
            orders: orderStats,
            revenue: revenueStats[0] || { totalRevenue: 0, invoiceCount: 0 },
            reviews: reviewStats[0] || { avgRating: 0, count: 0 },
            reservations: reservationStats,
        };

        if (format === 'excel') {
            return generateStatsPDF(restaurant, stats, res, 'excel');
        }
        return generateStatsPDF(restaurant, stats, res);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Función auxiliar para generar PDF/Excel de estadísticas
const generateStatsPDF = async (restaurant, stats, res, format = 'pdf') => {
    try {
        if (format === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Estadísticas');

            sheet.columns = [
                { header: 'Métrica', key: 'metric', width: 25 },
                { header: 'Valor', key: 'value', width: 20 },
            ];

            const rows = [
                { metric: 'Restaurante', value: restaurant?.name || 'N/A' },
                { metric: 'Email', value: restaurant?.email || 'N/A' },
                { metric: 'Teléfono', value: restaurant?.phone || 'N/A' },
                { metric: '', value: '' },
                { metric: '--- ÓRDENES ---', value: '' },
            ];

            stats.orders.forEach(o => {
                rows.push({ metric: `Órdenes - ${o._id}`, value: o.count });
            });

            rows.push({ metric: '', value: '' }, { metric: '--- INGRESOS ---', value: '' });
            rows.push({ metric: 'Ingresos Totales', value: `Q${stats.revenue.totalRevenue?.toFixed(2) || '0.00'}` });
            rows.push({ metric: 'Facturas Pagadas', value: stats.revenue.invoiceCount || 0 });

            rows.push({ metric: '', value: '' }, { metric: '--- REVIEWS ---', value: '' });
            rows.push({ metric: 'Calificación Promedio', value: stats.reviews?.avgRating?.toFixed(1) || 'N/A' });
            rows.push({ metric: 'Total de Reseñas', value: stats.reviews?.count || 0 });

            rows.forEach(r => sheet.addRow(r));
            sheet.getRow(1).font = { bold: true };
            sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
            sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="estadisticas-restaurante.xlsx"');
            await workbook.xlsx.write(res);
            res.end();
        } else {
            const doc = new PDFDocument({ margin: 50 });
            res.header('Content-Type', 'application/pdf');
            res.header('Content-Disposition', 'attachment; filename="estadisticas-restaurante.pdf"');
            doc.pipe(res);

            // Header Corporativo
            doc.rect(0, 0, doc.page.width, 100).fill('#2c3e50');
            doc.fillColor('white').fontSize(24).text(`Estadísticas de Operación`, 50, 30);
            doc.fontSize(12).text(restaurant?.name || 'Restaurante', 50, 60);
            doc.fontSize(10).text(`Generado: ${new Date().toLocaleDateString()}`, doc.page.width - 200, 60, { align: 'right' });

            // Chart
            doc.fillColor('black');
            if (stats.orders && stats.orders.length > 0) {
                const labels = stats.orders.map(o => o._id);
                const data = stats.orders.map(o => o.count);
                const buffer = await generateDoughnutChart(labels, data, 'Órdenes por Estado');
                doc.image(buffer, 80, 110, { width: 450 });
            }

            // Detalle Tabular
            let yPos = 410;
            doc.fontSize(18).fillColor('#2c3e50').text('Resumen Financiero', 50, yPos);
            doc.moveTo(50, yPos + 25).lineTo(550, yPos + 25).strokeColor('#bdc3c7').lineWidth(1).stroke();

            yPos += 45;
            doc.fontSize(12).fillColor('black')
                .text('Ingresos Totales (Monto):', 60, yPos)
                .text(`Q${stats.revenue.totalRevenue?.toFixed(2) || '0.00'}`, 300, yPos);
            yPos += 25;
            doc.text('Facturas Emitidas Pagadas:', 60, yPos)
                .text(`${stats.revenue.invoiceCount || 0}`, 300, yPos);

            yPos += 50;
            doc.fontSize(18).fillColor('#2c3e50').text('Satisfacción del Cliente', 50, yPos);
            doc.moveTo(50, yPos + 25).lineTo(550, yPos + 25).strokeColor('#bdc3c7').stroke();

            yPos += 45;
            doc.fontSize(12).fillColor('black')
                .text('Calificación Promedio Histórica:', 60, yPos)
                .text(`${stats.reviews?.avgRating?.toFixed(1) || 'N/A'} / 5.0`, 300, yPos);
            yPos += 25;
            doc.text('Total de Reseñas Escritas:', 60, yPos)
                .text(`${stats.reviews?.count || 0}`, 300, yPos);

            doc.end();
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /reports/restaurant/:id/top-dishes
export const getTopDishes = async (req, res) => {
    try {
        const restaurantId = new Types.ObjectId(req.params.id);
        const { limit = 10, format = 'pdf' } = req.query;

        const topDishes = await Order.aggregate([
            { $match: { restaurantId, status: 'DELIVERED', active: true } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.menuItemId',
                    name: { $first: '$items.name' },
                    totalSold: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: '$items.subtotal' },
                },
            },
            { $sort: { totalSold: -1 } },
            { $limit: parseInt(limit) },
        ]);

        const restaurant = await Restaurant.findById(restaurantId).select('name');

        if (format === 'excel') {
            return generateTopDishesPDF(restaurant, topDishes, res, 'excel');
        }
        return generateTopDishesPDF(restaurant, topDishes, res);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const generateTopDishesPDF = async (restaurant, dishes, res, format = 'pdf') => {
    try {
        if (format === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Top Platos');

            sheet.columns = [
                { header: 'Plato', key: 'name', width: 30 },
                { header: 'Cantidad Vendida', key: 'totalSold', width: 18 },
                { header: 'Ingresos', key: 'totalRevenue', width: 15 },
            ];

            dishes.forEach(d => {
                sheet.addRow({
                    name: d.name,
                    totalSold: d.totalSold,
                    totalRevenue: `Q${d.totalRevenue?.toFixed(2) || '0.00'}`,
                });
            });

            sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="top-platos.xlsx"');
            await workbook.xlsx.write(res);
            res.end();
        } else {
            const doc = new PDFDocument({ margin: 50 });
            res.header('Content-Type', 'application/pdf');
            res.header('Content-Disposition', 'attachment; filename="top-platos.pdf"');
            doc.pipe(res);

            // Header
            doc.rect(0, 0, doc.page.width, 100).fill('#27ae60');
            doc.fillColor('white').fontSize(24).text(`Análisis de Platos Más Vendidos`, 50, 30);
            doc.fontSize(12).text(restaurant?.name || 'Restaurante', 50, 60);
            doc.fontSize(10).text(`Generado: ${new Date().toLocaleDateString()}`, doc.page.width - 200, 60, { align: 'right' });

            // Chart
            doc.fillColor('black');
            if (dishes.length > 0) {
                // Reducimos las etiquetas si son muy largas
                const labels = dishes.slice(0, 5).map(d => d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name);
                const data = dishes.slice(0, 5).map(d => d.totalSold);
                const buffer = await generateBarChart(labels, data, 'Top 5 Platos (Volumen de Venta)', 'Platos Vendidos', '#27ae60');
                doc.image(buffer, 80, 110, { width: 450 });
            }

            let yPos = 400;
            // Table Header estético
            doc.fillColor('white').rect(50, yPos, 500, 25).fill('#34495e');
            doc.fillColor('white').fontSize(11)
                .text('Nombre del Plato', 70, yPos + 8)
                .text('Cant de Ventas', 300, yPos + 8)
                .text('Ingresos ($ Q)', 420, yPos + 8);

            yPos += 25;
            dishes.forEach((d, i) => {
                // Zebra striping para la tabla
                if (i % 2 === 0) doc.rect(50, yPos, 500, 20).fill('#ecf0f1');
                doc.fillColor('#2c3e50').fontSize(10);
                doc.text(d.name, 70, yPos + 5)
                    .text(d.totalSold.toString(), 300, yPos + 5)
                    .text(`Q${d.totalRevenue?.toFixed(2) || '0.00'}`, 420, yPos + 5);
                yPos += 20;
            });

            doc.end();
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /reports/restaurant/:id/revenue
export const getRevenue = async (req, res) => {
    try {
        const restaurantId = new Types.ObjectId(req.params.id);
        const { period = 'daily', from, to, format = 'pdf' } = req.query;

        const dateFilter = {};
        if (from) dateFilter.$gte = new Date(from);
        if (to) dateFilter.$lte = new Date(to);
        const matchDate = Object.keys(dateFilter).length ? { paidAt: dateFilter } : {};

        const groupBy = {
            daily: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
            weekly: { $dateToString: { format: '%Y-W%V', date: '$paidAt' } },
            monthly: { $dateToString: { format: '%Y-%m', date: '$paidAt' } },
        };

        const revenue = await Invoice.aggregate([
            { $match: { restaurantId, status: 'PAID', ...matchDate } },
            {
                $group: {
                    _id: groupBy[period] || groupBy.daily,
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const restaurant = await Restaurant.findById(restaurantId).select('name');

        if (format === 'excel') {
            return generateRevenuePDF(restaurant, revenue, period, res, 'excel');
        }
        return generateRevenuePDF(restaurant, revenue, period, res);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const generateRevenuePDF = async (restaurant, revenue, period, res, format = 'pdf') => {
    try {
        if (format === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Ingresos');

            sheet.columns = [
                { header: period.charAt(0).toUpperCase() + period.slice(1), key: 'period', width: 20 },
                { header: 'Ingresos', key: 'revenue', width: 15 },
                { header: 'Órdenes', key: 'orders', width: 12 },
            ];

            revenue.forEach(r => {
                sheet.addRow({
                    period: r._id,
                    revenue: `Q${r.revenue?.toFixed(2) || '0.00'}`,
                    orders: r.orders,
                });
            });

            sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="ingresos.xlsx"');
            await workbook.xlsx.write(res);
            res.end();
        } else {
            const doc = new PDFDocument({ layout: 'landscape', margin: 50 });
            res.header('Content-Type', 'application/pdf');
            res.header('Content-Disposition', 'attachment; filename="ingresos.pdf"');
            doc.pipe(res);

            // Header Landscape
            doc.rect(0, 0, doc.page.width, 80).fill('#8e44ad');
            doc.fillColor('white').fontSize(24).text(`Curva de Ingresos Financieros (${period.toUpperCase()})`, 50, 25);
            doc.fontSize(12).text(restaurant?.name || 'Restaurante', doc.page.width - 300, 25, { align: 'right' });

            // Chart Landscape (más ancho)
            doc.fillColor('black');
            if (revenue.length > 0) {
                const labels = revenue.map(r => r._id);
                const data = revenue.map(r => r.revenue);
                const buffer = await generateLineChart(labels, data, 'Tendencia de Ingresos (Quetzales)', `Ingresos por ${period}`);
                doc.image(buffer, 100, 100, { width: 600 });
            }

            let yPos = 400;
            // Table Header Horizontal
            doc.fillColor('white').rect(50, yPos, 692, 25).fill('#34495e');
            doc.fillColor('white').fontSize(11)
                .text('Período Contable', 80, yPos + 8)
                .text('Pedidos Cumplidos', 350, yPos + 8)
                .text('Ingreso Neto (Q)', 580, yPos + 8);

            yPos += 25;
            revenue.forEach((r, i) => {
                // Manejo de Overflow en layout landscape
                if (yPos > doc.page.height - 50) {
                    doc.addPage({ layout: 'landscape', margin: 50 });
                    yPos = 50;
                }
                if (i % 2 === 0) doc.rect(50, yPos, 692, 20).fill('#f5f6fa');
                doc.fillColor('#2c3e50').fontSize(10);
                doc.text(r._id, 80, yPos + 5)
                    .text(r.orders.toString(), 350, yPos + 5)
                    .text(`Q ${r.revenue?.toFixed(2) || '0.00'}`, 580, yPos + 5);
                yPos += 20;
            });

            doc.end();
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /reports/restaurant/:id/peak-hours
export const getPeakHours = async (req, res) => {
    try {
        const restaurantId = new Types.ObjectId(req.params.id);
        const { format = 'pdf' } = req.query;

        const peakHours = await Order.aggregate([
            { $match: { restaurantId, active: true, status: { $in: ['DELIVERED', 'READY'] } } },
            {
                $group: {
                    _id: { $hour: '$createdAt' },
                    orderCount: { $sum: 1 },
                    avgTotal: { $avg: '$total' },
                },
            },
            { $sort: { orderCount: -1 } },
        ]);

        const restaurant = await Restaurant.findById(restaurantId).select('name');

        if (format === 'excel') {
            return generatePeakHoursPDF(restaurant, peakHours, res, 'excel');
        }
        return generatePeakHoursPDF(restaurant, peakHours, res);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const generatePeakHoursPDF = async (restaurant, hours, res, format = 'pdf') => {
    try {
        if (format === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Horas Pico');

            sheet.columns = [
                { header: 'Hora', key: 'hour', width: 10 },
                { header: 'Órdenes', key: 'orderCount', width: 12 },
                { header: 'Promedio por Orden', key: 'avgTotal', width: 18 },
            ];

            hours.forEach(h => {
                sheet.addRow({
                    hour: `${h._id}:00`,
                    orderCount: h.orderCount,
                    avgTotal: `Q${h.avgTotal?.toFixed(2) || '0.00'}`,
                });
            });

            sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="horas-pico.xlsx"');
            await workbook.xlsx.write(res);
            res.end();
        } else {
            const doc = new PDFDocument({ margin: 50 });
            res.header('Content-Type', 'application/pdf');
            res.header('Content-Disposition', 'attachment; filename="horas-pico.pdf"');
            doc.pipe(res);

            // Header Corporativo Naranja
            doc.rect(0, 0, doc.page.width, 100).fill('#e67e22');
            doc.fillColor('white').fontSize(24).text(`Análisis de Flujo y Horas Pico`, 50, 30);
            doc.fontSize(12).text(restaurant?.name || 'Restaurante', 50, 60);
            doc.fontSize(10).text(`Generado: ${new Date().toLocaleDateString()}`, doc.page.width - 200, 60, { align: 'right' });

            // Chart
            doc.fillColor('black');
            if (hours.length > 0) {
                // Orden cronológico explícito antes del render
                const sortedHours = [...hours].sort((a, b) => a._id - b._id);
                const labels = sortedHours.map(h => `${h._id}:00`);
                const data = sortedHours.map(h => h.orderCount);
                const buffer = await generateBarChart(labels, data, 'Mapa de Calor de Órdenes', 'Frecuencia de Tráfico (Órdenes)', '#e67e22');
                doc.image(buffer, 80, 110, { width: 450 });
            }

            let yPos = 400;
            // Table Header con color corporativo #34495e
            doc.fillColor('white').rect(50, yPos, 500, 25).fill('#34495e');
            doc.fillColor('white').fontSize(11)
                .text('Banda Horaria (24H)', 80, yPos + 8)
                .text('Cantidad Despachada', 250, yPos + 8)
                .text('Ticket Promedio (Q)', 400, yPos + 8);

            yPos += 25;
            // Ordenamos para la iteración de la tabla nativamente cronológicamente
            const tableData = [...hours].sort((a, b) => a._id - b._id);
            tableData.forEach((h, i) => {
                // Alternando colores suaves de celdas
                if (i % 2 === 0) doc.rect(50, yPos, 500, 20).fill('#fdf5f0');
                doc.fillColor('#2c3e50').fontSize(10);
                doc.text(`${h._id}:00`, 80, yPos + 5)
                    .text(h.orderCount.toString(), 250, yPos + 5)
                    .text(`Q ${h.avgTotal?.toFixed(2) || '0.00'}`, 400, yPos + 5);
                yPos += 20;
            });

            doc.end();
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /reports/global (PLATFORM_ADMIN)
export const getGlobalStats = async (req, res) => {
    const { format } = req.query;
    if (format === 'excel') return exportGlobalExcel(req, res);
    if (format === 'pdf') return exportGlobalPdf(req, res);

    try {
        const [restaurantCount, totalRevenue, orderCount] = await Promise.all([
            Restaurant.countDocuments({ active: true }),
            Invoice.aggregate([
                { $match: { status: 'PAID' } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            Order.countDocuments({ active: true }),
        ]);

        const topRestaurants = await Restaurant.find({ active: true })
            .sort({ 'rating.average': -1, 'rating.count': -1 })
            .limit(10)
            .select('name rating category');

        res.json({
            success: true,
            data: {
                restaurants: restaurantCount,
                totalOrders: orderCount,
                totalRevenue: totalRevenue[0]?.total || 0,
                topRestaurants,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /reports/global/export/excel (PLATFORM_ADMIN)
export const exportGlobalExcel = async (req, res) => {
    try {
        const [restaurantCount, totalRevenue, orderCount] = await Promise.all([
            Restaurant.countDocuments({ active: true }),
            Invoice.aggregate([
                { $match: { status: 'PAID' } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            Order.countDocuments({ active: true }),
        ]);

        const topRestaurants = await Restaurant.find({ active: true })
            .sort({ 'rating.average': -1, 'rating.count': -1 })
            .limit(10)
            .select('name rating category');

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Resumen Global');

        sheet.columns = [
            { header: 'Métrica', key: 'metric', width: 35 },
            { header: 'Valor', key: 'value', width: 40 },
        ];

        sheet.addRow({ metric: 'Total de Restaurantes', value: restaurantCount });
        sheet.addRow({ metric: 'Total de Órdenes', value: orderCount });
        sheet.addRow({ metric: 'Ingresos Totales (Q)', value: `Q${(totalRevenue[0]?.total || 0).toFixed(2)}` });

        sheet.addRow({ metric: '', value: '' });
        sheet.addRow({ metric: '--- MEJORES RESTAURANTES (TOP 10) ---', value: '' });

        topRestaurants.forEach((r, i) => {
            sheet.addRow({
                metric: `${i + 1}. ${r.name}`,
                value: `Categoría: ${r.category} | Calificación: ${r.rating?.average || 0} (${r.rating?.count || 0} reseñas)`
            });
        });

        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="reporte-global.xlsx"');
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /reports/global/export/pdf (PLATFORM_ADMIN)
export const exportGlobalPdf = async (req, res) => {
    try {
        const [restaurantCount, totalRevenue, orderCount] = await Promise.all([
            Restaurant.countDocuments({ active: true }),
            Invoice.aggregate([
                { $match: { status: 'PAID' } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            Order.countDocuments({ active: true }),
        ]);

        const topRestaurants = await Restaurant.find({ active: true })
            .sort({ 'rating.average': -1, 'rating.count': -1 })
            .limit(10)
            .select('name rating category');

        const doc = new PDFDocument({ margin: 50 });
        res.header('Content-Type', 'application/pdf');
        res.header('Content-Disposition', 'attachment; filename="reporte-global.pdf"');
        doc.pipe(res);

        doc.rect(0, 0, doc.page.width, 100).fill('#2980b9');
        doc.fillColor('white').fontSize(24).text('Reporte Global de la Plataforma', 50, 30);
        doc.fontSize(10).text(`Generado: ${new Date().toLocaleDateString()}`, doc.page.width - 200, 60, { align: 'right' });

        doc.fillColor('black');
        let yPos = 130;
        doc.fontSize(18).fillColor('#2c3e50').text('Resumen General', 50, yPos);
        doc.moveTo(50, yPos + 25).lineTo(550, yPos + 25).strokeColor('#bdc3c7').lineWidth(1).stroke();

        yPos += 45;
        doc.fontSize(12).fillColor('black')
            .text('Total de Restaurantes Registrados:', 60, yPos)
            .text(restaurantCount.toString(), 400, yPos);
        yPos += 25;
        doc.text('Total de Órdenes a Nivel Global:', 60, yPos)
            .text(orderCount.toString(), 400, yPos);
        yPos += 25;
        doc.text('Ingresos Generados (Quetzales):', 60, yPos)
            .text(`Q${(totalRevenue[0]?.total || 0).toFixed(2)}`, 400, yPos);

        yPos += 50;
        doc.fontSize(18).fillColor('#2c3e50').text('Top Mejores Restaurantes', 50, yPos);
        doc.moveTo(50, yPos + 25).lineTo(550, yPos + 25).strokeColor('#bdc3c7').lineWidth(1).stroke();

        yPos += 45;
        doc.fillColor('white').rect(50, yPos, 500, 25).fill('#34495e');
        doc.fillColor('white').fontSize(11)
            .text('Puesto', 60, yPos + 8)
            .text('Restaurante', 120, yPos + 8)
            .text('Categoría', 320, yPos + 8)
            .text('Calificación', 440, yPos + 8);

        yPos += 25;
        topRestaurants.forEach((r, i) => {
            if (yPos > doc.page.height - 50) {
                doc.addPage({ margin: 50 });
                yPos = 50;
            }
            if (i % 2 === 0) doc.rect(50, yPos, 500, 20).fill('#ecf0f1');
            doc.fillColor('#2c3e50').fontSize(10);
            doc.text(`#${i + 1}`, 60, yPos + 5)
                .text(r.name.substring(0, 30), 120, yPos + 5)
                .text(r.category || 'N/A', 320, yPos + 5)
                .text(`${(r.rating?.average || 0).toFixed(1)} (${r.rating?.count || 0})`, 440, yPos + 5);
            yPos += 20;
        });

        doc.end();
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
