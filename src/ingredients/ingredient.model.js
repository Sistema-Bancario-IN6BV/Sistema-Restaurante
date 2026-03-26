'use strict';

import mongoose from 'mongoose';

const UNITS = ['KG', 'G', 'LT', 'ML', 'UNIT', 'DOZEN', 'POUND', 'OZ'];

const ingredientSchema = mongoose.Schema(
    {
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'El restaurante es requerido'],
        },
        name: {
            type: String,
            required: [true, 'El nombre es requerido'],
            trim: true,
            maxLength: [100, 'Máximo 100 caracteres'],
        },
        unit: {
            type: String,
            required: [true, 'La unidad es requerida'],
            enum: { values: UNITS, message: 'Unidad no válida' },
        },
        currentStock: {
            type: Number,
            required: [true, 'El stock actual es requerido'],
            min: [0, 'No puede ser negativo'],
        },
        minStock: {
            type: Number,
            required: [true, 'El stock mínimo es requerido'],
            min: [0, 'No puede ser negativo'],
        },
        costPerUnit: {
            type: Number,
            default: 0,
            min: [0, 'No puede ser negativo'],
        },
        supplier: { 
            type: String, 
            trim: true 
        },
        lowStockAlert: { 
            type: Boolean, 
            default: false 
        },
        lastRestockedAt: { 
            type: Date 
        },
        active: { 
            type: Boolean, 
            default: true 
        },
    },
    { 
        timestamps: true, 
        versionKey: false, 
        toJSON: { virtuals: true }, 
        toObject: { virtuals: true } 
    }
);

ingredientSchema.virtual('isLowStock').get(function () {
    return this.currentStock < this.minStock;
});

ingredientSchema.pre('save', function () {
    this.lowStockAlert = this.currentStock < this.minStock;
});

ingredientSchema.index({ restaurantId: 1 });
ingredientSchema.index({ active: 1 });
ingredientSchema.index({ restaurantId: 1, name: 1 }, { unique: true });

export default mongoose.model('Ingredient', ingredientSchema);