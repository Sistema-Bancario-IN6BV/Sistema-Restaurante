import { Router } from 'express';
import { changeEventStatus, createEvent, getEventById, getEvents, updateEvent } from './event.controller.js';
import { uploadFieldImage } from '../../middlewares/file-uploader.js';
import { cleanUploaderFileOnFinish } from '../../middlewares/delete-file-on-error.js';
import { validateCreateField, validateFieldStatusChange, validateGetFieldById, validateUpdateFieldRequest, validateGetEvents } from '../../middlewares/event-validators.js';

const router = Router();

router.post(
    '/create',
    uploadFieldImage.single('image'),
    cleanUploaderFileOnFinish,
    validateCreateField,
    createEvent
)

router.get(
    '/get',
    validateGetEvents,
    getEvents
)

router.get(
    '/:id',
    validateGetFieldById,
    getEventById
)

router.put(
    '/:id',
    uploadFieldImage.single('image'),
    cleanUploaderFileOnFinish,
    validateUpdateFieldRequest,
    updateEvent
);

router.put(
    '/:id/activate',
    validateFieldStatusChange,
    changeEventStatus
)

router.put(
    '/:id/desactivate',
    validateFieldStatusChange,
    changeEventStatus
)

export default router;