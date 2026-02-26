'use strict';

import mongoose from "mongoose";

const reservationSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
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
        startTime: {
            type: Date,
            required: true
        },
        endTime: {
            type: Date,
            required: true
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
reservationSchema.index({
    table: 1,
    reservationDate: 1,
    startTime: 1,
    endTime: 1
});

export default mongoose.model('Reservation', reservationSchema);
