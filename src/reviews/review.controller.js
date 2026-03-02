'use strict';

import Review from './review.model.js';
import Restaurant from '../restaurants/restaurant.model.js';

export const createReview = async (req, res) => {
    try {
        const { restaurant, rating, comment } = req.body;

        const restaurantExists = await Restaurant.findOne({
            _id: restaurant,
            isActive: true
        });

        if (!restaurantExists) {
            return res.status(400).json({
                success: false,
                message: 'El restaurante no existe o está inactivo'
            });
        }

        const review = new Review({
            user: req.user.uid,
            restaurant,
            rating,
            comment
        });

        await review.save();

        res.status(201).json({
            success: true,
            message: 'Reseña creada exitosamente',
            data: review
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Ya has realizado una reseña para este restaurante'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al crear la reseña',
            error: error.message
        });
    }
};

export const getReviews = async (req, res) => {
    try {
        const { restaurant, page = 1, limit = 10 } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const filter = { isActive: true };

        if (restaurant) {
            filter.restaurant = restaurant;
        }

        const reviews = await Review.find(filter)
            .populate('user', 'name')
            .populate('restaurant', 'name')
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber)
            .sort({ createdAt: -1 });

        const total = await Review.countDocuments(filter);

        res.status(200).json({
            success: true,
            total,
            page: pageNumber,
            pages: Math.ceil(total / limitNumber),
            data: reviews
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener reseñas',
            error: error.message
        });
    }
};

export const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id)
            .populate('user', 'name')
            .populate('restaurant', 'name');

        if (!review || !review.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Reseña no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la reseña',
            error: error.message
        });
    }
}

export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id);

        if (!review || !review.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Reseña no encontrada'
            });
        }

        if (review.user.toString() !== req.user.uid) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para modificar esta reseña'
            });
        }

        const updatedReview = await Review.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Reseña actualizada exitosamente',
            data: updatedReview
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la reseña',
            error: error.message
        });
    }
};

export const changeReviewStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id);

        if (!review || !review.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Reseña no encontrada'
            });
        }

        if (review.user.toString() !== req.user.uid) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar esta reseña'
            });
        }

        review.isActive = false;
        await review.save();

        res.status(200).json({
            success: true,
            message: 'Reseña eliminada exitosamente'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la reseña',
            error: error.message
        });
    }
};
