'use strict';

import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
{
    userId: {
        type: String,
        required: [true, 'El usuario es requerido']
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'El restaurante es requerido']
    },
    total: {
        type: Number,
        default: 0,
        min: [0, 'El total no puede ser negativo']
    },
    status: {
        type: String,
        enum: {
            values: ['EN_PREPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO'],
            message: 'Estado no válido'
        },
        default: 'EN_PREPARACION'
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

orderSchema.index({ userId: 1 });
orderSchema.index({ isActive: 1 });

export default mongoose.model('Order', orderSchema);