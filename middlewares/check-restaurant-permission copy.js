'use strict';
import Restaurant from '../src/restaurants/restaurant.model.js';

export const checkEntityRestaurantPermission = (ModelOrName, restaurantIdField = 'restaurantId', idParamName = 'id') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Se requiere autenticación'
                });
            }

            // PLATFORM_ADMIN tiene acceso a todo
            if (req.user.role === 'PLATFORM_ADMIN') {
                return next();
            }

            let Model = ModelOrName;
            if (typeof ModelOrName === 'string') {
                const { default: mongoose } = await import('mongoose');
                Model = mongoose.model(ModelOrName);
            }

            // Obtener el ID de la entidad
            const entityId = req.params[idParamName] || req.body[idParamName];

            if (!entityId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de la entidad es requerido'
                });
            }

            // Buscar la entidad
            const entity = await Model.findById(entityId);

            if (!entity) {
                return res.status(404).json({
                    success: false,
                    message: 'Entidad no encontrada'
                });
            }

            // Obtener el restaurantId
            const restaurantId = entity[restaurantIdField];

            if (!restaurantId) {
                return res.status(400).json({
                    success: false,
                    message: 'El restaurante no está asociado a esta entidad'
                });
            }

            // Buscar el restaurante
            const restaurant = await Restaurant.findById(restaurantId);

            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurante asociado no encontrado'
                });
            }

            // RESTAURANT_ADMIN solo puede modificar su propio restaurante
            if (req.user.role === 'RESTAURANT_ADMIN') {
                // Compatibilidad: O está en adminIds O era el adminId original
                const hasPermission = (restaurant.adminIds && restaurant.adminIds.includes(req.user.id)) || restaurant.adminId === req.user.id;
                
                if (!hasPermission) {
                    return res.status(403).json({
                        success: false,
                        message: 'No tiene permisos para modificar este recurso. Solo puede modificar recursos de su propio restaurante.'
                    });
                }
                return next();
            }

            // Otros roles no tienen permisos
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

            // PLATFORM_ADMIN tiene acceso a todo
            if (req.user.role === 'PLATFORM_ADMIN') {
                return next();
            }

            // Obtener el ID del restaurante
            const restaurantId = req.params[idParamName] || req.body[idParamName];

            if (!restaurantId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID del restaurante es requerido'
                });
            }

            // Buscar el restaurante
            const restaurant = await Restaurant.findById(restaurantId);

            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurante no encontrado'
                });
            }

            // RESTAURANT_ADMIN solo puede modificar su propio restaurante
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

            // Otros roles no tienen permisos
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


export const checkCreateRestaurantPermission = (restaurantIdFieldInBody = 'restaurantId') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Se requiere autenticación'
                });
            }

            // PLATFORM_ADMIN puede crear en cualquier restaurante
            if (req.user.role === 'PLATFORM_ADMIN') {
                return next();
            }

            // Obtener el restaurantId del body
            const restaurantId = req.body[restaurantIdFieldInBody];

            if (!restaurantId) {
                return res.status(400).json({
                    success: false,
                    message: `El campo ${restaurantIdFieldInBody} es requerido`
                });
            }

            // Buscar el restaurante
            const restaurant = await Restaurant.findById(restaurantId);

            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurante no encontrado'
                });
            }

            // RESTAURANT_ADMIN solo puede crear en su propio restaurante
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

            // Otros roles no tienen permisos
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
