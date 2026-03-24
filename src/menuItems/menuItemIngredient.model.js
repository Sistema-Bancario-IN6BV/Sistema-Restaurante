'use strict';
import mongoose from "mongoose";

const menuItemIngredientSchema = mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: [true, 'El platillo es requerido']
    },
    ingredient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredient',
        required: [true, 'El ingrediente es requerido']
    },
    quantity: {
        type: Number,
        required: [true, 'La cantidad consumida es requerida'],
        min: [0.01, 'La cantidad debe ser mayor a 0']
    }
}, { timestamps: true });

// Índice para búsquedas rápidas por platillo
menuItemIngredientSchema.index({ menuItem: 1 });

export default mongoose.model('MenuItemIngredient', menuItemIngredientSchema);