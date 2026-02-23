import Review from './review.model.js';
import Restaurant from '../restaurant/restaurant.model.js';

export const createReview = async (req, res) => {
    try {
        const reviewData = req.body;
        reviewData.user = req.user.uid;

        const restaurantExists = await Restaurant.findOne({
            _id: reviewData.restaurant,
            isActive: true
        });

        if (!restaurantExists) {
            return res.status(400).json({
                success: false,
                message: 'El restaurante no existe o está inactivo'
            });
        }

        const review = new Review(reviewData);
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
        res.status(400).json({
            success: false,
            message: 'Error al crear la reseña',
            error: error.message
        });
    }
};

export const getReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive = true } = req.query;

        const filter = { isActive };

        if (req.query.restaurant) filter.restaurant = req.query.restaurant;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const reviews = await Review.find(filter)
            .populate('user', 'name')
            .populate('restaurant', 'name')
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber)
            .sort({ createdAt: -1 });

        const total = await Review.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: reviews,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(total / limitNumber),
                totalRecords: total,
                limit: limitNumber
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las reseñas',
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

        if (!review) {
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
};

export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;

        const currentReview = await Review.findById(id);

        if (!currentReview) {
            return res.status(404).json({
                success: false,
                message: 'Reseña no encontrada'
            });
        }

        if (currentReview.user.toString() !== req.user.uid) {
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
        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activada' : 'desactivada';

        const review = await Review.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Reseña no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: `Reseña ${action} exitosamente`,
            data: review
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado de la reseña',
            error: error.message
        });
    }
};
