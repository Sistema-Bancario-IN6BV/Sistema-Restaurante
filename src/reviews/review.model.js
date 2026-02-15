'use strict';

import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
{
    userId: {
        type: String,
        required: [true, 'El usuario es requerido']
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'El restaurante es requerido']
    },
    rating: {
        type: Number,
        required: [true, 'La calificación es requerida'],
        min: [1, 'Mínimo 1 estrella'],
        max: [5, 'Máximo 5 estrellas']
    },
    comment: {
        type: String,
        trim: true,
        maxLength: [500, 'Máximo 500 caracteres']
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

reviewSchema.index({ restaurant: 1 });
reviewSchema.index({ isActive: 1 });

export default mongoose.model('Review', reviewSchema);
