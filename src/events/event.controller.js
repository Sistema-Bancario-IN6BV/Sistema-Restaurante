'use strict';

import Event from './event.model.js';
import EventRegistration from './eventRegistration.model.js';
import { cloudinary } from '../../middlewares/file-uploader.js';

/**
 * SR-190 / SR-192: Crear un nuevo evento gastronómico
 */
export const createEvent = async (req, res) => {
    try {
        if (new Date(req.body.date) < new Date()) {
            return res.status(400).json({ success: false, message: 'La fecha debe ser futura' });
        }
        const event = await Event.create(req.body);
        res.status(201).json({ success: true, data: event });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * SR-204 / SR-205 / SR-206: Inscribir a un usuario en un evento
 */
export const registerToEvent = async (req, res) => {
    try {
        const { restaurantId, from, to, page = 1, limit = 12 } = req.query;
        const filter = { active: true, status: { $ne: 'CANCELLED' }, date: { $gte: new Date() } };
        if (restaurantId) filter.restaurantId = restaurantId;
        if (from) filter.date.$gte = new Date(from);
        if (to) filter.date.$lte = new Date(to);

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [events, total] = await Promise.all([
            Event.find(filter).populate('restaurantId', 'name').sort({ date: 1 }).skip(skip).limit(parseInt(limit)),
            Event.countDocuments(filter),
        ]);

        res.json({ success: true, data: events, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * SR-207: Cancelar una inscripción con restricción de 24 horas
 */
export const cancelRegistration = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('restaurantId', 'name');
        if (!event) return res.status(404).json({ success: false, message: 'Evento no encontrado' });
        res.json({ success: true, data: event });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Evento no encontrado' });
        if (event.status === 'CANCELLED') {
            return res.status(400).json({ success: false, message: 'No se puede editar un evento cancelado' });
        }
        Object.assign(event, req.body);
        await event.save();
        res.json({ success: true, message: 'Evento actualizado', data: event });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const cancelEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Evento no encontrado' });
        event.status = 'CANCELLED';
        event.cancelReason = req.body.reason || '';
        await event.save();
        res.json({ success: true, message: 'Evento cancelado', data: event });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const uploadEventCover = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No se proporcionó imagen' });
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Evento no encontrado' });

        if (event.coverPublicId) {
            await cloudinary.uploader.destroy(event.coverPublicId).catch(() => { });
        } else if (event.coverImage) {
            const parts = event.coverImage.split('/');
            const publicId = parts.slice(-2).join('/').replace(/\.[^.]+$/, '');
            await cloudinary.uploader.destroy(publicId).catch(() => { });
        }

        event.coverImage = req.file.path || req.file.secure_url;
        event.coverPublicId = req.file.filename;
        await event.save();
        res.json({ success: true, message: 'Imagen actualizada', data: event });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const registerToEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Evento no encontrado' });
        if (event.isFull) {
            return res.status(400).json({ success: false, message: 'El evento está lleno' });
        }

        const registration = await EventRegistration.create({
            eventId: event._id,
            userId: req.user.id,
        });

        await Event.findByIdAndUpdate(event._id, { $inc: { registeredCount: 1 } });

        res.status(201).json({ success: true, message: 'Inscripción exitosa', data: registration });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ success: false, message: 'Ya estás inscrito en este evento' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

export const unregisterFromEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Evento no encontrado' });

        // Validar que falten más de 24h
        const hoursUntil = (new Date(event.date) - new Date()) / (1000 * 60 * 60);
        if (hoursUntil < 24) {
            return res.status(400).json({ success: false, message: 'No se puede cancelar inscripción con menos de 24h de anticipación' });
        }

        const registration = await EventRegistration.findOneAndUpdate(
            { eventId: req.params.id, userId: req.user.id, status: 'REGISTERED' },
            { status: 'CANCELLED' },
            { new: true }
        );
        if (!registration) {
            return res.status(404).json({ success: false, message: 'No tienes inscripción activa' });
        }

        await Event.findByIdAndUpdate(event._id, { $inc: { registeredCount: -1 } });

        res.json({ success: true, message: 'Inscripción cancelada' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getEventRegistrations = async (req, res) => {
    try {
        const registrations = await EventRegistration.find({ eventId: req.params.id });
        res.json({ success: true, data: registrations });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
