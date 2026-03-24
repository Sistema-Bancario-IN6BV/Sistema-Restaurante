'use strict';

import Event from './event.model.js';
import EventRegistration from './EventRegistration.model.js';

/**
 * SR-190 / SR-192: Crear un nuevo evento gastronómico
 */
export const createEvent = async (req, res) => {
    try {
        const data = req.body;
        
        const event = new Event(data);
        await event.save();

        res.status(201).json({
            success: true,
            message: 'Evento creado exitosamente',
            event
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el evento',
            error: error.message
        });
    }
};

/**
 * SR-204 / SR-205 / SR-206: Inscribir a un usuario en un evento
 */
export const registerToEvent = async (req, res) => {
    try {
        const { id } = req.params; // ID del Evento
        const userId = req.user.id; // Extraído del validate-JWT

        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'El evento no existe'
            });
        }

        if (event.status !== 'ACTIVO') {
            return res.status(400).json({
                success: false,
                message: 'El evento ya no acepta inscripciones'
            });
        }

        // SR-205: Validar cupo máximo (Max Capacity)
        if (event.currentRegistrations >= event.maxCapacity) {
            return res.status(400).json({
                success: false,
                message: 'Lo sentimos, ya no hay cupos disponibles para este evento'
            });
        }

        // SR-206: Registrar inscripción (El índice único previene duplicados)
        const registration = new EventRegistration({
            event: id,
            user: userId
        });

        await registration.save();

        // Actualizar el contador de inscritos en el evento
        await Event.findByIdAndUpdate(id, { $inc: { currentRegistrations: 1 } });

        res.status(201).json({
            success: true,
            message: 'Inscripción confirmada correctamente'
        });

    } catch (error) {
        // Manejo de error por usuario ya inscrito (Duplicate Key Error de MongoDB)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Ya te encuentras inscrito en este evento'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al procesar la inscripción',
            error: error.message
        });
    }
};

/**
 * SR-207: Cancelar una inscripción con restricción de 24 horas
 */
export const cancelRegistration = async (req, res) => {
    try {
        const { id } = req.params; // ID del Evento
        const userId = req.user.id;

        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        // SR-207: Validar que falten más de 24 horas para el evento
        const currentTime = new Date();
        const eventTime = new Date(event.date);
        const timeDiff = eventTime - currentTime; // Diferencia en milisegundos
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        if (hoursDiff < 24) {
            return res.status(400).json({
                success: false,
                message: 'No puedes cancelar tu inscripción faltando menos de 24 horas para el evento'
            });
        }

        // Eliminar el registro de inscripción
        const registrationDeleted = await EventRegistration.findOneAndDelete({
            event: id,
            user: userId
        });

        if (!registrationDeleted) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró una inscripción activa para este usuario en este evento'
            });
        }

        // Decrementar el contador de inscritos
        await Event.findByIdAndUpdate(id, { $inc: { currentRegistrations: -1 } });

        res.status(200).json({
            success: true,
            message: 'Inscripción cancelada exitosamente'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cancelar la inscripción',
            error: error.message
        });
    }
};

/**
 * SR-208: Obtener lista de asistentes (Reporte para Admin)
 */
export const getAttendeesList = async (req, res) => {
    try {
        const { id } = req.params;

        const attendees = await EventRegistration.find({ event: id })
            .populate('user', 'name email profilePicture') // Traer datos específicos del usuario
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            total: attendees.length,
            attendees
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la lista de asistentes',
            error: error.message
        });
    }
};