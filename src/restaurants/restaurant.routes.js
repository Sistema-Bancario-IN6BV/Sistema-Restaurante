'use strict';
import { Router } from 'express';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import {
    changeRestaurantStatus,
    createRestaurantAdmin,
    createRestaurant,
    deactivateRestaurantAdmin,
    getRestaurantByIdAdmin,
    getRestaurantsAdmin,
    searchClientRestaurantsByAveragePrice,
    searchClientRestaurantsByCategory,
    searchClientRestaurantsByCity,
    searchClientRestaurantsByName,
    getRestaurantById,
    getRestaurants,
    searchRestaurantsByAveragePrice,
    searchRestaurantsByCategory,
    searchRestaurantsByCity,
    searchRestaurantsByName,
    updateRestaurantAdmin,
    updateRestaurant,
    deleteRestaurant,
    uploadCover,
    addPhoto,
    deletePhoto,
    getTablesByRestaurant
} from './restaurant.controller.js';
import { uploadRestaurantImage, uploadFieldImage } from '../../middlewares/file-uploader.js';
import { cleanUploaderFileOnFinish } from '../../middlewares/delete-file-on-error.js';
import {
    validateAdminCreateRestaurant,
    validateAdminDeactivateRestaurant,
    validateAdminGetRestaurantById,
    validateAdminGetRestaurants,
    validateAdminUpdateRestaurant,
    validateClientSearchRestaurantsByAveragePrice,
    validateClientSearchRestaurantsByCategory,
    validateClientSearchRestaurantsByCity,
    validateClientSearchRestaurantsByName,
    validateCreate,
    validateGetRestaurants,
    validateGetById,
    validateSearchRestaurantsByAveragePrice,
    validateSearchRestaurantsByCategory,
    validateSearchRestaurantsByCity,
    validateSearchRestaurantsByName,
    validateUpdate
} from '../../middlewares/restaurant-validators.js';
import { checkRestaurantPermission } from '../../middlewares/check-restaurant-permission.js';
import { parseMultipartFields } from '../../middlewares/parse-multipart-fields.js';

const router = Router();

router.use(validateJWT);

const upload = uploadRestaurantImage.single('image');
const withImage = [upload, parseMultipartFields, cleanUploaderFileOnFinish];

router.post('/create', withImage, validateCreate, createRestaurant);
router.get('/get', validateGetRestaurants, getRestaurants);
router.get('/:id', validateGetById, getRestaurantById);
router.put('/:id', withImage, validateUpdate, checkRestaurantPermission('id'), updateRestaurant);
router.delete('/:id', validateUpdate, checkRestaurantPermission('id'), deleteRestaurant);
router.post('/:id/cover', withImage, validateUpdate, checkRestaurantPermission('id'), uploadCover);
router.get('/restaurant/:restaurantId', getTablesByRestaurant);

export default router;