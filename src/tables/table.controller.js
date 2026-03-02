import Table from './table.model.js';
import Reservation from '../reservations/reservation.model.js';


// Crear mesa
export const createTable = async (req, res) => {
    try {

        const { restaurant, tableNumber, capacity, location } = req.body;

        const table = new Table({
            restaurant,
            tableNumber,
            capacity,
            location
        });

        await table.save();

        res.status(201).json({
            success: true,
            message: 'Mesa creada exitosamente',
            data: table
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear mesa',
            error: error.message
        });
    }
};


// Obtener mesas
export const getTables = async (req, res) => {
    try {

        const { page = 1, limit = 10, isActive = true } = req.query;

        const filter = { isActive };

        const tables = await Table.find(filter)
            .populate('restaurant')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Table.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: tables,
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
            message: 'Error al obtener mesas',
            error: error.message
        });
    }
};


// Obtener mesa por ID
export const getTableById = async (req, res) => {
    try {

        const { id } = req.params;

        const table = await Table.findById(id)
            .populate('restaurant');

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: table
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener mesa',
            error: error.message
        });
    }
};


// Actualizar mesa
export const updateTable = async (req, res) => {
    try {

        const { id } = req.params;
        const data = req.body;

        const table = await Table.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        );

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Mesa actualizada correctamente',
            data: table
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar mesa',
            error: error.message
        });
    }
};


// Activar / Desactivar mesa
export const changeTableStatus = async (req, res) => {
    try {

        const { id } = req.params;

        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activada' : 'desactivada';

        const table = await Table.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: `Mesa ${action} exitosamente`,
            data: table
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar estado',
            error: error.message
        });
    }
};