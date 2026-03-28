'use strict';

import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import Order from '../orders/order.model.js';
import Reservation from '../reservations/reservation.model.js';
import MenuItem from '../menuItems/menuItem.model.js';
import Review from '../reviews/review.model.js';
import Restaurant from '../restaurants/restaurant.model.js';
import Table from '../tables/table.model.js';

// ---------- consultas de datos ------------------------------------------------

export const getTopSellingPlates = async (restaurantId = null, limit = 10) => {
    const match = restaurantId
        ? { $match: { 'menuItem.restaurant': new mongoose.Types.ObjectId(restaurantId) } }
        : { $match: {} };

    const pipeline = [
        { $lookup: { from: 'menuitems', localField: 'menuItem', foreignField: '_id', as: 'menuItem' } },
        { $unwind: '$menuItem' },
        match,
        {
            $group: {
                _id: '$menuItem._id',
                name: { $first: '$menuItem.name' },
                quantity: { $sum: '$quantity' },
                totalRevenue: { $sum: '$subtotal' }
            }
        },
        { $sort: { quantity: -1 } },
        { $limit: limit }
    ];

    return OrderDetail.aggregate(pipeline);
};

export const getPeakHours = async (restaurantId = null) => {
    const match = restaurantId
        ? { $match: { restaurant: new mongoose.Types.ObjectId(restaurantId) } }
        : { $match: {} };

    const pipeline = [
        match,
        {
            $group: {
                _id: { $hour: '$createdAt' },
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$total' }
            }
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                hour: '$_id',
                totalOrders: 1,
                totalRevenue: 1,
                _id: 0
            }
        }
    ];

    return Order.aggregate(pipeline);
};

export const getRestaurantDemand = async (limit = 20) => {
    const pipeline = [
        { $match: { status: 'ENTREGADO' } },
        {
            $group: {
                _id: '$restaurant',
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$total' }
            }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: limit }
    ];

    return Order.aggregate(pipeline);
};

export const getReservationStats = async (restaurantId = null) => {
    const filter = restaurantId ? { restaurant: new mongoose.Types.ObjectId(restaurantId) } : {};
    const byStatus = await Reservation.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ]);
    const total = await Reservation.countDocuments(filter);
    return { total, byStatus };
};

export const getRestaurantPerformance = async (restaurantId) => {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) throw new Error('Restaurante no encontrado');

    const orderPipeline = [
        { $match: { restaurant: new mongoose.Types.ObjectId(restaurantId), status: 'ENTREGADO' } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                revenue: { $sum: '$total' },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: -1 } },
        { $limit: 30 }
    ];

    const daily = await Order.aggregate(orderPipeline);
    const totalRevenue = daily.reduce((s, d) => s + d.revenue, 0);
    const totalOrders = daily.reduce((s, d) => s + d.count, 0);

    const reservationCount = await Reservation.countDocuments({
        restaurant: new mongoose.Types.ObjectId(restaurantId),
        status: { $in: ['CONFIRMADA', 'FINALIZADA'] }
    });

    const totalTables = await Table.countDocuments({ restaurant: new mongoose.Types.ObjectId(restaurantId) });
    const occupancyRate = totalTables ? (reservationCount / totalTables) * 100 : 0;

    const reviewStats = await Review.aggregate([
        { $match: { restaurant: new mongoose.Types.ObjectId(restaurantId) } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    return {
        restaurantName: restaurant.name,
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders ? totalRevenue / totalOrders : 0,
        dailyOrders: daily,
        occupancyRate,
        totalReservations: reservationCount,
        customerSatisfaction: {
            averageRating: reviewStats[0]?.avg || 0,
            totalReviews: reviewStats[0]?.count || 0
        }
    };
};

export const getOrdersByDay = async (restaurantId = null, days = 30) => {
    const start = new Date();
    start.setDate(start.getDate() - days);
    const match = restaurantId
        ? { $match: { restaurant: new mongoose.Types.ObjectId(restaurantId), createdAt: { $gte: start } } }
        : { $match: { createdAt: { $gte: start } } };
    const pipeline = [
        match,
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 },
                revenue: { $sum: '$total' }
            }
        },
        { $sort: { _id: 1 } }
    ];
    return Order.aggregate(pipeline);
};

// ---------- generación de documentos ----------------------------------------

const writeSimpleTable = (doc, headers, rows) => {
    const startX = 50;
    let y = doc.y + 10;
    headers.forEach((h, i) => {
        doc.font('Helvetica-Bold').text(h, startX + i * 150, y);
    });
    y += 20;
    rows.forEach(r => {
        Object.values(r).forEach((val, i) => {
            doc.font('Helvetica').text(String(val), startX + i * 150, y);
        });
        y += 20;
    });
};

export const generateGeneralReportPDF = async (res) => {
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report-general.pdf');
    doc.pipe(res);

    doc.fontSize(20).text('Reporte General', { align: 'center' });
    doc.moveDown();

    const top = await getTopSellingPlates();
    writeSimpleTable(doc, ['Platillo', 'Cantidad', 'Ingresos'],
        top.map(p => ({ Platillo: p.name, Cantidad: p.quantity, Ingresos: `$${p.totalRevenue.toFixed(2)}` }))
    );

    doc.addPage();
    doc.fontSize(16).text('Películas altas'); // placeholder
    doc.end();
};

export const generateRestaurantReportPDF = async (restaurantId, res) => {
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${restaurantId}.pdf`);
    doc.pipe(res);

    const perf = await getRestaurantPerformance(restaurantId);
    doc.fontSize(18).text(`Reporte ${perf.restaurantName}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Total ingresos: $${perf.totalRevenue}
Pedidos totales: ${perf.totalOrders}`);
    doc.end();
};

export const generateGeneralReportExcel = async (res) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('General');
    sheet.columns = [
        { header: 'Platillo', key: 'name', width: 30 },
        { header: 'Cantidad', key: 'quantity', width: 10 },
        { header: 'Ingresos', key: 'totalRevenue', width: 15 }
    ];
    const top = await getTopSellingPlates();
    top.forEach(p => sheet.addRow({ name: p.name, quantity: p.quantity, totalRevenue: p.totalRevenue }));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=report-general.xlsx');
    await workbook.xlsx.write(res);
    res.end();
};

export const generateRestaurantReportExcel = async (restaurantId, res) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Restaurant');
    sheet.columns = [
        { header: 'Fecha', key: 'date', width: 15 },
        { header: 'Ingresos', key: 'revenue', width: 15 },
        { header: 'Pedidos', key: 'count', width: 10 }
    ];
    const orders = await getOrdersByDay(restaurantId);
    orders.forEach(o => sheet.addRow({ date: o._id, revenue: o.revenue, count: o.count }));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=report-${restaurantId}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
};
