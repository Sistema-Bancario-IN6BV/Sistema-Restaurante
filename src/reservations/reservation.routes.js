import { Router } from 'express';
import { createReservation, getMyReservations, getReservationsByRestaurant, getReservationById, 
		updateReservation, cancelReservation, confirmReservation, getReservationsForAdmin, checkReservationAvailability,
		completeReservation } from './reservation.controller.js';
import { validateCreateReservation, validateGetMyReservations, validateGetReservationsByRestaurant, 
		validateGetReservationById, validateUpdateReservation, validateCancelReservation,
		validateConfirmReservation } from '../../middlewares/reservation-validators.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';

const router = Router();

router.post('/create', validateJWT, validateCreateReservation, createReservation);
router.get('/my', validateJWT, validateGetMyReservations, getMyReservations);
router.get('/restaurant/:id', validateGetReservationsByRestaurant, getReservationsByRestaurant);
router.get('/admin', validateJWT, getReservationsForAdmin);
router.get('/:id', validateGetReservationById, getReservationById);
router.put('/:id', validateJWT, validateUpdateReservation, updateReservation);
router.patch('/:id/cancel', validateJWT, cancelReservation);
router.patch('/:id/confirm', validateJWT, validateConfirmReservation, confirmReservation);
router.post('/check-availability', checkReservationAvailability);
router.patch('/:id/complete', completeReservation);

export default router;
