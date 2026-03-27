'use strict';

import Order from './order.model.js';
import MenuItem from '../menuItems/menuItem.model.js';
import Ingredient from '../ingredients/ingredient.model.js';
import Table from '../tables/table.model.js';
import Invoice from '../invoices/invoice.model.js';

// POST /orders
export const createOrder = async (req, res) => {
  try {
    // Aceptar flexibilidad en los nombres de los campos
    const restaurantId =  req.body.restaurant|| req.body.restaurantId;
    const items = req.body.items || [];
    const type = req.body.type || 'DELIVERY';
    const tableId = req.body.tableId || req.body.table;
    const deliveryAddress = req.body.deliveryAddress;

    if (type === 'DINE_IN' && !tableId) {
      return res.status(400).json({ success: false, message: 'El pedido DINE_IN requiere especificar la mesa (tableId)' });
    }
    if (type === 'DELIVERY' && (!deliveryAddress || !deliveryAddress.street)) {
      return res.status(400).json({ success: false, message: 'El pedido DELIVERY requiere especificar la dirección con calle (deliveryAddress.street)' });
    }

    const populatedItems = [];
    let totalAmount = 0;

    // 1. Obtener precios y VALIDAR STOCK
    for (const item of items) {
      const menuItemId = item.menuItem || item.menuItemId;
      const menuItem = await MenuItem.findOne({ _id: menuItemId, restaurantId, active: true, available: true });
      
      if (!menuItem) {
        return res.status(404).json({ 
          success: false, 
          message: `Plato ${menuItemId} no encontrado, no disponible o no pertenece a este restaurante` 
        });
      }

      // Validar stock si tiene ingredientes vinculados
      if (menuItem.inventoryIngredients && menuItem.inventoryIngredients.length > 0) {
        for (const inv of menuItem.inventoryIngredients) {
          const quantity = item.quantity || 1;
          const totalNeeded = inv.quantity * quantity;
          const ingredient = await Ingredient.findById(inv.ingredientId);
          
          if (!ingredient) continue;

          if (ingredient.currentStock < totalNeeded) {
            return res.status(400).json({
              success: false,
              message: `Stock insuficiente para preparar ${menuItem.name}. El ingrediente ${ingredient.name} tiene solo ${ingredient.currentStock} ${ingredient.unit} y se necesitan ${totalNeeded}.`
            });
          }
        }
      }

      const unitPrice = menuItem.price;
      const quantity = item.quantity || 1;
      const subtotal = unitPrice * quantity;

      populatedItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        quantity: quantity,
        unitPrice: unitPrice,
        subtotal: subtotal,
        notes: item.notes,
      });

      totalAmount += subtotal;
    }

    const order = await Order.create({
      userId: req.user.id,
      restaurantId,
      type,
      tableId,
      deliveryAddress,
      items: populatedItems,
      status: req.body.status || 'PENDING',
      statusHistory: [{ status: req.body.status || 'PENDING', changedBy: req.user.id }],
    });

    // Descontar inventario 
    let warnings = [];
    try {
      warnings = await discountInventory(order.restaurantId, populatedItems);
    } catch (inventoryError) {
      console.warn('Inventory discount failed:', inventoryError.message);
    }

    res.status(201).json({ success: true, data: order, warnings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /orders/my
export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const filter = { userId: req.user.id, active: true };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('restaurantId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /orders/restaurant/:id
export const getOrdersByRestaurant = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { restaurantId: req.params.id, active: true };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurantId', 'name')
      .populate('tableId', 'number capacity');
    if (!order) return res.status(404).json({ success: false, message: 'Pedido no encontrado' });

    if (req.user.role !== 'PLATFORM_ADMIN' && req.user.role !== 'RESTAURANT_ADMIN' && order.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'No tienes permisos' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Pedido no encontrado' });

    // Only RESTAURANT_ADMIN or PLATFORM_ADMIN can update order status
    if (req.user.role !== 'RESTAURANT_ADMIN' && req.user.role !== 'PLATFORM_ADMIN') {
      return res.status(403).json({ success: false, message: 'No tienes permisos para actualizar estados de pedidos' });
    }

    // Máquina de estados estricta (US-12 Paso 2)
    const validTransitions = {
      'PENDING': ['PREPARING', 'CANCELLED'],
      'PREPARING': ['READY'],
      'READY': ['DELIVERED'],
      'DELIVERED': [],
      'CANCELLED': []
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Transición no válida: No se puede cambiar de ${order.status} a ${status}` 
      });
    }

    order.status = status;
    order.statusHistory.push({ status, changedBy: req.user.id });
    await order.save();

    // Acciones adicionales si se completó el pedido
    if (status === 'DELIVERED') {
      // Liberar mesa si es DINE_IN (US-12 Paso 3)
      if (order.tableId) {
        await Table.findByIdAndUpdate(order.tableId, { status: 'AVAILABLE' }).catch(() => {});
      }

      // Generación automática de factura (US-12 Paso 4 y US-13 Paso 3)
      try {
        const invoiceNumber = `FAC-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
        await Invoice.create({
          invoiceNumber,
          orderId: order._id,
          userId: order.userId,
          restaurantId: order.restaurantId,
          items: order.items,
          subtotal: order.subtotal,
          taxRate: order.taxRate,
          taxAmount: order.taxAmount,
          total: order.total,
          status: 'PENDING'
        });
      } catch (err) {
        console.error('Error al generar la factura automáticamente:', err.message);
      }
    }

    res.json({ success: true, message: 'Estado actualizado', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /orders/:id/cancel
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Pedido no encontrado' });

    if (order.userId !== req.user.id && req.user.role !== 'PLATFORM_ADMIN') {
      return res.status(403).json({ success: false, message: 'No tienes permisos' });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Solo se pueden cancelar pedidos pendientes' });
    }

    order.status = 'CANCELLED';
    order.statusHistory.push({ status: 'CANCELLED', changedBy: req.user.id });
    await order.save();

    res.json({ success: true, message: 'Pedido cancelado', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /orders/:id (soft delete)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Pedido no encontrado' });

    // Ownership validation: only customer or admin can delete
    if (order.userId !== req.user.id && req.user.role !== 'PLATFORM_ADMIN') {
      return res.status(403).json({ success: false, message: 'No tienes permisos para eliminar este pedido' });
    }

    // Soft delete: mark as inactive
    order.active = false;
    await order.save();

    res.json({ success: true, message: 'Pedido eliminado', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Descuenta el inventario de ingredientes basado en los items del pedido.
 * Retorna un arreglo de advertencias si algún ingrediente quedó en stock bajo.
 */
const discountInventory = async (restaurantId, items) => {
  const warnings = [];
  console.log(`--- Iniciando descuento de inventario para restaurante ${restaurantId} ---`);
  for (const item of items) {
    const menuItem = await MenuItem.findById(item.menuItemId).lean();
    
    if (!menuItem || !menuItem.inventoryIngredients || menuItem.inventoryIngredients.length === 0) continue;

    for (const inv of menuItem.inventoryIngredients) {
      const totalNeeded = inv.quantity * item.quantity;
      const ingredient = await Ingredient.findById(inv.ingredientId);
      
      if (!ingredient) continue;

      console.log(`Descontando ${totalNeeded} de ${ingredient.name} (Stock actual: ${ingredient.currentStock})`);
      
      ingredient.currentStock = Math.max(0, ingredient.currentStock - totalNeeded);
      ingredient.lowStockAlert = ingredient.currentStock < ingredient.minStock;
      
      if (ingredient.lowStockAlert) {
        warnings.push(`Stock bajo para ${ingredient.name}: quedando solo ${ingredient.currentStock} ${ingredient.unit}`);
      }
      
      await ingredient.save();
      console.log(`Nuevo stock de ${ingredient.name}: ${ingredient.currentStock}`);
    }
  }
  console.log('--- Descuento de inventario finalizado ---');
  return warnings;
};
