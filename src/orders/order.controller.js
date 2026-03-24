'use strict'

import Order from './order.model.js'
import OrderDetail from '../orderDetails/orderDetail.model.js'
import Restaurant from '../restaurants/restaurant.model.js'
import MenuItem from '../menuItems/menuItem.model.js'
// Nuevos imports para la lógica de inventario profesional
import MenuItemIngredient from '../menuItems/menuItemIngredient.model.js'
import Ingredient from '../menuItems/ingredient.model.js';

export const createOrder = async (req, res) => {
    try {
        const { restaurant, total, status } = req.body

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            })
        }

        const restaurantExists = await Restaurant.findById(restaurant)
        if (!restaurantExists) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            })
        }

        const order = new Order({
            restaurant,
            userId: req.user.id,
            total,
            status
        })

        await order.save()

        return res.status(201).json({
            success: true,
            message: 'Orden creada',
            order
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al crear orden',
            error: error.message
        })
    }
}

export const getOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive = true } = req.query;
        const filter = { isActive };

        const orders = await Order.find(filter)
            .populate('restaurant')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Order.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener órdenes',
            error: error.message
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id).populate('restaurant');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }

        const details = await OrderDetail.find({
            order: id,
            isActive: true
        }).populate('menuItem');

        res.status(200).json({
            success: true,
            data: { order, details }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener orden',
            error: error.message
        });
    }
};

// --- LÓGICA DE ACTUALIZACIÓN CON DESCUENTO DE INVENTARIO (SR-199 / SR-200) ---
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const currentOrder = await Order.findById(id);
        if (!currentOrder) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }

        let lowStockAlerts = [];

        // Si el nuevo estado es ENTREGADO y antes no lo era, procesamos inventario
        if (status === 'ENTREGADO' && currentOrder.status !== 'ENTREGADO') {
            const orderDetails = await OrderDetail.find({ order: id, isActive: true }).populate('menuItem');

            // 1. Recopilar todos los ingredientes necesarios (mapeo de recetas)
            let neededIngredientsMap = [];

            for (const detail of orderDetails) {
                const recipe = await MenuItemIngredient.find({ menuItem: detail.menuItem._id }).populate('ingredient');
                
                for (const item of recipe) {
                    neededIngredientsMap.push({
                        ingredientId: item.ingredient._id,
                        name: item.ingredient.name,
                        amountToSubtract: item.quantity * detail.quantity,
                        currentStock: item.ingredient.stock
                    });
                }
            }

            // 2. Validación de Pre-vuelo: ¿Tenemos suficiente de TODO? (SR-201 - Test de negativos)
            for (const item of neededIngredientsMap) {
                if (item.currentStock < item.amountToSubtract) {
                    return res.status(400).json({
                        success: false,
                        message: `Stock insuficiente de insumos: ${item.name}. Disponible: ${item.currentStock}, Necesario: ${item.amountToSubtract}`
                    });
                }
            }

            // 3. Ejecutar descuentos en la base de datos
            for (const item of neededIngredientsMap) {
                const updatedIng = await Ingredient.findByIdAndUpdate(
                    item.ingredientId,
                    { $inc: { stock: -item.amountToSubtract } },
                    { new: true, runValidators: true }
                );

                // SR-200: Alerta si stock resultante < mínimo
                if (updatedIng.stock < updatedIng.minStock) {
                    lowStockAlerts.push({
                        ingredient: updatedIng.name,
                        current: updatedIng.stock,
                        min: updatedIng.minStock
                    });
                }
            }
        }

        // Actualizar el estado final de la orden
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: lowStockAlerts.length > 0 ? 'Orden entregada con alertas de stock bajo' : 'Estado de orden actualizado',
            data: {
                order: updatedOrder,
                alerts: lowStockAlerts.length > 0 ? lowStockAlerts : null
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar estado',
            error: error.message
        });
    }
};

export const changeOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activada' : 'desactivada';

        const order = await Order.findByIdAndUpdate(id, { isActive }, { new: true });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: `Orden ${action} exitosamente`,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar estado',
            error: error.message
        });
    }
};