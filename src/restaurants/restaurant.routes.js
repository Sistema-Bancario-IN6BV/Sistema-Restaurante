import { Router } from 'express';
import { changeRestaurantStatus, createRestaurant, getRestaurantById, getRestaurants, updateRestaurant } from './restaurant.controller.js';
import { uploadFieldImage } from '../../middlewares/file-uploader.js';
import { cleanUploaderFileOnFinish } from '../../middlewares/delete-file-on-error.js';
import { validateCreateField, validateFieldStatusChange, validateGetFieldById, validateUpdateFieldRequest, validateGetRestaurants } from '../../middlewares/restaurant-validators.js';

const router = Router();

router.post(
    '/create',
    uploadFieldImage.single('image'),
    cleanUploaderFileOnFinish,
    validateCreateField,
    createRestaurant
)

router.get(
    '/get',
    validateGetRestaurants,
    getRestaurants
)

router.get(
    '/:id',
    validateGetFieldById,
    getRestaurantById
)

router.put(
    '/:id',
    uploadFieldImage.single('image'),
    cleanUploaderFileOnFinish,
    validateUpdateFieldRequest,
    updateRestaurant
);

router.put(
    '/:id/activate',
    validateFieldStatusChange,
    changeRestaurantStatus
)

router.put(
    '/:id/desactivate',
    validateFieldStatusChange,
    changeRestaurantStatus
)

export default router;