'use strict';

import Event from './event.model.js';
import EventRegistration from './eventRegistration.model.js';
import Restaurant from '../restaurants/restaurant.model.js';
import { cloudinary } from '../../middlewares/file-uploader.js';
import { extractToken } from '../../helpers/restaurant.helper.js';

export const createEvent = async (req, res) => {
    try {
        if (new Date(req.body.date) < new Date()) {
            return res.status(400).json({ success: false, message: 'La fecha debe ser futura' });
        }
        
        // Obtener adminId del usuario autenticado
        const adminId = req.user?.id;
        
        // Si es admin de restaurante (no platform), asignar automáticamente su restaurante
        if (adminId && req.user?.role !== 'PLATFORM_ADMIN') {
            const myRestaurants = await Restaurant.find({ adminId, active: true }).select('_id');
            if (myRestaurants.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'No tienes restaurantes activos asignados' 
                });
            }
            // Si no specify un restaurante, usar el primero
            if (!req.body.restaurantId) {
                req.body.restaurantId = myRestaurants[0]._id;
            } else {
                // Verificar que el restaurante especificado le pertenezca
                const allowedIds = myRestaurants.map(r => r._id.toString());
                if (!allowedIds.includes(req.body.restaurantId.toString())) {
                    return res.status(403).json({ 
                        success: false, 
                        message: 'No tienes permisos para crear eventos en este restaurante' 
                    });
                }
            }
        }
        
        const event = await Event.create(req.body);
        res.status(201).json({ success: true, data: event });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getEvents = async (req, res) => {
    try {
        const { restaurantId, from, to, date, q, page = 1, limit = 12 } = req.query;
        
        // construir filtro base
        const filter = { active: true };

        // Si el usuario es RESTAURANT_ADMIN, limitar a sus restaurantes.
        // Evitar tratar a los CUSTOMERS como administradores (antes se usaba cualquier userId).
        if (req.user?.role === 'RESTAURANT_ADMIN') {
            const myRestaurants = await Restaurant.find({ adminId: req.user.id, active: true }).select('_id');
            const myRestaurantIds = myRestaurants.map(r => r._id);
            filter.restaurantId = { $in: myRestaurantIds };
        } else if (restaurantId) {
            filter.restaurantId = restaurantId;
        }

        // Los clientes solo deben ver eventos futuros (hoy en adelante) y no cancelados
        const isCustomer = req.user?.role === 'CUSTOMER';
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        if (isCustomer) {
            filter.date = { $gte: startOfToday };
            filter.status = { $ne: 'CANCELLED' };
        }

        // filtros adicionales: rango o fecha única
        if (from || to) {
            filter.date = {};
            if (from) filter.date.$gte = new Date(from);
            if (to) filter.date.$lte = new Date(to);
        } else if (date) {
            // filtrar por una fecha específica (día completo)
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            filter.date = { $gte: start, $lte: end };
        }

        // Reforzar el piso para clientes: nunca mostrar fechas anteriores a hoy,
        // aunque se pasen filtros from/to/date que apunten al pasado.
        if (isCustomer) {
            if (!filter.date) filter.date = {};
            if (!filter.date.$gte || filter.date.$gte < startOfToday) {
                filter.date.$gte = startOfToday;
            }
        }

        // búsqueda por texto en título/descripcion
        if (q) {
            const regex = new RegExp(q, 'i');
            filter.$or = [{ title: regex }, { description: regex }];
        }

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

export const getEventById = async (req, res) => {
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

        if (event.status === 'CANCELLED') {
            return res.status(400).json({ success: false, message: 'El evento fue cancelado' });
        }

        // Calcular el fin real del evento (día + hora de fin) y rechazar si ya pasó
        const eventEnd = new Date(event.date);
        const [h, m] = (event.endTime || '23:59').split(':').map(Number);
        eventEnd.setHours(h, m, 0, 0);
        if (eventEnd < new Date()) {
            return res.status(400).json({ success: false, message: 'El evento ya finalizó, no es posible inscribirse' });
        }

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

// Soft delete: marcar como no activo para que ya no aparezca en el frontend
export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Evento no encontrado' });
        }

        event.active = false;
        await event.save();

        return res.json({ success: true, message: 'Evento eliminado', data: event });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

