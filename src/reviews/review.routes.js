import { Router } from 'express';
import { 
    changeReviewStatus, 
    createReview, 
    getReviewById, 
    getReviews, 
    updateReview 
} from './review.controller.js';

import { 
    validateCreateReview, 
    validateReviewStatusChange, 
    validateGetReviewById, 
    validateUpdateReviewRequest 
} from '../../middlewares/review-validators.js';

const router = Router();

router.post(
    '/create',
    validateCreateReview,
    createReview
);

router.get(
    '/get',
    getReviews
);

router.get('/:id', validateGetReviewById, getReviewById);

router.put(
    '/:id',
    validateUpdateReviewRequest,
    updateReview
);

router.put('/:id/activate', validateReviewStatusChange, changeReviewStatus);
router.put('/:id/deactivate', validateReviewStatusChange, changeReviewStatus);

export default router;
