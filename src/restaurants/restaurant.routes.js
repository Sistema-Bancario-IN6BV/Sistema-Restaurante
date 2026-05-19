import { Router } from 'express';
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
    updateRestaurant
} from './restaurant.controller.js';
import { uploadFieldImage } from '../../middlewares/file-uploader.js';
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
    validateCreateField,
    validateFieldStatusChange,
    validateGetFieldById,
    validateGetRestaurants,
    validateSearchRestaurantsByAveragePrice,
    validateSearchRestaurantsByCategory,
    validateSearchRestaurantsByCity,
    validateSearchRestaurantsByName,
    validateUpdateFieldRequest
} from '../../middlewares/restaurant-validators.js';
import { uploadRestaurantImage } from '../../middlewares/file-uploader.js';
import { cleanUploaderFileOnFinish } from '../../middlewares/delete-file-on-error.js';
import { checkRestaurantPermission } from '../../middlewares/check-restaurant-permission.js';
import { parseMultipartFields } from '../../middlewares/parse-multipart-fields.js';
const router = Router();

// Middleware de autenticación para todas las rutas
router.use(validateJWT);

const upload = uploadRestaurantImage.single('image');
const withImage = [upload, parseMultipartFields, cleanUploaderFileOnFinish];
    
router.post('/create', 
    withImage, validateCreate, createRestaurant);
router.get('/get', getRestaurants);
router.get('/:id', validateGetById, getRestaurantById);
router.put('/:id', withImage, validateUpdate, checkRestaurantPermission('id'), updateRestaurant);
router.delete('/:id', validateUpdate, checkRestaurantPermission('id'), deleteRestaurant);
router.post('/:id/cover', withImage, validateUpdate, checkRestaurantPermission('id'), uploadCover);

export default router;