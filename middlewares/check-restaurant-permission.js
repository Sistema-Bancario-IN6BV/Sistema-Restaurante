'use strict';
import Restaurant from '../src/restaurants/restaurant.model.js';

/**
 * Middleware genérico para validar permisos de restaurante
 * - PLATFORM_ADMIN: acceso total
 * - RESTAURANT_ADMIN: solo su propio restaurante
 * 
 * Uso: checkEntityRestaurantPermission(Model, 'restaurantIdField', 'idParamName')
 * 
 * @param {Model|string} ModelOrName - El modelo mongoose o nombre del modelo 
 * @param {string} restaurantIdField - Campo en el documento que contiene el restaurantId (defecto: 'restaurantId')
 * @param {string} idParamName - Nombre del parámetro en la ruta (defecto: 'id')
 */
export const checkEntityRestaurantPermission = (ModelOrName, restaurantIdField = 'restaurantId', idParamName = 'id') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Se requiere autenticación'
                });
            }

            if (req.user.role === 'PLATFORM_ADMIN') {
                return next();
            }

            let Model = ModelOrName;
            if (typeof ModelOrName === 'string') {
                const { default: mongoose } = await import('mongoose');
                Model = mongoose.model(ModelOrName);
            }

            const entityId = req.params[idParamName] || req.body[idParamName];

            if (!entityId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de la entidad es requerido'
                });
            }

            const entity = await Model.findById(entityId);

            if (!entity) {
                return res.status(404).json({
                    success: false,
                    message: 'Entidad no encontrada'
                });
            }

            const restaurantId = entity[restaurantIdField];

            if (!restaurantId) {
                return res.status(400).json({
                    success: false,
                    message: 'El restaurante no está asociado a esta entidad'
                });
            }

            const restaurant = await Restaurant.findById(restaurantId);

            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurante asociado no encontrado'
                });
            }

            if (req.user.role === 'RESTAURANT_ADMIN') {
                const hasPermission = (restaurant.adminIds && restaurant.adminIds.includes(req.user.id)) || restaurant.adminId === req.user.id;
                
                if (!hasPermission) {
                    return res.status(403).json({
                        success: false,
                        message: 'No tiene permisos para modificar este recurso. Solo puede modificar recursos de su propio restaurante.'
                    });
                }
                return next();
            }

            res.status(403).json({
                success: false,
                message: 'Rol no autorizado para modificar este recurso'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al validar permisos',
                error: error.message
            });
        }
    };
};

export const checkRestaurantPermission = (idParamName = 'id') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Se requiere autenticación'
                });
            }

            if (req.user.role === 'PLATFORM_ADMIN') {
                return next();
            }
            const restaurantId = req.params[idParamName] || req.body[idParamName];

            if (!restaurantId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID del restaurante es requerido'
                });
            }

            const restaurant = await Restaurant.findById(restaurantId);

            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurante no encontrado'
                });
            }

            if (req.user.role === 'RESTAURANT_ADMIN') {
                const hasPermission = (restaurant.adminIds && restaurant.adminIds.includes(req.user.id)) || restaurant.adminId === req.user.id;

                if (!hasPermission) {
                    return res.status(403).json({
                        success: false,
                        message: 'No tiene permisos para modificar este restaurante. Solo puede modificar su propio restaurante.'
                    });
                }
                return next();
            }

            res.status(403).json({
                success: false,
                message: 'Rol no autorizado para modificar restaurantes'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al validar permisos',
                error: error.message
            });
        }
    };
};

/**
 * Middleware para validar permisos al crear entidades
 * - PLATFORM_ADMIN: puede crear en cualquier restaurante
 * - RESTAURANT_ADMIN: solo puede crear en su propio restaurante
 * 
 * Valida el restaurantId proporcionado en el body
 * 
 * @param {string} restaurantIdFieldInBody - Nombre del campo en body que contiene restaurantId
 */
export const checkCreateRestaurantPermission = (restaurantIdFieldInBody = 'restaurantId') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Se requiere autenticación'
                });
            }

            if (req.user.role === 'PLATFORM_ADMIN') {
                return next();
            }

            const restaurantId = req.body[restaurantIdFieldInBody];

            if (!restaurantId) {
                return res.status(400).json({
                    success: false,
                    message: `El campo ${restaurantIdFieldInBody} es requerido`
                });
            }

            const restaurant = await Restaurant.findById(restaurantId);

            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurante no encontrado'
                });
            }

            if (req.user.role === 'RESTAURANT_ADMIN') {
                const hasPermission = (restaurant.adminIds && restaurant.adminIds.includes(req.user.id)) || restaurant.adminId === req.user.id;

                if (!hasPermission) {
                    return res.status(403).json({
                        success: false,
                        message: 'Solo puede crear recursos en su propio restaurante. No tiene permiso para crear en este restaurante.'
                    });
                }
                return next();
            }

            res.status(403).json({
                success: false,
                message: 'Rol no autorizado para crear recursos'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al validar permisos',
                error: error.message
            });
        }
    };
};

export default checkEntityRestaurantPermission;
