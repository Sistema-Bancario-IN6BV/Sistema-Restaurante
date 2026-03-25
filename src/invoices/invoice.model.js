'use strict';

import mongoose from 'mongoose';

const invoiceItemSchema = mongoose.Schema(
  {
    name: String,
    quantity: Number,
    unitPrice: Number,
    subtotal: Number,
  },
  { _id: false }
);

const invoiceSchema = mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    items: [invoiceItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, default: 0.12 },
    taxAmount: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'CANCELLED'],
      default: 'PENDING',
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'CARD', 'TRANSFER'],
    },
    issuedAt: { type: Date, default: Date.now },
    paidAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

// Auto-generate invoiceNumber: FAC-YYYY-NNNNN
invoiceSchema.pre('save', async function () {
  if (this.isNew && !this.invoiceNumber) {
    const year = new Date().getFullYear();
    const prefix = `FAC-${year}-`;
    const last = await this.constructor
      .findOne({ invoiceNumber: { $regex: `^${prefix}` } })
      .sort({ invoiceNumber: -1 })
      .lean();
    let seq = 1;
    if (last) {
      const lastSeq = parseInt(last.invoiceNumber.split('-')[2], 10);
      seq = lastSeq + 1;
    }
    this.invoiceNumber = `${prefix}${String(seq).padStart(5, '0')}`;
  }
});


invoiceSchema.index({ userId: 1 });
invoiceSchema.index({ restaurantId: 1 });
invoiceSchema.index({ status: 1 });

export default mongoose.model('Invoice', invoiceSchema);
