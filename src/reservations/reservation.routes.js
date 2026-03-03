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

router.post(
	'/create',
	validateCreateReservation,
	createReservation
);

router.get(
	'/get',
	validateGetReservations,
	getReservations
);

router.get(
	'/:id',
	validateReservationId,
	getReservationById
);

router.put(
	'/:id/status',
	validateReservationStatusChange,
	updateReservationStatus
);

router.put(
	'/:id/activate',
	validateReservationId,
	changeReservationStatus
);

router.put(
	'/:id/deactivate',
	validateReservationId,
	changeReservationStatus
);

export default router;
