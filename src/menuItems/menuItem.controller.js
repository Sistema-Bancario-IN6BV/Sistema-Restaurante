'use strict';

import MenuItem from './menuItem.model.js';
import Ingredient from '../ingredients/ingredient.model.js';
import { cloudinary } from '../../middlewares/file-uploader.js';

export const createMenuItem = async (req, res) => {
    try {
        const data = { ...req.body, restaurantId: req.params.id };

        if (typeof data.ingredients === 'string') {
            try {
                data.ingredients = JSON.parse(data.ingredients);
            } catch (e) {
            }
        }

        if (Array.isArray(data.ingredients) && data.ingredients.length > 0 && typeof data.ingredients[0] === 'object') {
            data.inventoryIngredients = data.ingredients;
            delete data.ingredients;
        }

        const item = await MenuItem.create(data);

        res.status(201).json({
            success: true,
            data: item
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const getMenuByRestaurant = async (req, res) => {
    try {
        const items = await MenuItem.find({
            restaurantId: req.params.id,
            active: true
        })
        .sort({
            type: 1,
            name: 1
        });

        const grouped = items.reduce((acc, item) => {
            if (!acc[item.type]) acc[item.type] = [];
            acc[item.type].push(item);
            return acc;
        }, {});

        res.json({
            success: true,
            data: grouped
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const getMenuItemById = async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.itemId)
            .populate('restaurantId', 'name');

        if (!item)
            return res.status(404).json({
                success: false,
                message: 'Plato no encontrado'
            });

        res.json({
            success: true,
            data: item
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const updateMenuItem = async (req, res) => {
    try {
        const data = { ...req.body };

        if (typeof data.ingredients === 'string') {
            try {
                data.ingredients = JSON.parse(data.ingredients);
            } catch (e) {
            }
        }

        if (Array.isArray(data.ingredients) && data.ingredients.length > 0 && typeof data.ingredients[0] === 'object') {
            data.inventoryIngredients = data.ingredients;
            delete data.ingredients;
        }

        const item = await MenuItem.findByIdAndUpdate(
            req.params.itemId,
            data,
            { new: true, runValidators: true }
        );

        if (!item)
            return res.status(404).json({
                success: false,
                message: 'Plato no encontrado'
            });

        res.json({
            success: true,
            message: 'Plato actualizado',
            data: item
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const toggleAvailability = async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.itemId);

        if (!item)
            return res.status(404).json({
                success: false,
                message: 'Plato no encontrado'
            });

        item.available = !item.available;
        await item.save();

        res.json({
            success: true,
            message: `Disponibilidad: ${item.available}`,
            data: item
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const deleteMenuItem = async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.itemId);
        if (!item)
            return res.status(404).json({
                success: false,
                message: 'Plato no encontrado'
            });

        if (item.image) {
            const parts = item.image.split('/');
            const publicId = parts.slice(-2).join('/').replace(/\.[^.]+$/, '');
            await cloudinary.uploader.destroy(publicId).catch(() => { });
        }

        item.active = false;
        await item.save();

        res.json({
            success: true,
            message: 'Plato eliminado'
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const uploadMenuItemPhoto = async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({
                success: false,
                message: 'No se proporcionó imagen'
            });

        const item = await MenuItem.findById(req.params.itemId);

        if (!item)
            return res.status(404).json({
                success: false,
                message: 'Plato no encontrado'
            });

        if (item.image) {
            const parts = item.image.split('/');
            const publicId = parts.slice(-2).join('/').replace(/\.[^.]+$/, '');
            await cloudinary.uploader.destroy(publicId).catch(() => { });
        }

        item.image = req.file.path || req.file.secure_url;
        await item.save();

        res.json({
            success: true,
            message: 'Foto actualizada',
            data: item
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const linkIngredients = async (req, res) => {
    try {
        let { ingredients } = req.body;

        if (typeof ingredients === 'string') {
            try {
                ingredients = JSON.parse(ingredients);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato de ingredientes inválido (debe ser JSON)'
                });
            }
        }

        const item = await MenuItem.findByIdAndUpdate(
            req.params.itemId,
            { inventoryIngredients: ingredients },
            { new: true, runValidators: true }
        );

        if (!item)
            return res.status(404).json({
                success: false,
                message: 'Plato no encontrado'
            });

        res.json({
            success: true,
            message: 'Ingredientes vinculados',
            data: item
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const discountInventory = async (orderItems) => {
    for (const orderItem of orderItems) {
        const menuItem = await MenuItem.findById(orderItem.menuItemId).lean();
        if (!menuItem || !menuItem.inventoryIngredients) continue;

        for (const inv of menuItem.inventoryIngredients) {
            const totalDiscount = inv.quantity * orderItem.quantity;
            const ingredient = await Ingredient.findById(inv.ingredientId);
            if (!ingredient) continue;

            ingredient.currentStock = Math.max(0, ingredient.currentStock - totalDiscount);
            ingredient.lowStockAlert = ingredient.currentStock < ingredient.minStock;
            await ingredient.save();
        }
    }
};