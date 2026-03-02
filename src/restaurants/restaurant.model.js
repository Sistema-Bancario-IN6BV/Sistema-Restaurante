'use strict';

import mongoose from "mongoose";

const restaurantSchema = mongoose.Schema(
{
    name: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true,
        maxLength: [150, 'El nombre no puede exceder 150 caracteres']
    },
    description: {
        type: String,
        trim: true,
        maxLength: [500, 'La descripción no puede exceder 500 caracteres']
    },
    address: {
        type: String,
        required: [true, 'La dirección es requerida'],
        trim: true
    },
    category: {
        type: String,
        trim: true
    },
    averagePrice: {
        type: Number,
        min: [0, 'El precio promedio no puede ser negativo']
    },
    contactEmail: {
        type: String,
        trim: true
    },
    contactPhone: {
        type: String,
        trim: true
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

restaurantSchema.index({ isActive: 1 });
restaurantSchema.index({ category: 1 });

export default mongoose.model('Restaurant', restaurantSchema);
