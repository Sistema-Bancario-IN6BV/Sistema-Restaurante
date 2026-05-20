'use strict';

import Reservation from './reservation.model.js';
import Table from '../tables/table.model.js';
import Restaurant from '../restaurants/restaurant.model.js';

export const createReservation = async (req, res) => {
    try {
        const restaurantId = req.body.restaurant || req.body.restaurantId;

        const tableId = req.body.table || req.body.tableId;

        let date = req.body.date;
        let time = req.body.time;

        if (req.body.reservationDate) {
            const dateObj = new Date(req.body.reservationDate);

            date = dateObj.toISOString().split('T')[0];

            time = req.body.time || dateObj.toTimeString().slice(0, 5);
        }

        const guests = req.body.guests || req.body.numberOfGuests;

        const notes = req.body.notes;

        if (!time || !/^\d{2}:\d{2}$/.test(time)) {
            return res.status(400).json({
                success: false,
                message: 'La hora debe estar en formato HH:MM'
            });
        }

        if (new Date(date) < new Date().setHours(0,0,0,0)) {
            return res.status(400).json({
                success: false,
                message: 'La fecha debe ser futura'
            });
        }

        const table = await Table.findOne({
            _id: tableId,
            restaurantId,
            active: true
        });

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada en este restaurante'
            });
        }

        if (guests > table.capacity) {
            return res.status(400).json({
                success: false,
                message: `La mesa tiene capacidad para ${table.capacity} personas`
            });
        }

        const [year, month, day] = date.split('-');

        const reservationDate = new Date(
            year,
            month - 1,
            day
        );

        const [hours, minutes] = time.split(':');

        reservationDate.setHours(
            parseInt(hours),
            parseInt(minutes),
            0,
            0
        );

        const sameDayStart = new Date(reservationDate);
        sameDayStart.setHours(0,0,0,0);

        const sameDayEnd = new Date(reservationDate);
        sameDayEnd.setHours(23,59,59,999);

        const reservations = await Reservation.find({
            tableId,
            date: {
                $gte: sameDayStart,
                $lte: sameDayEnd
            },
            status: {
                $in: ['PENDING', 'CONFIRMED']
            }
        });

        const newReservationMinutes = parseInt(hours) * 60 + parseInt(minutes);

        const conflictingReservation = reservations.find((r) => {
            const [existingHour, existingMinute] = r.time.split(':');

            const existingMinutes = parseInt(existingHour) * 60 + parseInt(existingMinute);

            return Math.abs(existingMinutes - newReservationMinutes) < 60;
            });

        if (conflictingReservation) {
            return res.status(409).json({
                success: false,
                message: `No disponible. Existe una reservación cerca de las ${conflictingReservation.time}`
            });
        }

        const reservation = await Reservation.create({
            userId: req.user.id || req.user._id,
            restaurantId,
            tableId,
            date: reservationDate,
            time,
            guests,
            notes,
            status: 'PENDING'
        });

        await Table.findByIdAndUpdate(
            tableId,
            { status: 'RESERVED' }
        );

        res.status(201).json({
            success: true,
            data: reservation
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const getMyReservations = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const filter = { userId: req.user.id };
        if (status) filter.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [reservations, total] = await Promise.all([
            Reservation.find(filter)
                .populate('restaurantId', 'name')
                .populate('tableId', 'number capacity')
                .sort({ date: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Reservation.countDocuments(filter),
        ]);

        res.json({ 
            success: true, 
            data: reservations, 
            pagination: { 
                total, 
                page: parseInt(page), 
                pages: Math.ceil(total / parseInt(limit)) 
            } 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};

export const getReservationsByRestaurant = async (req, res) => {
    try {
        const { status, date, page = 1, limit = 10 } = req.query;
        const filter = { restaurantId: req.params.id };
        if (status) filter.status = status;
        if (date) filter.date = new Date(date);

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [reservations, total] = await Promise.all([
            Reservation.find(filter)
                .populate('tableId', 'number capacity')
                .sort({ date: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Reservation.countDocuments(filter),
        ]);

        res.json({ 
            success: true, 
            data: reservations, 
            pagination: { 
                total, 
                page: parseInt(page), 
                pages: Math.ceil(total / parseInt(limit)) 
            } 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};

export const getReservationById = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id)
            .populate('restaurantId', 'name')
            .populate('tableId', 'number capacity');

        if (!reservation) 
            return res.status(404).json({ 
                success: false, 
                message: 'Reservación no encontrada' 
            });

        if (req.user.role !== 'PLATFORM_ADMIN' && req.user.role !== 'RESTAURANT_ADMIN' && reservation.userId !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: 'No tienes permisos' 
            });
        }

        res.json({ 
            success: true, 
            data: reservation 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};

export const updateReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada'
            });
        }

        const {tableId, date, time, guests, notes} = req.body;

        const [year, month, day] = date.split('-');

        const reservationDate = new Date(
            year,
            month - 1,
            day
        );

        const [hours, minutes] = time.split(':');

        reservationDate.setHours(
            parseInt(hours),
            parseInt(minutes),
            0,
            0
        );

        const table = await Table.findById(
            tableId || reservation.tableId
        );

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada'
            });
        }

        if (guests > table.capacity) {
            return res.status(400).json({
                success: false,
                message:
                    `La mesa tiene capacidad para ${table.capacity} personas`
            });
        }

        const sameDayStart = new Date(reservationDate);
        sameDayStart.setHours(0,0,0,0);

        const sameDayEnd = new Date(reservationDate);
        sameDayEnd.setHours(23,59,59,999);

        const reservations = await Reservation.find({
            tableId: tableId || reservation.tableId,
            date: {
                $gte: sameDayStart,
                $lte: sameDayEnd
            },
            status: {
                $in: ['PENDING', 'CONFIRMED']
            }
        });

        const newReservationMinutes = parseInt(hours) * 60 + parseInt(minutes);

        const conflictingReservation = reservations.find((r) => {
            if (
                r._id.toString() ===
                reservation._id.toString()
            ) {
                return false;
            }

            const [existingHour, existingMinute] = r.time.split(':');

            const existingMinutes = parseInt(existingHour) * 60 + parseInt(existingMinute);

            return Math.abs(
                existingMinutes - newReservationMinutes
            ) < 60;
        });

        if (conflictingReservation) {
            return res.status(409).json({
                success: false,
                message:
                    `No disponible. Existe una reservación cerca de las ${conflictingReservation.time}`
            });
        }

        if (
            tableId &&
            tableId !== reservation.tableId.toString()
        ) {

        await Table.findByIdAndUpdate(
            reservation.tableId,
            { status: 'AVAILABLE' }
        );

        await Table.findByIdAndUpdate(
            tableId,
            { status: 'RESERVED' }
        );

        reservation.tableId = tableId;
    }

        reservation.date = reservationDate;
        reservation.time = time;
        reservation.guests = guests;
        reservation.notes = notes;

        await reservation.save();

        const updatedReservation =
            await Reservation.findById(reservation._id)
                .populate('tableId')
                .populate('userId');

        res.json({
            success: true,
            data: updatedReservation
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const cancelReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada'
            });
        }

        if (reservation.status === 'COMPLETED') {
            return res.status(400).json({
                success: false,
                message: 'No se puede cancelar una reservación completada'
            });
        }

        const userId = req.user.id || req.user._id;

        if (
            req.user.role === 'CUSTOMER' &&
            reservation.userId != userId
        ) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos'
            });
        }

        if (reservation.status === 'CANCELLED') {
            return res.status(400).json({
                success: false,
                message: 'Ya está cancelada'
            });
        }

        if (reservation.status === 'CONFIRMED') {
            await Table.findByIdAndUpdate(
                reservation.tableId,
                { status: 'AVAILABLE' }
            );
        }

        reservation.status = 'CANCELLED';

        reservation.cancelReason = '';

        reservation.cancelledAt = new Date();

        await reservation.save();

        res.json({
            success: true,
            message: 'Reservación cancelada',
            data: reservation
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const confirmReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) 
        return res.status(404).json({ 
            success: false, 
            message: 'Reservación no encontrada' 
        });

        if (reservation.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden confirmar reservaciones pendientes'
            });
        }
            
        if (reservation.status !== 'PENDING') {
            return res.status(400).json({ 
                success: false, 
                message: 'Solo se pueden confirmar reservaciones pendientes' 
            });
        }

        reservation.status = 'CONFIRMED';
        reservation.confirmedAt = new Date();
        await reservation.save();

        await Table.findByIdAndUpdate(
            reservation.tableId, 
            { status: 'RESERVED' }
        );

        res.json({ 
            success: true, 
            message: 'Reservación confirmada', 
            data: reservation 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};

export const getReservationsForAdmin = async (req, res) => {
    try {

        if (req.user.role !== 'PLATFORM_ADMIN' && req.user.role !== 'RESTAURANT_ADMIN') {
            return res.status(403).json({ 
                success: false, 
                message: 'No tienes permisos' 
            });
        }

        const userId = req.user?.id || req.user?._id;

        if (!userId) 
        return res.status(401).json({
            message: 'Unauthorized' 
        });

        const restaurants = await Restaurant.find({ 
            adminId: userId 
        })
        .select('_id')
        .lean();

        const restaurantIds = restaurants.map(
            r => r._id
        );

        if (restaurantIds.length === 0) {
            return res.json({ 
                data: [] 
            });
        }

        const reservations = await Reservation.find({ 
            restaurantId: { $in: restaurantIds } 
        })
        .populate('tableId')
        .populate('userId', 'username email name surname')
        .sort({ date: -1 })
        .lean();

        const formattedReservations = reservations.map((reservation) => ({
            ...reservation,
            userName:
                reservation.userId?.username ||
                `${reservation.userId?.name || ''} ${reservation.userId?.surname || ''}`.trim() ||
                'Usuario',
            userEmail:
                reservation.userId?.email || 'Sin correo'
        }));

        return res.json({ 
            data: formattedReservations 
        });
    } catch (err) {
        console.error('getReservationsForAdmin error', err);

        return res.status(500).json({ 
            message: 'Internal server error' 
        });
    }
};

export const checkReservationAvailability = async (req, res) => {
    try {
        const {tableId, date, time, reservationId} = req.body;

        if (!tableId || !date || !time) {
            return res.status(400).json({
                success: false,
                message: 'Datos incompletos'
            });
        }

        const [year, month, day] = date.split('-');

        const reservationDate = new Date(
            year,
            month - 1,
            day
        );

        const [hours, minutes] = time.split(':');

        reservationDate.setHours(
            parseInt(hours),
            parseInt(minutes),
            0,
            0
        );

        const sameDayStart = new Date(reservationDate);
        sameDayStart.setHours(0,0,0,0);

        const sameDayEnd = new Date(reservationDate);
        sameDayEnd.setHours(23,59,59,999);

        const reservations = await Reservation.find({
            tableId,
            date: {
                $gte: sameDayStart,
                $lte: sameDayEnd
            },
            status: {
                $in: ['PENDING', 'CONFIRMED']
            }
        });

        const newReservationMinutes = parseInt(hours) * 60 + parseInt(minutes);

        const conflictingReservation =
            reservations.find((r) => {
                if (
                    reservationId &&
                    r._id.toString() === reservationId
                ) {
                    return false;
                }

                const [existingHour, existingMinute] =
                    r.time.split(':');

                const existingMinutes =
                    parseInt(existingHour) * 60 +
                    parseInt(existingMinute);

                return Math.abs(
                    existingMinutes - newReservationMinutes
                ) < 60;
            });

        if (conflictingReservation) {
            return res.status(409).json({
                success: false,
                message:
                    `Mesa ocupada cerca de las ${conflictingReservation.time}`
            });
        }

        res.json({
            success: true,
            available: true
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const completeReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada'
            });
        }

        if (reservation.status !== 'CONFIRMED') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden completar reservaciones confirmadas'
            });
        }

        reservation.status = 'COMPLETED';
        reservation.completedAt = new Date();
        await reservation.save();

        await Table.findByIdAndUpdate(
            reservation.tableId,
            { status: 'AVAILABLE' }
        );

        return res.json({
            success: true,
            message: 'Reservación completada',
            data: reservation
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
