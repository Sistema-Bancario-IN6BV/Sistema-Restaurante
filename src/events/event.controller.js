import { parse } from 'dotenv';
import Event from './event.model.js'
import Restaurant from '../restaurant/restaurant.model.js';

export const createEvent = async (req, res) => {
    try {

        const eventData = req.body;

        // 🔥 Validar restaurante (llave foránea)
        const restaurantExists = await Restaurant.findById(eventData.restaurant);

        if (!restaurantExists) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no existe'
            });
        }

        if (req.file) {
            eventData.photo = req.file.path;
        }

        const event = new Event(eventData);
        await event.save();

        res.status(201).json({
            success: true,
            message: 'Evento creado exitosamente',
            data: event
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el evento',
            error: error.message
        });
    }
};

export const getEvents = async (req, res) => {
    try {

        const { page = 1, limit = 10, isActive = true } = req.query;

        const filter = { isActive };

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const events = await Event.find(filter)
            .populate('restaurant')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(options.sort);

        const total = await Event.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: events,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(total / limitNumber),
                totalRecords: total,
                limit: limitNumber
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los eventos',
            error: error.message
        });
    }
};

export const getEventById = async (req, res) => {
    try {

        const { id } = req.params;

        const event = await Event.findById(id)
            .populate('restaurant');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: event
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el evento',
            error: error.message
        });
    }
};

export const updateEvent = async (req, res) => {
    try {

        const { id } = req.params;

        const currentEvent = await Event.findById(id);
        if (!currentEvent) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        const updateData = { ...req.body };

        if (req.file) {
            if (currentEvent.photo_public_id) {
                await cloudinary.uploader.destroy(currentEvent.photo_public_id);
            }
            updateData.photo = req.file.path;
            updateData.photo_public_id = req.file.filename;
        }

        const updatedEvent = await Event.findByIdAndUpdate(id,updateData,{
                new: true,
                runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Evento actualizado exitosamente',
            data: updatedEvent
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar evento',
            error: error.message
        });
    }
};

export const changeEventStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activado' : 'desactivado';

        const event = await event.findByIdAndUpdate(
            id, 
            { isActive },
            { new: true}
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: `Evento no encontrado`,
            });
        }

        res.status(200).json({
            succes: true,
            message: `Restaurante ${action} exitosamente`,
            data: event
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado del evento',
            error: error.message,
        });
        
    }
}