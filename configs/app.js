'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import { requestLimit } from '../middlewares/request-limit.js';
import { errorHandler } from '../middlewares/handle-errors.js';
import { setupSwagger } from './swagger.js';
import restaurantRoutes from '../src/restaurants/restaurant.routes.js';
import menuItemRoutes from '../src/menuItems/menuItem.routes.js';
import tableRoutes from '../src/tables/table.routes.js';
import reservationRoutes from '../src/reservations/reservation.routes.js';
import orderRoutes from '../src/orders/order.routes.js';
import invoiceRoutes from '../src/invoices/invoice.routes.js';
import inventoryRoutes from '../src/inventory/inventory.routes.js';
import eventRoutes from '../src/events/event.routes.js';
import reviewRoutes from '../src/reviews/review.routes.js';
import reportRoutes from '../src/reports/report.routes.js';

const BASE_PATH = '/Restaurante/v1';

const middlewares = (app) => {
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    app.use(express.json({ limit: '10mb' }));
    app.use(cors(corsOptions));
    app.use(helmet(helmetConfiguration));
    app.use(requestLimit);
    app.use(morgan('dev'));
}

const routes = (app) => {

    app.get(`${BASE_PATH}`, (_req, res) => {
        res.status(200).json({
            success: true,
            message: 'Sistema Restaurante API',
            docs: `${BASE_PATH}/docs`,
            health: `${BASE_PATH}/health`
        })
    })

    app.get(`${BASE_PATH}/swagger`, (_req, res) => {
        res.redirect(`${BASE_PATH}/docs`)
    })

   app.use(`${BASE_PATH}/restaurants`, restaurantRoutes);
    app.use(`${BASE_PATH}/menu`, menuItemRoutes);
    app.use(`${BASE_PATH}/tables`, tableRoutes);
    app.use(`${BASE_PATH}/reservations`, reservationRoutes);
    app.use(`${BASE_PATH}/orders`, orderRoutes);
    app.use(`${BASE_PATH}/invoices`, invoiceRoutes);
    app.use(`${BASE_PATH}/inventory`, inventoryRoutes);
    app.use(`${BASE_PATH}/events`, eventRoutes);
    app.use(`${BASE_PATH}/reviews`, reviewRoutes);
    app.use(`${BASE_PATH}/reports`, reportRoutes);

    setupSwagger(app, BASE_PATH);

    app.get(`${BASE_PATH}/Health`, (request, response) => {
        response.status(200).json({
            status: 'Healthy',
            timestamp: new Date().toISOString(),
            service: 'Restaurant Admin Server'
        })
    })

    // Rutas de la aplicación
    /*
    app.use(`${BASE_PATH}/orders`, orderRoutes);
    app.use(`${BASE_PATH}/order-details`, orderDetailRoutes);
    app.use(`${BASE_PATH}/menu-items`, menuItemRoutes);
    app.use(`${BASE_PATH}/restaurants`, restaurantRoutes);
    */

    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Endpoint no encontrado en Admin Api'
        })
    })
}

export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT;
    app.set('trust proxy', 1);

    try {
        await dbConnection();
        middlewares(app);
        routes(app);

        app.use(errorHandler);

        app.listen(PORT, () => {
            console.log(`KinalSports Admin server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/health`);
            console.log(`Swagger UI: http://localhost:${PORT}${BASE_PATH}/docs`);
            console.log(`Swagger JSON: http://localhost:${PORT}${BASE_PATH}/docs.json`);
        })
    } catch (error) {
        console.error(`Error starting Admin Server: ${error.message}`);
        process.exit(1);
    }
}
