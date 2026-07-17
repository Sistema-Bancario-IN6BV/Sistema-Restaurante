'use strict';

import Invoice from './invoice.model.js';
import Order from '../orders/order.model.js';
import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';

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

    // Usar el subtotal real de la orden (order.subtotal) y la tasa de impuestos de la orden
    const taxRate = order.taxRate ?? 0.12;
    const subtotal = Number(order.subtotal ?? 0);
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + taxAmount) * 100) / 100;

    // Mapear items para la factura (asegurar campos unitPrice y subtotal)
    const invoiceItems = (order.items || []).map((it) => ({
      name: it.name,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      subtotal: (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0)
    }));

    const invoice = await Invoice.create({
      invoiceNumber,
      orderId,
      userId: order.userId,
      restaurantId: order.restaurantId,
      items: invoiceItems,
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
    // Excluir facturas canceladas por defecto
    const filter = { userId: req.user.id, status: { $ne: 'CANCELLED' } };

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

// GET /invoices/order/:orderId/pdf
export const getInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ orderId: req.params.orderId })
      .populate('restaurantId', 'name')
      .populate('orderId', 'type status');
    if (!invoice) return res.status(404).json({ success: false, message: 'Factura no encontrada' });

    if (
      invoice.userId !== req.user.id &&
      req.user.role !== 'RESTAURANT_ADMIN' &&
      req.user.role !== 'PLATFORM_ADMIN'
    ) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para ver esta factura' });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.header('Content-Type', 'application/pdf');
    res.header('Content-Disposition', `attachment; filename="factura-${invoice.invoiceNumber}.pdf"`);
    doc.pipe(res);

    // Encabezado
    doc.rect(0, 0, doc.page.width, 100).fill('#2c3e50');
    doc.fillColor('white').fontSize(22).text('Factura', 50, 30);
    doc.fontSize(12).text(invoice.restaurantId?.name || 'Restaurante', 50, 60);
    doc.fontSize(10).text(`No. ${invoice.invoiceNumber}`, doc.page.width - 200, 55, { align: 'right' });
    doc.text(`Emitida: ${new Date(invoice.issuedAt).toLocaleDateString()}`, doc.page.width - 200, 70, { align: 'right' });

    doc.fillColor('black');
    let yPos = 130;

    // Tabla de items
    doc.fontSize(14).text('Detalle', 50, yPos);
    yPos += 25;
    doc.fontSize(10).fillColor('#7f8c8d');
    doc.text('Artículo', 50, yPos);
    doc.text('Cant.', 300, yPos, { width: 60, align: 'right' });
    doc.text('Precio unit.', 370, yPos, { width: 80, align: 'right' });
    doc.text('Subtotal', 460, yPos, { width: 90, align: 'right' });
    yPos += 15;
    doc.moveTo(50, yPos).lineTo(550, yPos).strokeColor('#bdc3c7').stroke();
    yPos += 10;

    doc.fillColor('black').fontSize(10);
    for (const item of invoice.items) {
      doc.text(item.name, 50, yPos, { width: 240 });
      doc.text(String(item.quantity), 300, yPos, { width: 60, align: 'right' });
      doc.text(`Q${item.unitPrice.toFixed(2)}`, 370, yPos, { width: 80, align: 'right' });
      doc.text(`Q${item.subtotal.toFixed(2)}`, 460, yPos, { width: 90, align: 'right' });
      yPos += 20;
    }

    yPos += 10;
    doc.moveTo(50, yPos).lineTo(550, yPos).strokeColor('#bdc3c7').stroke();
    yPos += 20;

    // Totales
    doc.fontSize(11);
    doc.text('Subtotal:', 370, yPos, { width: 90, align: 'right' });
    doc.text(`Q${invoice.subtotal.toFixed(2)}`, 460, yPos, { width: 90, align: 'right' });
    yPos += 20;
    doc.text(`Impuesto (${(invoice.taxRate * 100).toFixed(0)}%):`, 370, yPos, { width: 90, align: 'right' });
    doc.text(`Q${invoice.taxAmount.toFixed(2)}`, 460, yPos, { width: 90, align: 'right' });
    yPos += 25;
    doc.fontSize(13).fillColor('#2c3e50');
    doc.text('Total:', 370, yPos, { width: 90, align: 'right' });
    doc.text(`Q${invoice.total.toFixed(2)}`, 460, yPos, { width: 90, align: 'right' });

    yPos += 40;
    doc.fontSize(10).fillColor('#7f8c8d');
    doc.text(`Estado: ${invoice.status}`, 50, yPos);

    doc.end();
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

    // Temporary debug logs: mostrar ids para depuración de permisos
    try {
      console.log('[DEBUG deleteInvoice] invoiceId:', invoice._id?.toString());
      console.log('[DEBUG deleteInvoice] invoice.userId:', invoice.userId, 'type:', typeof invoice.userId);
      console.log('[DEBUG deleteInvoice] requester:', { id: req.user?.id, role: req.user?.role });
    } catch (logErr) {
      console.warn('[DEBUG deleteInvoice] Error al imprimir debug:', logErr.message);
    }
    
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

    // Ownership validation: allow if invoice.userId matches token OR the related order belongs to the user
    let ownerMatch = String(invoice.userId) === String(req.user.id);
    if (!ownerMatch && invoice.orderId) {
      try {
        const relatedOrder = await Order.findById(invoice.orderId).select('userId');
        if (relatedOrder) {
          console.log('[DEBUG deleteInvoice] relatedOrder.userId:', relatedOrder.userId);
          if (String(relatedOrder.userId) === String(req.user.id)) {
            ownerMatch = true;
          }
        }
      } catch (e) {
        // ignore and proceed to normal check
      }
    }

    if (!ownerMatch && req.user.role !== 'PLATFORM_ADMIN') {
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
