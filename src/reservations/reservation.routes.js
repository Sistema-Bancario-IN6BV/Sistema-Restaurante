import { Router } from 'express';
import { createReservation, getMyReservations, getReservationsByRestaurant, getReservationById, 
		updateReservation, cancelReservation, confirmReservation, } from './reservation.controller.js';
import { validateCreateReservation, validateGetMyReservations, validateGetReservationsByRestaurant, 
		validateGetReservationById, validateUpdateReservation, validateCancelReservation,
		validateConfirmReservation } from '../../middlewares/reservation-validators.js';

const router = Router();

router.post('/create', validateCreateReservation, createReservation);
router.get('/my', validateGetMyReservations, getMyReservations);
router.get('/restaurant/:id', validateGetReservationsByRestaurant, getReservationsByRestaurant);
router.get('/:id', validateGetReservationById, getReservationById);
router.put('/:id', validateUpdateReservation, updateReservation);
router.patch('/:id/cancel', validateCancelReservation, cancelReservation);
router.patch('/:id/confirm', validateConfirmReservation, confirmReservation);

export default router;
