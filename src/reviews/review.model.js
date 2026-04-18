'use strict';

import mongoose from 'mongoose';
import Restaurant from '../restaurants/restaurant.model.js';

const reviewSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'El usuario es requerido'],
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'El restaurante es requerido'],
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      unique: true,
    },
    rating: {
      type: Number,
      required: [true, 'La calificación es requerida'],
      min: 1,
      max: 5,
    },
    comment: { type: String, trim: true, maxLength: 500 },
    adminReply: { type: String, trim: true, maxLength: 500 },
    subRatings: {
      food: { type: Number, min: 1, max: 5 },
      service: { type: Number, min: 1, max: 5 },
      ambiance: { type: Number, min: 1, max: 5 },
      value: { type: Number, min: 1, max: 5 },
    },
    photos: {
      type: [String],
      validate: [arr => arr.length <= 3, 'Máximo 3 fotos'],
    },
    visible: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

reviewSchema.post('save', async function () {
  try {
    const stats = await this.constructor.aggregate([
      { $match: { restaurantId: this.restaurantId, visible: true, active: true } },
      { $group: { _id: '$restaurantId', average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats.length > 0) {
      await Restaurant.findByIdAndUpdate(this.restaurantId, {
        'rating.average': Math.round(stats[0].average * 10) / 10,
        'rating.count': stats[0].count,
      });
    }
  } catch (err) {
    console.error('Error recalculando rating:', err.message);
  }
});

reviewSchema.index({ restaurantId: 1 });
reviewSchema.index({ userId: 1 });

reviewSchema.index({ visible: 1 });

export default mongoose.model('Review', reviewSchema);