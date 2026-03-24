'use strict';
import mongoose from "mongoose";

const eventSchema = mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'El restaurante es requerido']
    },
    title: {
        type: String,
        required: [true, 'El título del evento es requerido'],
        trim: true
    },
    description: {
        type: String,
        maxLength: [1000, 'Máximo 1000 caracteres']
    },
    date: {
        type: Date,
        required: [true, 'La fecha es obligatoria'],
        validate: {
            validator: function(v) {
                return v > new Date(); // SR-190: Fecha futura obligatoria
            },
            message: 'La fecha del evento debe ser posterior a la actual'
        }
    },
    maxCapacity: {
        type: Number,
        required: [true, 'La capacidad máxima es requerida'],
        min: [1, 'La capacidad debe ser al menos de 1 persona']
    },
    currentRegistrations: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['ACTIVO', 'CANCELADO', 'FINALIZADO'],
        default: 'ACTIVO'
    },
    tags: [String] // SR-190: Servicios adicionales como tags
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);