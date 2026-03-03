'use strict';

import mongoose from "mongoose";

const menuItemSchema = mongoose.Schema(
{
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'El restaurante es requerido']
    },
    name: {
        type: String,
        required: [true, 'El nombre del platillo es requerido'],
        trim: true,
        maxLength: [150, 'Máximo 150 caracteres']
    },
    description: {
        type: String,
        trim: true,
        maxLength: [500, 'Máximo 500 caracteres']
    },
    price: {
        type: Number,
        required: [true, 'El precio es requerido'],
        min: [0, 'El precio debe ser mayor o igual a 0']
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'El stock no puede ser negativo']
    },
    type: {
        type: String,
        required: [true, 'El tipo es requerido'],
        enum: {
            values: ['ENTRADA', 'PLATO_FUERTE', 'POSTRE', 'BEBIDA'],
            message: 'Tipo de platillo no válido'
        }
    },
    photo: {
        type: String,
        default: null
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

menuItemSchema.index({ restaurant: 1 });
menuItemSchema.index({ isActive: 1 });

export default mongoose.model('MenuItem', menuItemSchema);
