'use strict';

import mongoose from "mongoose";

const orderDetailSchema = mongoose.Schema(
{
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: [true, 'La orden es requerida']
    },
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: [true, 'El platillo es requerido']
    },
    quantity: {
        type: Number,
        required: [true, 'La cantidad es requerida'],
        min: [1, 'La cantidad debe ser al menos 1']
    },
    price: {
        type: Number,
        required: [true, 'El precio es requerido'],
        min: [0, 'El precio no puede ser negativo']
    },
    subtotal: {
        type: Number,
        required: [true, 'El subtotal es requerido'],
        min: [0, 'El subtotal no puede ser negativo']
    },
    isActive: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true,
    versionKey: false
}
);

orderDetailSchema.index({ order: 1 });
orderDetailSchema.index({ menuItem: 1 });
orderDetailSchema.index({ isActive: 1 });

export default mongoose.model('OrderDetail', orderDetailSchema);
