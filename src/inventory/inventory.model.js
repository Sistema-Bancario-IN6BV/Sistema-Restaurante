'use strict';
import mongoose from 'mongoose';

const Schema = mongoose.Schema(
    {
        restaurantId: { 
            type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', 
            required: true 
        },
        name: { 
            type: String, 
            required: true, 
            trim: true 
        },
        unit: { 
            type: String, 
            enum: ['KG', 'GRAMOS', 'LITROS', 'ML', 'UNIDADES', 'PORCIONES'], 
            required: true 
        },
        currentStock: { 
            type: Number, 
            required: true, 
            min: 0 
        },
        minStock: { 
            type: Number, 
            required: true, 
            min: 0 
        },
        costPerUnit: { 
            type: Number, 
            required: true, 
            min: 0 
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
        }
    }, 
    { 
        timestamps: true, 
        versionKey: false 
    });

export default mongoose.model('Ingredient', Schema);
