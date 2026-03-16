'use strict';

import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

export const setupSwagger = (app, basePath) => {
    const swaggerDefinition = {
        openapi: '3.0.3',
        info: {
            title: 'Sistema Restaurante API',
            version: '1.0.0',
            description: 'Documentación de endpoints para la API de Sistema Restaurante'
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}${basePath}`,
                description: 'Servidor local'
            }
        ],
        tags: [
            { name: 'Health' },
            { name: 'Events' },
            { name: 'Menu Items' },
            { name: 'Orders' },
            { name: 'Order Details' },
            { name: 'Reservations' },
            { name: 'Restaurants' },
            { name: 'Reviews' },
            { name: 'Tables' },
            { name: 'Reports' }
        ],
        components: {
            schemas: {
                Event: {
                    type: 'object',
                    required: ['restaurant', 'title', 'eventDate'],
                    properties: {
                        _id: { type: 'string', example: '65a1b2c3d4e5f6g7h8i9j0k1' },
                        restaurant: { type: 'string', example: '65a1b2c3d4e5f6g7h8i9j0k1' },
                        title: { type: 'string', example: 'Noche de Pizza' },
                        description: { type: 'string', example: 'Evento especial con descuentos' },
                        eventDate: { type: 'string', format: 'date-time' },
                        photo: { type: 'string', nullable: true },
                        isActive: { type: 'boolean', default: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                MenuItem: {
                    type: 'object',
                    required: ['restaurant', 'name', 'price', 'type'],
                    properties: {
                        _id: { type: 'string' },
                        restaurant: { type: 'string' },
                        name: { type: 'string', maxLength: 150 },
                        description: { type: 'string', maxLength: 500 },
                        price: { type: 'number', minimum: 0 },
                        type: { type: 'string', enum: ['ENTRADA', 'PLATO_FUERTE', 'POSTRE', 'BEBIDA'] },
                        photo: { type: 'string', nullable: true },
                        isActive: { type: 'boolean', default: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Order: {
                    type: 'object',
                    required: ['userId', 'restaurant'],
                    properties: {
                        _id: { type: 'string' },
                        userId: { type: 'string' },
                        restaurant: { type: 'string' },
                        total: { type: 'number', minimum: 0 },
                        status: { type: 'string', enum: ['EN_PREPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO'] },
                        isActive: { type: 'boolean', default: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Reservation: {
                    type: 'object',
                    required: ['userId', 'restaurant', 'table', 'reservationDate', 'startTime', 'endTime'],
                    properties: {
                        _id: { type: 'string' },
                        userId: { type: 'string' },
                        restaurant: { type: 'string' },
                        table: { type: 'string' },
                        reservationDate: { type: 'string', format: 'date-time' },
                        status: { type: 'string', enum: ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'FINALIZADA'] },
                        startTime: { type: 'string', format: 'date-time' },
                        endTime: { type: 'string', format: 'date-time' },
                        isActive: { type: 'boolean', default: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Table: {
                    type: 'object',
                    required: ['restaurant', 'tableNumber', 'capacity'],
                    properties: {
                        _id: { type: 'string' },
                        restaurant: { type: 'string' },
                        tableNumber: { type: 'number' },
                        capacity: { type: 'number' },
                        isActive: { type: 'boolean', default: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Review: {
                    type: 'object',
                    required: ['userId', 'restaurant', 'rating', 'comment'],
                    properties: {
                        _id: { type: 'string' },
                        userId: { type: 'string' },
                        restaurant: { type: 'string' },
                        rating: { type: 'number', minimum: 1, maximum: 5 },
                        comment: { type: 'string' },
                        isActive: { type: 'boolean', default: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Restaurant: {
                    type: 'object',
                    required: ['name', 'location', 'phone'],
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        location: { type: 'string' },
                        phone: { type: 'string' },
                        logo: { type: 'string', nullable: true },
                        isActive: { type: 'boolean', default: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                OrderDetail: {
                    type: 'object',
                    required: ['order', 'menuItem', 'quantity', 'price'],
                    properties: {
                        _id: { type: 'string' },
                        order: { type: 'string' },
                        menuItem: { type: 'string' },
                        quantity: { type: 'number', minimum: 1 },
                        price: { type: 'number', minimum: 0 },
                        isActive: { type: 'boolean', default: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Operación completada correctamente' },
                        data: { type: 'object', additionalProperties: true }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Error de validación' },
                        errors: {
                            type: 'array',
                            items: { type: 'object', additionalProperties: true }
                        }
                    }
                }
            }
        }
    };

    const swaggerSpec = swaggerJSDoc({
        definition: swaggerDefinition,
        apis: ['./src/**/*.routes.js', './configs/app.js']
    });

    app.use(`${basePath}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customSiteTitle: 'Sistema Restaurante API Docs'
    }));

    app.get(`${basePath}/docs.json`, (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
};
