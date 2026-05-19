'use strict';

import mongoose from 'mongoose';

const MENU_TYPES = ['STARTER', 'MAIN', 'DESSERT', 'DRINK', 'SIDE', 'SOUP', 'SALAD', 'APPETIZER'];

const menuItemSchema = mongoose.Schema(
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
            maxLength: [150, 'Máximo 150 caracteres'],
        },
        description: {
            type: String,
            trim: true,
            maxLength: [500, 'Máximo 500 caracteres'],
        },
        price: {
            type: Number,
            required: [true, 'El precio es requerido'],
            min: [0, 'El precio no puede ser negativo'],
        },
        type: {
            type: String,
            required: [true, 'El tipo es requerido'],
            enum: { values: MENU_TYPES, message: 'Tipo no válido' },
        },
        ingredients: [String],
        allergens: [String],
        image: { 
            type: String, 
            default: null 
        },
        available: { 
            type: Boolean, 
            default: true 
        },
        active: { 
            type: Boolean, 
            default: true 
        },
        inventoryIngredients: [
            {
                ingredientId: { 
                    type: mongoose.Schema.Types.ObjectId, 
                    ref: 'Ingredient' 
                },
                quantity: { 
                    type: Number, 
                    min: 0 
                },
            },
        ],
    },
    { 
        timestamps: true, 
        versionKey: false 
    }
);

menuItemSchema.index({ restaurantId: 1 });
menuItemSchema.index({ active: 1 });
menuItemSchema.index({ type: 1 });
menuItemSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('MenuItem', menuItemSchema);