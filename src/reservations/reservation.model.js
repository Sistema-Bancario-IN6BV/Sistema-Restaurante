'use strict';

import mongoose from 'mongoose';

const reservationSchema = mongoose.Schema(
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
            required: [true, 'La mesa es requerida'],
        },
        date: {
            type: Date,
            required: [true, 'La fecha es requerida'],
        },
        time: {
            type: String,
            required: [true, 'La hora es requerida'],
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato HH:MM requerido'],
        },
        guests: {
            type: Number,
            required: [true, 'El número de comensales es requerido'],
            min: [1, 'Mínimo 1'],
            max: [20, 'Máximo 20'],
        },
        status: {
            type: String,
            enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
            default: 'PENDING',
        },
        notes: { 
            type: String, 
            trim: true, 
            maxLength: 500 
        },
        cancelReason: { 
            type: String, 
            trim: true 
        },
        cancelledAt: { 
            type: Date 
        },
        confirmedAt: { 
            type: Date 
        },
        active: { 
            type: Boolean, 
            default: true 
        },
    },
    { 
        timestamps: true, 
        versionKey: false 
    }
);

reservationSchema.index({ userId: 1 });
reservationSchema.index({ restaurantId: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ tableId: 1, date: 1 },{ unique: true, partialFilterExpression: { status: { $in: ['PENDING', 'CONFIRMED'] } } });

export default mongoose.model('Reservation', reservationSchema);
