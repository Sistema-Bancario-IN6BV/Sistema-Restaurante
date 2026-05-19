import PDFDocument from 'pdfkit';

/**
 * Generate a PDF report with statistics and charts
 * @param {Object} restaurant - Restaurant info
 * @param {Object} stats - The aggregated statistics
 * @param {Object} charts - Buffers for the charts
 * @returns {Promise<Buffer>}
 */
export const generateStatsPdf = async (restaurant, stats, charts) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];
            
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Title
            doc.fontSize(25).text(`Reporte de Estadísticas - ${restaurant.name}`, { align: 'center' });
            doc.moveDown(2);

            // General Stats
            doc.fontSize(18).text('Estadísticas Generales');
            doc.moveDown(0.5);
            doc.fontSize(12)
               .text(`Total de Órdenes: ${stats.orders.totalOrders}`)
               .text(`Ingresos Totales: Q${(stats.orders.totalRevenue || 0).toFixed(2)}`)
               .text(`Valor Promedio de Orden: Q${(stats.orders.averageOrderValue || 0).toFixed(2)}`)
               .text(`Órdenes Entregadas: ${stats.orders.deliveredOrders}`)
               .text(`Órdenes Canceladas: ${stats.orders.cancelledOrders}`)
               .text(`Reseñas Totales: ${stats.reviews.totalReviews}`)
               .text(`Calificación Promedio: ${(stats.reviews.averageRating || 0).toFixed(1)} / 5.0`);
               
            doc.moveDown(2);

            // Top Dishes
            doc.fontSize(18).text('Platos Más Vendidos (Top 10)');
            doc.moveDown(0.5);
            if (stats.topDishes && stats.topDishes.length > 0) {
                stats.topDishes.forEach((dish, index) => {
                    doc.fontSize(12).text(`${index + 1}. ${dish.itemName} - ${dish.totalOrdered} pedidos (Ingresos: Q${(dish.totalRevenue || 0).toFixed(2)})`);
                });
            } else {
                doc.fontSize(12).text('No hay datos suficientes de platos vendidos.');
            }

            if (charts.topDishesChart) {
                doc.addPage();
                doc.fontSize(18).text('Gráfico: Platos Más Vendidos', { align: 'center' });
                doc.moveDown(1);
                doc.image(charts.topDishesChart, { fit: [500, 350], align: 'center' });
            }

            if (charts.revenueChart) {
                doc.addPage();
                doc.fontSize(18).text('Gráfico: Ingresos Diarios', { align: 'center' });
                doc.moveDown(1);
                doc.image(charts.revenueChart, { fit: [500, 350], align: 'center' });
            }

            if (charts.peakHoursChart) {
                doc.addPage();
                doc.fontSize(18).text('Gráfico: Horas Pico (Pedidos por Hora)', { align: 'center' });
                doc.moveDown(1);
                doc.image(charts.peakHoursChart, { fit: [500, 350], align: 'center' });
            }

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
