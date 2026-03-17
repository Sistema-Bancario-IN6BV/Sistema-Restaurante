'use strict';

import MenuItem from './menuItem.model.js';
import Restaurant from '../restaurants/restaurant.model.js';

const MENU_ITEM_TYPES = ['ENTRADA', 'PLATO_FUERTE', 'POSTRE', 'BEBIDA'];

export const createMenuItemForRestaurantAdmin = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { name, description, price, type } = req.body;

        const restaurantExists = await Restaurant.findOne({
            _id: restaurantId,
            isActive: true
        });

        if (!restaurantExists) {
            return res.status(404).json({
                success: false,
                message: 'El restaurante no existe o está inactivo'
            });
        }

        const menuItemData = {
            restaurant: restaurantId,
            name,
            description,
            price,
            type
        };

        if (req.file) {
            menuItemData.photo = req.file.path;
        }

        const menuItem = new MenuItem(menuItemData);
        await menuItem.save();

        return res.status(201).json({
            success: true,
            message: 'Platillo creado exitosamente en el menú del restaurante',
            data: menuItem
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Error al crear el platillo del restaurante',
            error: error.message
        });
    }
};

export const updateMenuItemForRestaurantAdmin = async (req, res) => {
    try {
        const { restaurantId, id } = req.params;

        const restaurantExists = await Restaurant.findOne({
            _id: restaurantId,
            isActive: true
        });

        if (!restaurantExists) {
            return res.status(404).json({
                success: false,
                message: 'El restaurante no existe o está inactivo'
            });
        }

        const menuItem = await MenuItem.findOne({ _id: id, restaurant: restaurantId });

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Platillo no encontrado en el menú de este restaurante'
            });
        }

        const updateData = {};
        const allowedFields = ['name', 'description', 'price', 'type'];

        allowedFields.forEach((field) => {
            if (typeof req.body[field] !== 'undefined') {
                updateData[field] = req.body[field];
            }
        });

        if (typeof updateData.type !== 'undefined' && !MENU_ITEM_TYPES.includes(updateData.type)) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de platillo no válido'
            });
        }

        if (req.file) {
            updateData.photo = req.file.path;
        }

        const updatedMenuItem = await MenuItem.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        return res.status(200).json({
            success: true,
            message: 'Platillo actualizado exitosamente en el menú del restaurante',
            data: updatedMenuItem
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar el platillo del restaurante',
            error: error.message
        });
    }
};

export const deleteMenuItemForRestaurantAdmin = async (req, res) => {
    try {
        const { restaurantId, id } = req.params;

        const menuItem = await MenuItem.findOne({ _id: id, restaurant: restaurantId });

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Platillo no encontrado en el menú de este restaurante'
            });
        }

        if (!menuItem.isActive) {
            return res.status(200).json({
                success: true,
                message: 'El platillo ya está inactivo',
                data: menuItem
            });
        }

        menuItem.isActive = false;
        await menuItem.save();

        return res.status(200).json({
            success: true,
            message: 'Platillo desactivado exitosamente del menú del restaurante',
            data: menuItem
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar lógicamente el platillo',
            error: error.message
        });
    }
};

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

        const filter = {isActive: true};

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
