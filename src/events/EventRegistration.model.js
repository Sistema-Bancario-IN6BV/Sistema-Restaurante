'use strict';

import mongoose from "mongoose";

const eventRegistrationSchema = mongoose.Schema({
    userId: {
        type: String, // ID del cliente desde JWT
        required: [true, 'User ID requerido']
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: [true, 'Event ID requerido']
    },
    status: {
        type: String,
        enum: ['REGISTERED', 'CANCELLED'],
        default: 'REGISTERED'
    }
}, {
    timestamps: true,
    versionKey: false
});

eventRegistrationSchema.index({ userId: 1, eventId: 1 }); // Unique registration per user-event

export default mongoose.model('EventRegistration', eventRegistrationSchema);
