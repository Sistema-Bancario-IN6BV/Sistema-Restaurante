'use strict';

import mongoose from "mongoose";

const eventSchema = mongoose.Schema(
{
    title: {
        type: String,
        required: [true, 'El título del evento es obligatorio'],
        trim: true,
        maxLength: [100, 'El título no puede exceder 100 caracteres']
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'La descripción es obligatoria']
    },
    date: {
        type: Date,
        required: [true, 'La fecha es obligatoria'],
        validate: {
            validator: function(v) {
                return v > new Date(); // Evita fechas pasadas
            },
            message: 'La fecha del evento debe ser futura.'
        }
    },
    maxCapacity: {
        type: Number,
        required: [true, 'La capacidad máxima es requerida'],
        min: [1, 'La capacidad debe ser al menos de 1 persona']
    },
    currentParticipants: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'CANCELLED', 'FINISHED'],
        default: 'ACTIVE'
    },
    tags: [{
        type: String,
        trim: true
    }],
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'El evento debe estar ligado a un restaurante']
    },
    createdBy: {
        type: String, // Guardaremos el ID que viene de .NET
        required: true
    }
},
{
    timestamps: true,
    versionKey: false
}
);

// Índice para búsquedas rápidas por fecha y estado
eventSchema.index({ date: 1, status: 1 });

export default mongoose.model('Event', eventSchema);