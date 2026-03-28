'use strict';
import { Router } from 'express';
import {
    createRestaurant,
    getRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant,
    uploadCover,
    addPhoto,
    deletePhoto
} from './restaurant.controller.js';
import {
    validateCreate,
    validateUpdate,
    validateGetById
} from '../../middlewares/restaurant-validators.js';
import { uploadRestaurantImage } from '../../middlewares/file-uploader.js';
import { cleanUploaderFileOnFinish } from '../../middlewares/delete-file-on-error.js';
import { checkRestaurantPermission } from '../../middlewares/check-restaurant-permission.js';
const router = Router();

const upload = uploadRestaurantImage.single('image');
const withImage = [upload, cleanUploaderFileOnFinish];
    
router.post('/create', 
    withImage, validateCreate, createRestaurant);
router.get('/get', getRestaurants);
router.get('/:id', validateGetById, getRestaurantById);
router.put('/:id', validateUpdate, checkRestaurantPermission('id'), updateRestaurant);
router.delete('/:id', validateUpdate, checkRestaurantPermission('id'), deleteRestaurant);
router.post('/:id/cover', withImage, validateUpdate, checkRestaurantPermission('id'), uploadCover);

export default router;
