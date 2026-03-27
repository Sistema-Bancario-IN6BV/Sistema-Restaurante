import { Router } from 'express';
import { changeEventStatus, createEvent, getEventById, getEvents, updateEvent } from './event.controller.js';
import { uploadFieldImage } from '../../middlewares/file-uploader.js';
import { cleanUploaderFileOnFinish } from '../../middlewares/delete-file-on-error.js';
import { validateCreateField, validateFieldStatusChange, validateGetFieldById, validateUpdateFieldRequest, validateGetEvents } from '../../middlewares/event-validators.js';

const router = Router();

/**
 * @openapi
 * /events/create:
 *   post:
 *     tags: [Events]
 *     summary: Crear evento
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [restaurant, title, eventDate]
 *             properties:
 *               restaurant: { type: string }
 *               title: { type: string }
 *               description: { type: string }
 *               eventDate: { type: string, format: date-time }
 *               image: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Evento creado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Event'
 */

router.post(
    '/create',
    uploadFieldImage.single('image'),
    cleanUploaderFileOnFinish,
    validateCreateField,
    createEvent
)

/**
 * @openapi
 * /events/get:
 *   get:
 *     tags: [Events]
 *     summary: Listar eventos
 *     responses:
 *       200:
 *         description: Listado de eventos
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 */

router.get(
    '/get',
    validateGetEvents,
    getEvents
)

/**
 * @openapi
 * /events/{id}:
 *   get:
 *     tags: [Events]
 *     summary: Obtener evento por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evento encontrado
 */

router.get(
    '/:id',
    validateGetFieldById,
    getEventById
)

/**
 * @openapi
 * /events/{id}:
 *   put:
 *     tags: [Events]
 *     summary: Actualizar evento
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evento actualizado
 */

router.put(
    '/:id',
    uploadFieldImage.single('image'),
    cleanUploaderFileOnFinish,
    validateUpdateFieldRequest,
    updateEvent
);

/**
 * @openapi
 * /events/{id}/activate:
 *   put:
 *     tags: [Events]
 *     summary: Activar evento
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evento activado
 */

router.put(
    '/:id/activate',
    validateFieldStatusChange,
    changeEventStatus
)

/**
 * @openapi
 * /events/{id}/desactivate:
 *   put:
 *     tags: [Events]
 *     summary: Desactivar evento
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evento desactivado
 */

router.put(
    '/:id/desactivate',
    validateFieldStatusChange,
    changeEventStatus
)

export default router;