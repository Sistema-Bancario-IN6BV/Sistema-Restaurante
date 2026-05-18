'use strict';
import mongoose from 'mongoose';

const Schema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre del restaurante es requerido'],
            trim: true,
            minlength: [2, 'El nombre debe tener minimo 2 caracteres'],
            maxlength: [100, 'El nombre debe tener maximo 100 caracteres'],
            unique: true
        },
        address: {
            street: String,
            city: {
                type: String,
                required: [true, 'La ciudad es requerida']
            },
            state: String,
            zipCode: String
        },
        phone: String,
        email: {
            type: String,
            lowercase: true
        },
        category: {
            type: String,
            enum: [
                'ITALIANA',
                'MEXICANA',
                'JAPONESA',
                'CHINA',
                'FRANCESA',
                'AMERICANA',
                'GUATEMALTECA',
                'MARISCOS',
                'VEGETARIANA',
                'VEGANA',
                'PARRILLA',
                'PIZZERIA',
                'CAFE',
                'SUSHI',
                'TAPAS',
                'FUSION',
                'PERUANA',
                'OTRA'
            ],
            required: [true, 'La categoria es requerida']
        },
        avgPrice: {
            type: Number,
            min: [0, 'El precio no puede ser negativo']
        },
        schedule: String,
        rating: {
            average: {
                type: Number,
                default: 0
            },
            count: {
                type: Number,
                default: 0
            }
        },
        photo: {
            type: String,
            default: null,
        },
        tags: [String],
        adminId: {
            type: String,
            required: [true, 'El administrador del restaurante es requerido']
        },
        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

Schema.index({ active: 1 });
Schema.index({ 'address.city': 1 });
Schema.index({ category: 1 });
Schema.index({ 'rating.average': -1 });

export default mongoose.model('Restaurant', Schema);