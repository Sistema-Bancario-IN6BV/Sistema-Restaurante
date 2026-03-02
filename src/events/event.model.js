'use strict';

import mongoose from "mongoose";

const eventSchema = mongoose.Schema(
{
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'El restaurante es requerido']
    },
    title: {
        type: String,
        required: [true, 'El título es requerido'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    eventDate: {
        type: Date,
        required: [true, 'La fecha es requerida']
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

eventSchema.index({ restaurant: 1 });
eventSchema.index({ isActive: 1 });

export default mongoose.model('Event', eventSchema);
