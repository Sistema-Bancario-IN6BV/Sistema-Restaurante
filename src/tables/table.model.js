'use strict';

import mongoose from "mongoose";

const tableSchema = mongoose.Schema(
{
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'El restaurante es requerido']
    },
    tableNumber: {
        type: Number,
        required: [true, 'El número de mesa es requerido']
    },
    capacity: {
        type: Number,
        required: [true, 'La capacidad es requerida'],
        min: [1, 'Debe ser mínimo 1 persona']
    },
    location: {
        type: String,
        trim: true
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

tableSchema.index({ restaurant: 1 });
tableSchema.index({ isActive: 1 });
tableSchema.index({ restaurant: 1, tableNumber: 1 }, { unique: true });

export default mongoose.model('Table', tableSchema);
