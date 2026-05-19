import { Router } from 'express';
import { uploadFieldImage } from '../../middlewares/file-uploader.js';
import {
    createReview,
    getReviewsByRestaurant,
    getReviewById,
    replyToReview,
    deleteReview,
} from './review.controller.js';
import {
    validateCreateReview,
    validateGetReviewsByRestaurant,
    validateGetReviewById,
    validateReplyToReview,
    validateDeleteReview,
} from '../../middlewares/reviews-validators.js';

const router = Router();

router.get('/restaurant/:id', validateGetReviewsByRestaurant, getReviewsByRestaurant);
router.get('/:id', validateGetReviewById, getReviewById);

router.post(
    '/',
    validateCreateReview,
    uploadFieldImage.array('photos', 3),
    createReview
);

router.delete('/:id', validateDeleteReview, deleteReview);
router.patch('/:id/reply', validateReplyToReview, replyToReview);

export default router;
