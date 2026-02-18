import OrderDetail from './orderDetail.model.js';
import Order from '../orders/order.model.js';
import MenuItem from '../menuItems/menuItem.model.js';

// Agregar detalle a una orden
export const createOrderDetail = async (req, res) => {
    try {

        const { order, menuItem, quantity } = req.body;

        const item = await MenuItem.findById(menuItem);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Platillo no encontrado'
            });
        }

        const subtotal = item.price * quantity;

        const orderDetail = new OrderDetail({
            order,
            menuItem,
            quantity,
            price: item.price,
            subtotal
        });

        await orderDetail.save();

        const orderData = await Order.findById(order);
        orderData.total += subtotal;
        await orderData.save();

        res.status(201).json({
            success: true,
            message: 'Detalle agregado exitosamente',
            data: orderDetail
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al agregar detalle',
            error: error.message
        });
    }
};


// Obtener detalles de una orden
export const getOrderDetails = async (req, res) => {
    try {

        const { orderId } = req.params;

        const details = await OrderDetail.find({
            order: orderId,
            isActive: true
        }).populate('menuItem');

        res.status(200).json({
            success: true,
            data: details
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener detalles',
            error: error.message
        });
    }
};


// Desactivar detalle (soft delete)
export const deactivateOrderDetail = async (req, res) => {
    try {

        const { id } = req.params;

        const detail = await OrderDetail.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!detail) {
            return res.status(404).json({
                success: false,
                message: 'Detalle no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Detalle desactivado',
            data: detail
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al desactivar detalle',
            error: error.message
        });
    }
};
