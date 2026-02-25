'use strict';

import MenuItem from './menuItem.model.js';
import Restaurant from '../restaurants/restaurant.model.js';

export const createMenuItem = async (req, res) => {
    try {
        const data = req.body;

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

        if (req.file) {
            data.photo = req.file.path;
        }

        const newMenuItem = new MenuItem(data);
        await newMenuItem.save();

        res.status(201).json({
            success: true,
            message: 'Platillo creado exitosamente',
            data: newMenuItem
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el platillo',
            error: error.message
        });
    }
};

export const getAllMenuItem = async (req, res) => {
    try {
        const { page = 1, limit = 10, restaurant } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const filter = {};

        if (restaurant) {
            filter.restaurant = restaurant;
        }

        const menuItems = await MenuItem.find(filter)
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber)
            .sort({ createdAt: -1 })
            .populate('restaurant', 'name');

        const total = await MenuItem.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Platillos obtenidos exitosamente',
            total,
            page: pageNumber,
            pages: Math.ceil(total / limitNumber),
            data: menuItems
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los platillos',
            error: error.message
        });
    }
};

export const getMenuItemById = async (req, res) => {
    try {
        const { id } = req.params;

        const menuItem = await MenuItem.findById(id)
            .populate('restaurant', 'name');

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Platillo no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Platillo encontrado',
            data: menuItem
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el platillo',
            error: error.message
        });
    }
};

export const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;

        const currentMenuItem = await MenuItem.findById(id);

        if (!currentMenuItem) {
            return res.status(404).json({
                success: false,
                message: 'Platillo no encontrado'
            });
        }

        const updateData = { ...req.body };

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

        if (req.file) {
            updateData.photo = req.file.path;
        }

        const updatedMenuItem = await MenuItem.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Platillo actualizado exitosamente',
            data: updatedMenuItem
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el platillo',
            error: error.message
        });
    }
};

export const changeMenuItemStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activado' : 'desactivado';

        const updatedMenuItem = await MenuItem.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!updatedMenuItem) {
            return res.status(404).json({
                success: false,
                message: 'Platillo no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: `Platillo ${action} exitosamente`,
            data: updatedMenuItem
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado del platillo',
            error: error.message
        });
    }
};
