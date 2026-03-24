'use strict';
import mongoose from "mongoose";

const eventRegistrationSchema = mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Asumiendo que así se llama tu modelo en Auth
        required: true
    },
    registeredAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['CONFIRMADA', 'CANCELADA'],
        default: 'CONFIRMADA'
    }
}, { timestamps: true });

// SR-206: Un usuario solo se inscribe una vez por evento
eventRegistrationSchema.index({ event: 1, user: 1 }, { unique: true });

export default mongoose.model('EventRegistration', eventRegistrationSchema);