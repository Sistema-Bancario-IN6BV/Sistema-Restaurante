import Order from '../orders/order.model.js';
import OrderDetail from '../orderDetails/orderDetail.model.js';
import Reservation from '../reservations/reservation.model.js';
import Restaurant from '../restaurants/restaurant.model.js';
import Review from '../reviews/review.model.js';
import Table from '../tables/table.model.js';

const buildDateFilter = (from, to, field = 'createdAt') => {
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);
    if (!Object.keys(dateFilter).length) return {};
    return { [field]: dateFilter };
};

const baseRestaurantMatch = (restaurantId) => (restaurantId ? { restaurant: restaurantId } : {});

const createSimplePdf = (lines) => {
    const escapePdf = (text) => String(text)
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');

    const contentLines = lines.slice(0, 42).map(
        (line, index) => `BT /F1 10 Tf 50 ${780 - index * 16} Td (${escapePdf(line)}) Tj ET`
    );
    const stream = contentLines.join('\n');

    const objects = [
        '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
        '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
        '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
        '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
        `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`
    ];

    let pdf = '%PDF-1.4\n';
    const offsets = [0];

    objects.forEach((obj) => {
        offsets.push(pdf.length);
        pdf += `${obj}\n`;
    });

    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    offsets.slice(1).forEach((offset) => {
        pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    });
    pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return Buffer.from(pdf, 'binary');
};

const getDemandStats = async (restaurantId, from, to) => {
    const orderMatch = { ...baseRestaurantMatch(restaurantId), isActive: true, ...buildDateFilter(from, to) };
    const reservationMatch = { ...baseRestaurantMatch(restaurantId), isActive: true, ...buildDateFilter(from, to, 'reservationDate') };

    const [demandByRestaurant, totalReservations, peakOrderHours] = await Promise.all([
        Order.aggregate([
            { $match: orderMatch },
            { $group: { _id: '$restaurant', totalOrders: { $sum: 1 }, totalRevenue: { $sum: '$total' } } },
            { $lookup: { from: 'restaurants', localField: '_id', foreignField: '_id', as: 'restaurant' } },
            { $unwind: '$restaurant' },
            { $project: { _id: 0, restaurantId: '$restaurant._id', restaurantName: '$restaurant.name', totalOrders: 1, totalRevenue: { $round: ['$totalRevenue', 2] } } },
            { $sort: { totalOrders: -1 } }
        ]),
        Reservation.countDocuments(reservationMatch),
        Order.aggregate([
            { $match: orderMatch },
            { $group: { _id: { $hour: '$createdAt' }, totalOrders: { $sum: 1 } } },
            { $sort: { totalOrders: -1, _id: 1 } },
            { $project: { _id: 0, hour: '$_id', totalOrders: 1 } }
        ])
    ]);

    return {
        demandByRestaurant,
        totalReservations,
        peakHours: peakOrderHours.slice(0, 5),
        charts: {
            demandByRestaurant: demandByRestaurant.map((item) => ({ label: item.restaurantName, value: item.totalOrders })),
            peakHours: peakOrderHours.map((item) => ({ label: `${item.hour.toString().padStart(2, '0')}:00`, value: item.totalOrders }))
        }
    };
};

const getTopDishes = async (restaurantId, from, to) => {
    const orderMatch = { ...baseRestaurantMatch(restaurantId), ...buildDateFilter(from, to) };

    return OrderDetail.aggregate([
        { $lookup: { from: 'orders', localField: 'order', foreignField: '_id', as: 'order' } },
        { $unwind: '$order' },
        {
            $match: {
                isActive: true,
                'order.isActive': true,
                ...(orderMatch.restaurant ? { 'order.restaurant': orderMatch.restaurant } : {}),
                ...(orderMatch.createdAt ? { 'order.createdAt': orderMatch.createdAt } : {})
            }
        },
        { $lookup: { from: 'menuitems', localField: 'menuItem', foreignField: '_id', as: 'menuItem' } },
        { $unwind: '$menuItem' },
        { $group: { _id: '$menuItem._id', dishName: { $first: '$menuItem.name' }, totalSold: { $sum: '$quantity' }, totalRevenue: { $sum: '$subtotal' } } },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, menuItemId: '$_id', dishName: 1, totalSold: 1, totalRevenue: { $round: ['$totalRevenue', 2] } } }
    ]);
};

const getRestaurantPerformance = async (restaurantId, from, to) => {
    const orderMatch = { ...baseRestaurantMatch(restaurantId), isActive: true, ...buildDateFilter(from, to) };
    const reservationMatch = { ...baseRestaurantMatch(restaurantId), isActive: true, ...buildDateFilter(from, to, 'reservationDate') };

    const [ordersByRestaurant, reservationsByRestaurant, reviewsByRestaurant, capacityByRestaurant, ordersPerDay] = await Promise.all([
        Order.aggregate([{ $match: orderMatch }, { $group: { _id: '$restaurant', totalRevenue: { $sum: '$total' }, orderCount: { $sum: 1 } } }]),
        Reservation.aggregate([{ $match: reservationMatch }, { $group: { _id: '$restaurant', reservationCount: { $sum: 1 } } }]),
        Review.aggregate([{ $match: { ...baseRestaurantMatch(restaurantId), isActive: true } }, { $group: { _id: '$restaurant', averageSatisfaction: { $avg: '$rating' }, reviews: { $sum: 1 } } }]),
        Table.aggregate([{ $match: { ...baseRestaurantMatch(restaurantId), isActive: true } }, { $group: { _id: '$restaurant', totalCapacity: { $sum: '$capacity' } } }]),
        Order.aggregate([
            { $match: orderMatch },
            { $group: { _id: { restaurant: '$restaurant', day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } }, totalOrders: { $sum: 1 } } },
            { $project: { _id: 0, restaurantId: '$_id.restaurant', day: '$_id.day', totalOrders: 1 } },
            { $sort: { day: 1 } }
        ])
    ]);

    const restaurants = await Restaurant.find({ ...baseRestaurantMatch(restaurantId), isActive: true }, { name: 1 }).lean();

    return restaurants.map((restaurant) => {
        const orderStats = ordersByRestaurant.find((item) => item._id.toString() === restaurant._id.toString()) || { totalRevenue: 0, orderCount: 0 };
        const reservationStats = reservationsByRestaurant.find((item) => item._id.toString() === restaurant._id.toString()) || { reservationCount: 0 };
        const reviewStats = reviewsByRestaurant.find((item) => item._id.toString() === restaurant._id.toString()) || { averageSatisfaction: 0, reviews: 0 };
        const capacityStats = capacityByRestaurant.find((item) => item._id.toString() === restaurant._id.toString()) || { totalCapacity: 0 };
        const occupation = capacityStats.totalCapacity ? (reservationStats.reservationCount / capacityStats.totalCapacity) * 100 : 0;

        return {
            restaurantId: restaurant._id,
            restaurantName: restaurant.name,
            totalRevenue: Number(orderStats.totalRevenue.toFixed(2)),
            averageOccupation: Number(occupation.toFixed(2)),
            ordersPerDay: ordersPerDay.filter((item) => item.restaurantId.toString() === restaurant._id.toString()),
            totalOrders: orderStats.orderCount,
            reservations: reservationStats.reservationCount,
            customerSatisfaction: Number(reviewStats.averageSatisfaction.toFixed(2)),
            reviewCount: reviewStats.reviews
        };
    });
};

const buildCsv = (rows) => {
    if (!rows.length) return 'No hay datos disponibles';
    const headers = Object.keys(rows[0]);
    const lines = [headers.join(',')];

    rows.forEach((row) => {
        const values = headers.map((header) => {
            const value = row[header];
            const normalizedValue = typeof value === 'object' ? JSON.stringify(value) : value;
            return `"${String(normalizedValue ?? '').replace(/"/g, '""')}"`;
        });
        lines.push(values.join(','));
    });

    return lines.join('\n');
};

export const getOverviewReport = async (req, res) => {
    try {
        const { from, to, restaurantId } = req.query;
        const [demandStats, topDishes] = await Promise.all([getDemandStats(restaurantId, from, to), getTopDishes(restaurantId, from, to)]);

        return res.status(200).json({
            success: true,
            reportType: 'OVERVIEW',
            filters: { from, to, restaurantId },
            data: {
                ...demandStats,
                topDishes,
                charts: {
                    ...demandStats.charts,
                    topDishes: topDishes.map((dish) => ({ label: dish.dishName, value: dish.totalSold }))
                }
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al generar informe general', error: error.message });
    }
};

export const getRestaurantPerformanceReport = async (req, res) => {
    try {
        const { from, to, restaurantId } = req.query;
        const performance = await getRestaurantPerformance(restaurantId, from, to);

        return res.status(200).json({
            success: true,
            reportType: 'RESTAURANT_PERFORMANCE',
            filters: { from, to, restaurantId },
            data: {
                performance,
                charts: {
                    revenueByRestaurant: performance.map((item) => ({ label: item.restaurantName, value: item.totalRevenue })),
                    satisfactionByRestaurant: performance.map((item) => ({ label: item.restaurantName, value: item.customerSatisfaction }))
                }
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al generar informe de desempeño', error: error.message });
    }
};

export const exportRestaurantPerformanceReport = async (req, res) => {
    try {
        const { format = 'excel', from, to, restaurantId } = req.query;
        const performance = await getRestaurantPerformance(restaurantId, from, to);

        if (format === 'excel') {
            const csv = buildCsv(performance);
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename="restaurant-performance-report.csv"');
            return res.status(200).send(csv);
        }

        const lines = [
            'Reporte de desempeño de restaurantes',
            `Generado: ${new Date().toLocaleString()}`,
            `Filtros -> desde: ${from || 'N/A'} | hasta: ${to || 'N/A'} | restaurante: ${restaurantId || 'Todos'}`,
            ''
        ];

        performance.forEach((item, index) => {
            lines.push(`${index + 1}. ${item.restaurantName}`);
            lines.push(`Ingresos: Q${item.totalRevenue}`);
            lines.push(`Ocupación promedio: ${item.averageOccupation}%`);
            lines.push(`Pedidos totales: ${item.totalOrders}`);
            lines.push(`Reservaciones: ${item.reservations}`);
            lines.push(`Satisfacción cliente: ${item.customerSatisfaction} (${item.reviewCount} reseñas)`);
            lines.push('');
        });

        const pdfBuffer = createSimplePdf(lines);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="restaurant-performance-report.pdf"');
        return res.status(200).send(pdfBuffer);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al exportar informe', error: error.message });
    }
};