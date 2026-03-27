import { Router } from 'express';
import { uploadMenuItemImage } from '../../middlewares/file-uploader.js';
import { createMenuItem, getMenuByRestaurant, getMenuItemById, updateMenuItem, toggleAvailability, 
    deleteMenuItem, uploadMenuItemPhoto, linkIngredients, } from './menuItem.controller.js';
import { validateGetMenuItemById, validateUpdateMenuItemId, validateToggleAvailabilityId,
    validateDeleteMenuItemId, validateUploadMenuItemPhotoId, 
    validateLinkIngredients, } from '../../middlewares/menuItem-validators.js';

const router = Router();

router.post('/restaurants/:id/menu', createMenuItem);
router.get('/restaurants/:id/menu', getMenuByRestaurant);
router.get('/:itemId', validateGetMenuItemById, getMenuItemById);
router.put('/:itemId', validateUpdateMenuItemId, updateMenuItem);
router.patch('/:itemId/availability', validateToggleAvailabilityId, toggleAvailability);
router.delete('/:itemId', validateDeleteMenuItemId, deleteMenuItem);

router.put(
    '/:itemId/photo',
    validateUploadMenuItemPhotoId,
    uploadMenuItemImage.single('photo'),
    uploadMenuItemPhoto
);

router.put('/:itemId/ingredients', validateLinkIngredients, linkIngredients);

export default router;