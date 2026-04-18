import ExcelJS from 'exceljs';

export const generateStatsExcel = async (restaurant, stats) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema Restaurante';

    // Sheet 1: General Stats
    const summarySheet = workbook.addWorksheet('Resumen General');
    summarySheet.columns = [
        { header: 'Métrica', key: 'metric', width: 30 },
        { header: 'Valor', key: 'value', width: 20 }
    ];
    summarySheet.addRow({ metric: 'Restaurante', value: restaurant.name });
    summarySheet.addRow({ metric: 'Total de Órdenes', value: stats.orders.totalOrders });
    summarySheet.addRow({ metric: 'Ingresos Totales (Q)', value: stats.orders.totalRevenue });
    summarySheet.addRow({ metric: 'Valor Promedio por Orden (Q)', value: stats.orders.averageOrderValue });
    summarySheet.addRow({ metric: 'Órdenes Entregadas', value: stats.orders.deliveredOrders });
    summarySheet.addRow({ metric: 'Órdenes Canceladas', value: stats.orders.cancelledOrders });
    summarySheet.addRow({ metric: 'Reseñas Totales', value: stats.reviews.totalReviews });
    summarySheet.addRow({ metric: 'Calificación Promedio', value: stats.reviews.averageRating });

    // Format headers
    summarySheet.getRow(1).font = { bold: true };

    // Sheet 2: Top Dishes
    const dishesSheet = workbook.addWorksheet('Top Platos');
    dishesSheet.columns = [
        { header: 'Plato', key: 'name', width: 30 },
        { header: 'Cantidad Pedida', key: 'quantity', width: 20 },
        { header: 'Ingresos Generados (Q)', key: 'revenue', width: 25 },
        { header: 'Precio Promedio (Q)', key: 'price', width: 20 }
    ];
    dishesSheet.getRow(1).font = { bold: true };

    if (stats.topDishes) {
        stats.topDishes.forEach(dish => {
            dishesSheet.addRow({
                name: dish.itemName,
                quantity: dish.totalOrdered,
                revenue: dish.totalRevenue,
                price: dish.averagePrice
            });
        });
    }

    // Sheet 3: Peak Hours
    const hoursSheet = workbook.addWorksheet('Horas Pico');
    hoursSheet.columns = [
        { header: 'Hora del Día', key: 'hour', width: 15 },
        { header: 'Número de Pedidos', key: 'orders', width: 20 },
        { header: 'Ingresos (Q)', key: 'revenue', width: 20 }
    ];
    hoursSheet.getRow(1).font = { bold: true };

    if (stats.peakHours) {
        stats.peakHours.forEach(ph => {
            hoursSheet.addRow({
                hour: `${ph.hour}:00`,
                orders: ph.orderCount,
                revenue: ph.totalRevenue
            });
        });
    }

    // Sheet 4: Revenue (Daily)
    const revenueSheet = workbook.addWorksheet('Ingresos Diarios');
    revenueSheet.columns = [
        { header: 'Fecha', key: 'date', width: 15 },
        { header: 'Pedidos', key: 'orders', width: 15 },
        { header: 'Ingresos (Q)', key: 'revenue', width: 20 }
    ];
    revenueSheet.getRow(1).font = { bold: true };

    if (stats.revenue) {
        stats.revenue.forEach(rev => {
            const dateStr = rev._id.day ? `${rev._id.year}-${String(rev._id.month).padStart(2, '0')}-${String(rev._id.day).padStart(2, '0')}` : `${rev._id.year}-${String(rev._id.month).padStart(2, '0')}`;
            revenueSheet.addRow({
                date: dateStr,
                orders: rev.orderCount,
                revenue: rev.totalRevenue
            });
        });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
};

export const generateGlobalStatsExcel = async (stats) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema Restaurante';

    const sheet = workbook.addWorksheet('Estadísticas Globales');
    sheet.columns = [
        { header: 'Métrica', key: 'metric', width: 40 },
        { header: 'Valor', key: 'value', width: 25 }
    ];

    sheet.addRow({ metric: 'Total de Restaurantes Activos', value: stats.totalRestaurants });
    sheet.addRow({ metric: 'Total de Órdenes Plataforma', value: stats.totalOrders });
    sheet.addRow({ metric: 'Ingresos Totales en Plataforma (Q)', value: stats.totalRevenue });
    sheet.addRow({ metric: 'Valor Promedio por Orden Global (Q)', value: stats.averageOrderValue });
    sheet.addRow({ metric: 'Total de Reseñas en Plataforma', value: stats.totalReviews });
    sheet.addRow({ metric: 'Calificación Promedio Global', value: stats.averagePlatformRating });

    sheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
};
