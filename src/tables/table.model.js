'use strict';

import mongoose from "mongoose";

const tableSchema = mongoose.Schema(
{
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'El restaurante es obligatorio'],
    },
    number: {
        type: Number,
        required: [true, 'El número de mesa es obligatorio'],
        min: [1, 'El número de mesa debe ser mayor a 0'],
    },
    capacity: {
        type: Number,
        required: [true, 'La capacidad es obligatoria'],
        min: [1, 'La capacidad mínima es 1'],
        max: [20, 'La capacidad máxima es 20'],
    },
    location: {
        type: String,
        enum: {
            values: ['INTERIOR', 'EXTERIOR', 'TERRACE', 'PRIVATE_ROOM'],
            message: 'Ubicación inválida: {VALUE}',
        },
        default: 'INTERIOR',
    },
    status: {
        type: String,
        enum: {
            values: ['AVAILABLE', 'OCCUPIED', 'RESERVED'],
            message: 'Estado inválido: {VALUE}',
        },
        default: 'AVAILABLE',
    },
    description: {
        type: String,
        trim: true,
        maxlength: [150, 'La descripción no puede superar 150 caracteres'],
        default: null,
    },
    active: {
        type: Boolean,
        default: true,
    },
    },
    {
        timestamps: true,
        versionKey: false,
    }
    );
    
tableSchema.index({ restaurantId: 1, number: 1 }, { unique: true });
tableSchema.index({ restaurantId: 1, status: 1 });
tableSchema.index({ restaurantId: 1, location: 1 });

export default mongoose.model('Table', tableSchema);
