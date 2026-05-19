'use strict';

import Ingredient from './ingredient.model.js';

export const createIngredient = async (req, res) => {
    try {
        const ingredient = await Ingredient.create(req.body);
        res.status(201).json({ 
            success: true, 
            data: ingredient 
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ 
                success: false, 
                message: 'Ya existe un ingrediente con ese nombre en este restaurante' 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};

export const getIngredientsByRestaurant = async (req, res) => {
    try {
        const { lowStock } = req.query;
        const filter = { restaurantId: req.params.id, active: true };
        if (lowStock === 'true') filter.lowStockAlert = true;

        const ingredients = await Ingredient.find(filter).sort({ name: 1 });

        const alertCount = await Ingredient.countDocuments({ 
            restaurantId: req.params.id, 
            active: true, 
            lowStockAlert: true 
        });

        res.json({ 
            success: true, 
            data: ingredients, 
            alertCount 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};

export const getAlerts = async (req, res) => {
    try {
        const ingredients = await Ingredient.find({
            restaurantId: req.params.id, 
            active: true, 
            lowStockAlert: true
        }).sort({ currentStock: 1 });

        res.json({ 
            success: true, 
            data: ingredients 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};

export const getIngredientById = async (req, res) => {
    try {
        const ingredient = await Ingredient.findById(req.params.id);

        if (!ingredient) return res.status(404).json({ 
            success: false, 
            message: 'Ingrediente no encontrado' 
        });

        res.json({ 
            success: true, 
            data: ingredient 
        });
    } catch (err) {
        res.status(500).json({
            success: false, 
            message: err.message
        });
    }
};

export const updateIngredient = async (req, res) => {
    try {
        const ingredient = await Ingredient.findByIdAndUpdate(req.params.id, req.body, 
            { new: true, runValidators: true });

        if (!ingredient) {
            return res.status(404).json({ 
                success: false, message: 'Ingrediente no encontrado' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Ingrediente actualizado', 
            data: ingredient 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};

export const restockIngredient = async (req, res) => {
    try {
        const { quantity } = req.body;

        const ingredient = await Ingredient.findById(req.params.id);

        if (!ingredient) 
            return res.status(404).json({ 
                success: false, 
                message: 'Ingrediente no encontrado' 
            });

        ingredient.currentStock += quantity;
        ingredient.lastRestockedAt = new Date();

        await ingredient.save();

        res.json({ 
            success: true, 
            message: 'Stock actualizado', 
            data: ingredient 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};

export const deleteIngredient = async (req, res) => {
    try {
        const ingredient = await Ingredient.findByIdAndUpdate(req.params.id, 
            { active: false }, { new: true });

        if (!ingredient) 
            return res.status(404).json({ 
                success: false, 
                message: 'Ingrediente no encontrado' 
            });

        res.json({ 
            success: true, 
            message: 'Ingrediente eliminado' 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};
