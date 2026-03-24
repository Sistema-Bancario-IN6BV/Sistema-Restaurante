'use strict';
import mongoose from "mongoose";

const ingredientSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre del ingrediente es requerido'],
        trim: true,
        maxlength: [100, 'El nombre no puede exceder 100 caracteres']
    },
    description: {
        type: String,
        maxlength: [500, 'La descripción no puede exceder 500 caracteres']
    },
    unit: {
        type: String,
        enum: ['kg', 'g', 'litros', 'ml', 'unidades'],
        default: 'kg'
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    minStock: {
        type: Number,
        min: 0,
        default: 0
    },
    costPerUnit: {
        type: Number,
        min: 0,
        default: 0
    },
    supplier: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Ingredient', ingredientSchema);
