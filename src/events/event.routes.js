import { Router } from 'express';
import { uploadFieldImage } from '../../middlewares/file-uploader.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { checkRestaurantPermission } from '../../middlewares/check-restaurant-permission.js';
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
    deleteEvent,
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

import { validateDeleteEvent } from './event.delete.validator.js';

const router = Router();

// Middleware de autenticación para todas las rutas de eventos
router.use(validateJWT);

// Rutas generales
router.get('/', validateGetEvents, getEvents);
router.post('/', validateCreateEvent, createEvent);

// Rutas por ID de evento
router.get('/:id', validateGetEventById, getEventById);
router.put('/:id', validateUpdateEvent, checkRestaurantPermission('id'), updateEvent);
router.patch('/:id/cancel', validateCancelEvent, checkRestaurantPermission('id'), cancelEvent);
router.delete('/:id', validateDeleteEvent, checkRestaurantPermission('id'), deleteEvent);

// Gestión de imagen de portada
router.put(
    '/:id/cover',
    validateUpdateEvent,
    checkRestaurantPermission('id'),
    uploadFieldImage.single('cover'),
    uploadEventCover
);

// Inscripciones
router.post('/:id/register', validateRegisterToEvent, registerToEvent);
router.delete('/:id/register', validateUnregisterFromEvent, unregisterFromEvent);
router.get('/:id/registrations', validateGetEventRegistrations, getEventRegistrations);

export default router;
