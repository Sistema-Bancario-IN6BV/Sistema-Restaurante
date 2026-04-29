import { Router } from 'express';
import { uploadFieldImage } from '../../middlewares/file-uploader.js';
import {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    cancelEvent,
    uploadEventCover,
    registerToEvent,
    unregisterFromEvent,
    getEventRegistrations,
} from './event.controller.js';
import {
    validateGetEvents,
    validateGetEventById,
    validateCreateEvent,
    validateUpdateEvent,
    validateRegisterToEvent,
    validateUnregisterFromEvent,
    validateGetEventRegistrations,
    validateCancelEvent,
} from '../../middlewares/event-validators.js';

const router = Router();

// Rutas generales
router.get('/', validateGetEvents, getEvents);
router.post('/', validateCreateEvent, createEvent);

// Rutas por ID de evento
router.get('/:id', validateGetEventById, getEventById);
router.put('/:id', validateUpdateEvent, updateEvent);
router.patch('/:id/cancel', validateCancelEvent, cancelEvent);

// Gestión de imagen de portada
router.put(
    '/:id/cover',
    validateUpdateEvent,
    uploadFieldImage.single('cover'),
    uploadEventCover
);

// Inscripciones
router.post('/:id/register', validateRegisterToEvent, registerToEvent);
router.delete('/:id/register', validateUnregisterFromEvent, unregisterFromEvent);
router.get('/:id/registrations', validateGetEventRegistrations, getEventRegistrations);

export default router;
