'use strict';

import mongoose from 'mongoose';

const eventRegistrationSchema = mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'El evento es requerido'],
    },
    userId: {
      type: String,
      required: [true, 'El usuario es requerido'],
    },
    status: {
      type: String,
      enum: ['REGISTERED', 'CANCELLED', 'ATTENDED'],
      default: 'REGISTERED',
    },
  },
  { timestamps: true, versionKey: false }
);

eventRegistrationSchema.index(
  { eventId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { status: 'REGISTERED' } }
);

export default mongoose.model('EventRegistration', eventRegistrationSchema);
