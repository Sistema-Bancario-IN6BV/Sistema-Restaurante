'use strict';

import Reservation from './reservation.model.js';
import Table from '../tables/table.model.js';

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

        if (new Date(date) < new Date().setHours(0, 0, 0, 0)) {
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

        if (!table) 
            return res.status(404).json({ 
                success: false, 
                message: 'Mesa no encontrada en este restaurante' 
            });

        if (guests > table.capacity) {
            return res.status(400).json({ 
                success: false, 
                message: `La mesa tiene capacidad para ${table.capacity} personas` 
            });
        }

        const [hours, minutes] = time.split(':');
        const dateTime = new Date(date);
        dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const oneHourBefore = new Date(dateTime.getTime() - 60 * 60 * 1000);
        const oneHourAfter = new Date(dateTime.getTime() + 60 * 60 * 1000);

        const conflictingReservation = await Reservation.findOne({
            tableId,
            date: {
                $gte: oneHourBefore,
                $lt: oneHourAfter,
            },
            status: { $in: ['PENDING', 'CONFIRMED'] },
        });

        if (conflictingReservation) {
            return res.status(409).json({ 
                success: false, 
                message: `No disponible. Hay una reservación conflictiva. Hora reservada: ${conflictingReservation.time}. Intenta con una diferencia de al menos 1 hora.` 
            });
        }

        const reservation = await Reservation.create({
            userId: req.user.id, 
            restaurantId, 
            tableId, 
            date: dateTime, 
            time, 
            guests, 
            notes,
        });
    
        res.status(201).json({ 
            success: true, 
            data: reservation 
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ success: false, 
            message: 'Ya existe una reservación activa para esa mesa en esa fecha y hora' 
            });
        }
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
        if (!reservation) 
            return res.status(404).json({ 
                success: false, 
                message: 'Reservación no encontrada' 
            });

        if (reservation.status !== 'PENDING') {
            return res.status(400).json({ 
                success: false, 
                message: 'Solo se pueden modificar reservaciones pendientes' 
            });
        }

    const { date, time, guests, notes } = req.body;

    if (date || time) {
        const newDate = date || reservation.date;
        const newTime = time || reservation.time;
        
        const dateObj = typeof newDate === 'string' ? new Date(newDate) : newDate;
        const [hours, minutes] = newTime.split(':');
        const newDateTime = new Date(dateObj);
        newDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const oneHourBefore = new Date(newDateTime.getTime() - 60 * 60 * 1000);
        const oneHourAfter = new Date(newDateTime.getTime() + 60 * 60 * 1000);

        const conflictingReservation = await Reservation.findOne({
            _id: { $ne: reservation._id },
            tableId: reservation.tableId,
            date: {
                $gte: oneHourBefore,
                $lt: oneHourAfter,
            },
            status: { $in: ['PENDING', 'CONFIRMED'] },
        });

        if (conflictingReservation) {
            return res.status(409).json({ 
                success: false, 
                message: `No disponible. Hay una reservación conflictiva. Hora reservada: ${conflictingReservation.time}. Intenta con una diferencia de al menos 1 hora.` 
            });
        }
        if (date) reservation.date = newDateTime;
        if (time) reservation.time = time;
    }
    
        if (guests) reservation.guests = guests;
        if (notes !== undefined) reservation.notes = notes;
        await reservation.save();

        res.json({ 
            success: true, 
            message: 'Reservación actualizada', 
            data: reservation 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};

export const cancelReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) return res.status(404).json({ 
            success: false, 
            message: 'Reservación no encontrada' 
        });

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
        reservation.cancelReason = req.body.reason || '';
        reservation.cancelledAt = new Date();
        await reservation.save();

        res.json({ 
            success: true, 
            message: 'Reservación cancelada', 
            data: reservation 
        });
    } catch (err) {
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