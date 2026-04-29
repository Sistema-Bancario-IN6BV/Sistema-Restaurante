'use strict';

import mongoose from 'mongoose';

const EVENT_STATUSES = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'];

const eventSchema = mongoose.Schema(
    {
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'El restaurante es requerido'],
        },
        title: {
            type: String,
            required: [true, 'El título es requerido'],
            trim: true,
            maxLength: [150, 'Máximo 150 caracteres'],
        },
        description: { type: String, trim: true, maxLength: 500 },
        date: {
            type: Date,
            required: [true, 'La fecha es requerida'],
        },
        startTime: {
            type: String,
            required: [true, 'La hora de inicio es requerida'],
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato HH:MM'],
        },
        endTime: {
            type: String,
            required: [true, 'La hora de fin es requerida'],
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato HH:MM'],
        },
        capacity: {
            type: Number,
            required: [true, 'La capacidad es requerida'],
            min: [1, 'Mínimo 1'],
        },
        registeredCount: { type: Number, default: 0, min: 0 },
        price: { type: Number, default: 0, min: 0 },
        status: {
            type: String,
            enum: { values: EVENT_STATUSES, message: 'Estado no válido' },
            default: 'UPCOMING',
        },
        services: [String],
        coverImage: { type: String, default: null },
        coverPublicId: { type: String, default: null },
        tags: [String],
        cancelReason: { type: String, trim: true },
        active: { type: Boolean, default: true },
    },
    { timestamps: true, versionKey: false, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

eventSchema.virtual('availableSpots').get(function () {
    return this.capacity - this.registeredCount;
});

eventSchema.virtual('isFull').get(function () {
    return this.registeredCount >= this.capacity;
});

eventSchema.index({ restaurantId: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ active: 1 });

export default mongoose.model('Event', eventSchema);