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
import eventsRoutes from '../src/events/event.routes.js';
import menuItemRoutes from '../src/menuItems/menuItem.routes.js';
import orderRoutes from '../src/orders/order.routes.js';
import orderDetailsRoutes from '../src/orderDetails/orderDetail.routes.js';
import reservationsRoutes from '../src/reservations/reservation.routes.js';
import restaurantsRoutes from '../src/restaurants/restaurant.routes.js';
import reviewRoutes from '../src/reviews/review.routes.js';
import tablesRoutes from '../src/tables/table.routes.js';
import reportRoutes from '../src/reports/report.routes.js';
import invoiceRoutes from '../src/invoices/invoice.routes.js'

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

    app.use(`${BASE_PATH}/reviews`, reviewRoutes);
    app.use(`${BASE_PATH}/events`, eventsRoutes);
    app.use(`${BASE_PATH}/menuItems`, menuItemRoutes);
    app.use(`${BASE_PATH}/orders`, orderRoutes);
    app.use(`${BASE_PATH}/orderDetails`, orderDetailsRoutes);
    app.use(`${BASE_PATH}/reservations`, reservationsRoutes);
    app.use(`${BASE_PATH}/restaurants`, restaurantsRoutes);
    app.use(`${BASE_PATH}/tables`, tablesRoutes);
    app.use(`${BASE_PATH}/reports`, reportRoutes);
    app.use(`${BASE_PATH}/invoices`, invoiceRoutes)

    app.get(`${BASE_PATH}/Health`, (request, response) => {
        response.status(200).json({
            status: 'Healthy',
            timestamp: new Date().toISOString(),
            service: 'Restaurant Admin Server'
        })
    })

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
    app.set('trus proxy', 1);

    try {
        await dbConnection();
        middlewares(app);
        routes(app);

        app.use(errorHandler);

        app.listen(PORT, () => {
            console.log(`KinalSports Admin server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/health`);
        })
    } catch (error) {
        console.error(`Error starting Admin Server: ${error.message}`);
        process.exit(1);
    }
}