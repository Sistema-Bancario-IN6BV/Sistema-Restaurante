'use strict';

import { Router } from 'express';
import {
    createMenuItem,
    getAllMenuItem,
    getMenuItemById,
    updateMenuItem,
    changeMenuItemStatus
} from './menuItem.controller.js';

import { uploadMenuItemImage } from '../../middlewares/file-uploader.js';
import { cleanUploaderFileOnFinish } from '../../middlewares/delete-file-on-error.js';

import {
    validateCreateMenuItem,
    validateUpdateMenuItemRequest,
    validateGetMenuItemById,
    validateMenuItemStatusChange
} from '../../middlewares/menu-item-validators.js';

const router = Router();

router.post(
    '/create',
    uploadMenuItemImage.single('photo'),
    cleanUploaderFileOnFinish,
    validateCreateMenuItem,
    createMenuItem
);

router.get(
    '/get',
    getAllMenuItem
);

router.get(
    '/:id',
    validateGetMenuItemById,
    getMenuItemById
);

router.put(
    '/:id',
    uploadMenuItemImage.single('photo'),
    cleanUploaderFileOnFinish,
    validateUpdateMenuItemRequest,
    updateMenuItem
);

router.put(
    '/:id/activate',
    validateMenuItemStatusChange,
    changeMenuItemStatus
);

router.put(
    '/:id/deactivate',
    validateMenuItemStatusChange,
    changeMenuItemStatus
);

export default router;
