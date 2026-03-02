import Reservation from './reservation.model.js';
import Table from '../tables/table.model.js';


// Crear reservación
export const createReservation = async (req, res) => {
    try {
        const data = req.body;

        const userId = req.user.id;

        const reservation = await Reservation.create({
            ...data,
            userId
        });

        return res.status(201).json({
            success: true,
            message: 'Reservación creada',
            reservation
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al crear reservación',
            error: err.message
        });
    }
};

// Obtener reservaciones
export const getReservations = async (req, res) => {
    try {

        const { page = 1, limit = 10, isActive = true } = req.query;

        const filter = { isActive };

        const reservations = await Reservation.find(filter)
            .populate('restaurant')
            .populate('table')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ reservationDate: 1 });

        const total = await Reservation.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: reservations,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener reservaciones',
            error: error.message
        });
    }
};


// Obtener reservación por ID
export const getReservationById = async (req, res) => {
    try {

        const { id } = req.params;

        const reservation = await Reservation.findById(id)
            .populate('restaurant')
            .populate('table');

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: reservation
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener reservación',
            error: error.message
        });
    }
};


// Actualizar estado de reservación
export const updateReservationStatus = async (req, res) => {
    try {

        const { id } = req.params;
        const { status } = req.body;

        const reservation = await Reservation.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Estado actualizado correctamente',
            data: reservation
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar estado',
            error: error.message
        });
    }
};


// Activar / Desactivar reservación
export const changeReservationStatus = async (req, res) => {
    try {

        const { id } = req.params;

        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activada' : 'desactivada';

        const reservation = await Reservation.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: `Reservación ${action} exitosamente`,
            data: reservation
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar estado',
            error: error.message
        });
    }
};