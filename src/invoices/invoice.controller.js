'use strict';

import Invoice from './invoice.model.js';
import Order from '../orders/order.model.js';
import mongoose from 'mongoose';

// POST /invoices (Crear factura desde una orden)
export const createInvoice = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    // Validar que la orden existe
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });

    // Validar que el usuario es dueño de la orden o es admin
    if (order.userId !== req.user.id && req.user.role !== 'PLATFORM_ADMIN' && req.user.role !== 'RESTAURANT_ADMIN') {
      return res.status(403).json({ success: false, message: 'No tienes permisos para crear facturas de esta orden' });
    }

    // Validar que no existe una factura para esta orden
    const existingInvoice = await Invoice.findOne({ orderId });
    if (existingInvoice) {
      return res.status(409).json({ success: false, message: 'Ya existe una factura para esta orden' });
    }

    // Crear factura desde la orden
    const invoiceNumber = `INV-${Date.now()}-${orderId.substring(0, 6).toUpperCase()}`;
    const taxRate = 0.12; // 12% tax
    const subtotal = order.total;
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const total = subtotal + taxAmount;

    const invoice = await Invoice.create({
      invoiceNumber,
      orderId,
      userId: order.userId,
      restaurantId: order.restaurantId,
      items: order.items,
      subtotal,
      taxRate,
      taxAmount,
      total,
      status: 'PENDING',
    });

    await invoice.populate([
      { path: 'restaurantId', select: 'name' },
      { path: 'orderId', select: 'type status' }
    ]);

    res.status(201).json({ success: true, message: 'Factura creada', data: invoice });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Ya existe una factura para esta orden' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /invoices/my
export const getMyInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = { userId: req.user.id };

    const [invoices, total] = await Promise.all([
      Invoice.find(filter).populate('restaurantId', 'name').populate('orderId', 'type status')
        .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Invoice.countDocuments(filter),
    ]);

    res.json({ success: true, data: invoices, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /invoices/order/:orderId
export const getInvoiceByOrder = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ orderId: req.params.orderId })
      .populate('restaurantId', 'name').populate('orderId', 'type status items');
    if (!invoice) return res.status(404).json({ success: false, message: 'Factura no encontrada' });
    res.json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /invoices/restaurant/:id
export const getInvoicesByRestaurant = async (req, res) => {
  try {
    // Solo RESTAURANT_ADMIN y PLATFORM_ADMIN pueden ver facturas de restaurante
    if (req.user.role !== 'RESTAURANT_ADMIN' && req.user.role !== 'PLATFORM_ADMIN') {
      return res.status(403).json({ success: false, message: 'No tienes permisos para ver facturas de restaurante' });
    }

    const { from, to, page = 1, limit = 10 } = req.query;
    const filter = { restaurantId: req.params.id };

    if (from || to) {
      filter.issuedAt = {};
      if (from) filter.issuedAt.$gte = new Date(from);
      if (to) filter.issuedAt.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [invoices, total, revenueAgg] = await Promise.all([
      Invoice.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Invoice.countDocuments(filter),
      Invoice.aggregate([
        { $match: { ...filter, restaurantId: new mongoose.Types.ObjectId(req.params.id) } },
        { $group: { _id: '$status', total: { $sum: '$total' } } },
      ]),
    ]);

    const revenueByStatus = revenueAgg.reduce((acc, g) => { acc[g._id] = g.total; return acc; }, {});

    res.json({
      success: true,
      data: invoices,
      totalRevenue: revenueByStatus['PAID'] || 0,
      totalPending: revenueByStatus['PENDING'] || 0,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /invoices/:id/pay
export const payInvoice = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Factura no encontrada' });
    
    // Solo el dueño, restaurante admin, o platform admin pueden pagar
    if (invoice.userId !== req.user.id && req.user.role !== 'RESTAURANT_ADMIN' && req.user.role !== 'PLATFORM_ADMIN') {
      return res.status(403).json({ success: false, message: 'No tienes permisos para pagar esta factura' });
    }
    
    if (invoice.status === 'PAID') {
      return res.status(400).json({ success: false, message: 'La factura ya está pagada' });
    }

    invoice.status = 'PAID';
    invoice.paymentMethod = paymentMethod;
    invoice.paidAt = new Date();
    await invoice.save();

    res.json({ success: true, message: 'Factura pagada', data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /invoices/:id (soft delete via CANCELLED status)
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Factura no encontrada' });

    // Ownership validation: only customer or admin can delete
    if (invoice.userId !== req.user.id && req.user.role !== 'PLATFORM_ADMIN') {
      return res.status(403).json({ success: false, message: 'No tienes permisos para eliminar esta factura' });
    }

    // Cannot delete paid invoices
    if (invoice.status === 'PAID') {
      return res.status(400).json({ success: false, message: 'No se pueden eliminar facturas pagadas' });
    }

    // Soft delete: mark as CANCELLED
    invoice.status = 'CANCELLED';
    await invoice.save();

    res.json({ success: true, message: 'Factura eliminada', data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
