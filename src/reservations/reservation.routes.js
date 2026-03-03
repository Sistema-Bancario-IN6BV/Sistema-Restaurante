import { Router } from 'express';
import {
	createReservation,
	getReservations,
	getReservationById,
	updateReservationStatus,
	changeReservationStatus
} from './reservation.controller.js';

import {
	validateCreateReservation,
	validateGetReservations,
	validateReservationId,
	validateReservationStatusChange
} from '../../middlewares/reservation-validators.js';

const router = Router();

/**
 * @openapi
 * /reservations/create:
 *   post:
 *     tags: [Reservations]
 *     summary: Crear reservación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, restaurant, table, reservationDate, startTime, endTime]
 *             properties:
 *               userId: { type: string }
 *               restaurant: { type: string }
 *               table: { type: string }
 *               reservationDate: { type: string, format: date-time }
 *               startTime: { type: string, format: date-time }
 *               endTime: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Reservación creada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Reservation'
 */

router.post(
	'/create',
	validateCreateReservation,
	createReservation
);

/**
 * @openapi
 * /reservations/get:
 *   get:
 *     tags: [Reservations]
 *     summary: Listar reservaciones
 *     responses:
 *       200:
 *         description: Listado de reservaciones
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
 *                         $ref: '#/components/schemas/Reservation'
 */

router.get(
	'/get',
	validateGetReservations,
	getReservations
);

/**
 * @openapi
 * /reservations/{id}:
 *   get:
 *     tags: [Reservations]
 *     summary: Obtener reservación por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservación encontrada
 */

router.get(
	'/:id',
	validateReservationId,
	getReservationById
);

/**
 * @openapi
 * /reservations/{id}/status:
 *   put:
 *     tags: [Reservations]
 *     summary: Actualizar estado de reservación
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estado actualizado
 */

router.put(
	'/:id/status',
	validateReservationStatusChange,
	updateReservationStatus
);

/**
 * @openapi
 * /reservations/{id}/activate:
 *   put:
 *     tags: [Reservations]
 *     summary: Activar reservación
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservación activada
 */

router.put(
	'/:id/activate',
	validateReservationId,
	changeReservationStatus
);

/**
 * @openapi
 * /reservations/{id}/deactivate:
 *   put:
 *     tags: [Reservations]
 *     summary: Desactivar reservación
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservación desactivada
 */

router.put(
	'/:id/deactivate',
	validateReservationId,
	changeReservationStatus
);

export default router;
