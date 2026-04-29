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
<<<<<<< HEAD
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
    minStock: {
        type: Number,
        default: 5,
        min: [0, 'El stock mínimo no puede ser negativo']
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
=======
    { 
        timestamps: true, 
        versionKey: false 
>>>>>>> 493daf8dd443696490d6345b57dbcb0c47deafe7
    }
);

menuItemSchema.index({ restaurantId: 1 });
menuItemSchema.index({ active: 1 });
menuItemSchema.index({ type: 1 });
menuItemSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('MenuItem', menuItemSchema);