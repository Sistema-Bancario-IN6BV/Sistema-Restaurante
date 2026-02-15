'use strict';

import mongoose from "mongoose";

const reservationSchema = mongoose.Schema(
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
    table: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table',
        required: [true, 'La mesa es requerida']
    },
    reservationDate: {
        type: Date,
        required: [true, 'La fecha es requerida']
    },
    status: {
        type: String,
        enum: {
            values: ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'FINALIZADA'],
            message: 'Estado no válido'
        },
        default: 'PENDIENTE'
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

reservationSchema.index({ userId: 1 });
reservationSchema.index({ restaurant: 1 });
reservationSchema.index({ isActive: 1 });

export default mongoose.model('Reservation', reservationSchema);
