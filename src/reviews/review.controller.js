'use strict';

import Review from './review.model.js';
import Restaurant from '../restaurants/restaurant.model.js';
import Order from '../orders/order.model.js';
import { cloudinary } from '../../middlewares/file-uploader.js';

export const createReview = async (req, res) => {
    try {
        const { orderId, restaurantId, rating, comment, subRatings } = req.body;

        // Validar que la orden existe, pertenece al usuario y fue entregada
        const order = await Order.findOne({
            _id: orderId,
            userId: req.user.id,
            restaurantId,
            status: 'DELIVERED',
        });
        if (!order) {
            return res.status(400).json({ success: false, message: 'Solo puedes reseñar órdenes entregadas que te pertenecen' });
        }

        const review = await Review.create({
            userId: req.user.id,
            restaurantId,
            orderId,
            rating,
            comment,
            subRatings,
            photos: req.files ? req.files.map(f => f.path || f.secure_url) : [],
        });

        res.status(201).json({ success: true, data: review });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ success: false, message: 'Ya existe una reseña para esta orden' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getReviewsByRestaurant = async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
        const filter = { restaurantId: req.params.id, active: true, visible: true };
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [reviews, total] = await Promise.all([
            Review.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            Review.countDocuments(filter),
        ]);

        // Distribución de calificaciones
        const distribution = await Review.aggregate([
            { $match: { restaurantId: reviews[0]?.restaurantId || null, active: true } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } },
        ]);

        const restaurant = await Restaurant.findById(req.params.id).select('rating');

        res.json({
            success: true,
            data: reviews,
            rating: restaurant?.rating,
            distribution,
            pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('restaurantId', 'name');
        if (!review) return res.status(404).json({ success: false, message: 'Reseña no encontrada' });
        res.json({ success: true, data: review });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const replyToReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { adminReply: req.body.reply },
            { new: true }
        );
        if (!review) return res.status(404).json({ success: false, message: 'Reseña no encontrada' });
        res.json({ success: true, message: 'Respuesta agregada', data: review });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: 'Reseña no encontrada' });

        // Solo el autor o admin puede eliminar
        const isOwner = review.userId === req.user.id;
        const isAdmin = req.user.role === 'RESTAURANT_ADMIN' || req.user.role === 'PLATFORM_ADMIN';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: 'No autorizado' });
        }

        if (review.photos?.length) {
            const deleteOps = review.photos.map(url => {
                const parts = url.split('/');
                const publicId = parts.slice(-2).join('/').replace(/\.[^.]+$/, '');
                return cloudinary.uploader.destroy(publicId).catch(() => { });
            });
            await Promise.all(deleteOps);
        }

        review.active = false;
        review.visible = false;
        await review.save();
        res.json({ success: true, message: 'Reseña eliminada' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
