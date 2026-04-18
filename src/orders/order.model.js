'use strict';

import mongoose from 'mongoose';

const orderItemSchema = mongoose.Schema(
  {
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const statusHistorySchema = mongoose.Schema(
  {
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: String },
  },
  { _id: false }
);

const orderSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'El usuario es requerido'],
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'El restaurante es requerido'],
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
    },
    type: {
      type: String,
      enum: ['DINE_IN', 'DELIVERY', 'TAKEOUT'],
      required: [true, 'El tipo de pedido es requerido'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (arr) {
          return arr && arr.length > 0;
        },
        message: 'Debe tener al menos un item',
      },
    },
    deliveryAddress: {
      street: String,
      city: String,
      notes: String,
    },
    subtotal: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, default: 0.12 },
    taxAmount: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    statusHistory: [statusHistorySchema],
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

orderSchema.pre('validate', function () {
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => {
      const subtotal = item.quantity * item.unitPrice;
      return sum + subtotal;
    }, 0);
    this.taxAmount = Math.round(this.subtotal * this.taxRate * 100) / 100;
    this.total = Math.round((this.subtotal + this.taxAmount) * 100) / 100;
  }
});

orderSchema.index({ userId: 1 });
orderSchema.index({ restaurantId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ active: 1 });

export default mongoose.model('Order', orderSchema);
