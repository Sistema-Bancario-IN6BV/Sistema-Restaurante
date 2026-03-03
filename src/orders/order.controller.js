'use strict'

import Order from './order.model.js'
import OrderDetail from '../orderDetails/orderDetail.model.js'
import Restaurant from '../restaurants/restaurant.model.js' // ✅ IMPORT NECESARIO
import MenuItem from '../menuItems/menuItem.model.js';

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

// Obtener órdenes
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


// Obtener orden por ID con detalles
export const getOrderById = async (req, res) => {
    try {

        const { id } = req.params;

        const order = await Order.findById(id)
            .populate('restaurant');

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
            data: {
                order,
                details
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener orden',
            error: error.message
        });
    }
};


// Cambiar estado de orden
export const updateOrderStatus = async (req, res) => {
    try {

        const { id } = req.params;
        const { status } = req.body;

        // Obtener la orden actual
        const currentOrder = await Order.findById(id);
        
        if (!currentOrder) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }

        // Si el nuevo estado es ENTREGADO y antes no lo era
        if (status === 'ENTREGADO' && currentOrder.status !== 'ENTREGADO') {
            // Obtener detalles del pedido
            const orderDetails = await OrderDetail.find({
                order: id,
                isActive: true
            }).populate('menuItem');

            // Verificar stock disponible
            for (const detail of orderDetails) {
                if (detail.menuItem.stock < detail.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Stock insuficiente para ${detail.menuItem.name}. Disponible: ${detail.menuItem.stock}, Requerido: ${detail.quantity}`
                    });
                }
            }

            // Si hay stock suficiente, restar
            for (const detail of orderDetails) {
                await MenuItem.findByIdAndUpdate(
                    detail.menuItem._id,
                    { $inc: { stock: -detail.quantity } },
                    { new: true, runValidators: true }
                );
            }
        }

        // Actualizar el estado de la orden
        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: status === 'ENTREGADO' ? 'Estado actualizado y stock ajustado' : 'Estado actualizado',
            data: order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar estado',
            error: error.message
        });
    }
};


// Activar / Desactivar orden
export const changeOrderStatus = async (req, res) => {
    try {

        const { id } = req.params;

        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activada' : 'desactivada';

        const order = await Order.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

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

