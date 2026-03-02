'use strict';

import Table from './table.model.js';
import Restaurant from '../restaurants/restaurant.model.js';

// Crear mesa
export const createTable = async (req, res) => {
    try {
        const data = req.body;

        // Validar restaurante activo
        const restaurantExists = await Restaurant.findOne({
            _id: data.restaurant,
            isActive: true
        });

        if (!restaurantExists) {
            return res.status(400).json({
                success: false,
                message: 'El restaurante no existe o está inactivo'
            });
        }

        const newTable = new Table(data);
        await newTable.save();

        res.status(201).json({
            success: true,
            message: 'Mesa creada exitosamente',
            data: newTable
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear la mesa',
            error: error.message
        });
    }
};

// Obtener todas las mesas
export const getTables = async (req, res) => {
    try {
        const { page = 1, limit = 10, restaurant } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const filter = { isActive: true };

        if (restaurant) {
            filter.restaurant = restaurant;
        }

        const tables = await Table.find(filter)
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber)
            .sort({ createdAt: -1 })
            .populate('restaurant', 'name');

        const total = await Table.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Mesas obtenidas exitosamente',
            total,
            page: pageNumber,
            pages: Math.ceil(total / limitNumber),
            data: tables
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las mesas',
            error: error.message
        });
    }
};

// Obtener mesa por ID
export const getTableById = async (req, res) => {
    try {
        const { id } = req.params;

        const table = await Table.findById(id)
            .populate('restaurant', 'name');

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Mesa encontrada',
            data: table
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la mesa',
            error: error.message
        });
    }
};

// Actualizar mesa
export const updateTable = async (req, res) => {
    try {
        const { id } = req.params;

        const currentTable = await Table.findById(id);

        if (!currentTable) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada'
            });
        }

        const updateData = { ...req.body };

        // Validar restaurante si se cambia
        if (updateData.restaurant) {
            const restaurantExists = await Restaurant.findOne({
                _id: updateData.restaurant,
                isActive: true
            });

            if (!restaurantExists) {
                return res.status(400).json({
                    success: false,
                    message: 'El restaurante no existe o está inactivo'
                });
            }
        }

        const updatedTable = await Table.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Mesa actualizada exitosamente',
            data: updatedTable
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la mesa',
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

        const updatedTable = await Table.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!updatedTable) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: `Mesa ${action} exitosamente`,
            data: updatedTable
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado de la mesa',
            error: error.message
        });
    }
};