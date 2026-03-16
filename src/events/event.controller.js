'use strict';

import Event from './event.model.js';
import EventRegistration from './EventRegistration.model.js';

// Existing CRUD functions...
export const createEvent = async (req, res) => {
    try {
        const data = req.body;
        
        if (req.file) {
            data.photo = req.file.path;
        }

        data.createdBy = req.user.id; 

        const event = new Event(data);
        await event.save();

        return res.status(201).send({
            success: true,
            message: 'Evento creado exitosamente',
            data: event
        });
    } catch (err) {
        return res.status(500).send({ 
            success: false, 
            message: 'Error al crear el evento', 
            err: err.message 
        });
    }
};

export const getEvents = async (req, res) => {
    try {
        const { page = 1, limit = 10, restaurant, isActive } = req.query;
        const filter = {};

        if (restaurant) filter.restaurant = restaurant;
        if (isActive !== undefined) filter.status = isActive === 'true' ? 'ACTIVE' : 'CANCELLED';

        const events = await Event.find(filter)
            .populate('restaurant', 'name address')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ date: 1 });

        const total = await Event.countDocuments(filter);

        return res.send({
            success: true,
            total,
            data: events
        });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al obtener eventos' });
    }
};

export const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id).populate('restaurant');

        if (!event) return res.status(404).send({ message: 'Evento no encontrado' });

        return res.send({ success: true, data: event });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al buscar el evento' });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const event = await Event.findById(id);
        if (!event) return res.status(404).send({ message: 'Evento no encontrado' });

        if (new Date(event.date) < new Date() || event.status === 'FINISHED') {
            return res.status(400).send({ 
                message: 'No se puede editar un evento que ya ocurrió o ha finalizado' 
            });
        }

        if (req.file) {
            data.photo = req.file.path;
        }

        const updatedEvent = await Event.findByIdAndUpdate(id, data, { new: true });

        return res.send({
            success: true,
            message: 'Evento actualizado',
            data: updatedEvent
        });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al actualizar' });
    }
};

export const changeEventStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const isActivate = req.url.includes('activate');
        const newStatus = isActivate ? 'ACTIVE' : 'CANCELLED';

        const event = await Event.findById(id);
        if (!event) return res.status(404).send({ message: 'Evento no encontrado' });

        if (event.status === 'FINISHED') {
            return res.status(400).send({ message: 'Un evento finalizado no puede cambiar de estado' });
        }

        event.status = newStatus;
        await event.save();

        return res.send({
            success: true,
            message: `Evento ${isActivate ? 'activado' : 'desactivado'} correctamente`,
            data: event
        });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al cambiar el estado' });
    }
};

// NEW: Event Registration
export const registerEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ success: false, message: 'Evento no encontrado' });

        if (event.status !== 'ACTIVE') return res.status(400).json({ success: false, message: 'Evento no disponible' });

        if (event.currentParticipants >= event.maxCapacity) {
            return res.status(400).json({ success: false, message: 'Capacidad máxima alcanzada' });
        }

        // Check existing registration
        const existingReg = await EventRegistration.findOne({ userId, eventId: id, status: 'REGISTERED' });
        if (existingReg) {
            return res.status(400).json({ success: false, message: 'Ya estás inscrito en este evento' });
        }

        // Create registration + increment count
        const registration = new EventRegistration({ userId, eventId: id });
        await registration.save();

        event.currentParticipants += 1;
        await event.save();

        res.status(201).json({
            success: true,
            message: 'Inscripción exitosa',
            data: registration
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const unregisterEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ success: false, message: 'Evento no encontrado' });

        // 24h cancel rule
        const now = new Date();
        const eventDate = new Date(event.date);
        const hoursDiff = (eventDate - now) / (1000 * 60 * 60);
        if (hoursDiff < 24) {
            return res.status(400).json({ success: false, message: 'Cancelación solo hasta 24h antes del evento' });
        }

        // Find and cancel registration
        const registration = await EventRegistration.findOneAndUpdate(
            { userId, eventId: id, status: 'REGISTERED' },
            { status: 'CANCELLED' },
            { new: true }
        );

        if (!registration) {
            return res.status(404).json({ success: false, message: 'No tienes inscripción activa' });
        }

        // Decrement count
        event.currentParticipants -= 1;
        await event.save();

        res.json({
            success: true,
            message: 'Cancelación exitosa',
            data: registration
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
