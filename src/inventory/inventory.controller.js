'use strict';

import Ingredient from '../ingredients/ingredient.model.js';

export const createIngredient = async (req, res) => {
    try {
        const { restaurantId, name, price, unit, currentStock, minStock, supplier, expiryDate } = req.body;

        const ingredient = await Ingredient.create({
            restaurantId,
            name,
            costPerUnit: price,
            unit,
            currentStock: currentStock !== undefined ? currentStock : req.body.quantity,
            minStock,
            supplier,
            expiryDate,
        });

        res.status(201).json({ 
            success: true, 
            message: 'Ingrediente creado', 
            data: ingredient 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};

export const getInventory = async (req, res) => {
    try {
        const { page = 1, limit = 20, lowStock = false } = req.query;

        const filter = { restaurantId: req.params.restaurantId, active: true };

        if (lowStock === 'true') filter.lowStockAlert = true;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [ingredients, total] = await Promise.all([
            Ingredient.find(filter)
                .sort({ name: 1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Ingredient.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: ingredients,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            },
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

        if (!ingredient) return res.status(404).json({ success: false, message: 'Ingrediente no encontrado' });

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
        const { name, price, unit, minStock, supplier, expiryDate } = req.body;

        const ingredient = await Ingredient.findById(req.params.id);

        if (!ingredient) return res.status(404).json({ success: false, message: 'Ingrediente no encontrado' });

        if (name) ingredient.name = name;
        if (price) ingredient.price = price;
        if (unit) ingredient.unit = unit;
        if (minStock) ingredient.minStock = minStock;
        if (supplier) ingredient.supplier = supplier;
        if (expiryDate) ingredient.expiryDate = expiryDate;

        await ingredient.save();

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
        ingredient.lowStockAlert = ingredient.currentStock <= ingredient.minStock;
        ingredient.lastRestockedAt = new Date();

        await ingredient.save();

        res.json({
            success: true,
            message: `Ingrediente resurtido: ${quantity} ${ingredient.unit}`,
            data: ingredient,
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
        const ingredient = await Ingredient.findByIdAndUpdate(
            req.params.id,
            { active: false, deletedAt: new Date() },
            { new: true }
        );

        if (!ingredient) {
            return res.status(404).json({ 
                success: false, 
                message: 'Ingrediente no encontrado' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Ingrediente eliminado', 
            data: ingredient 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};

export const getLowStockAlerts = async (req, res) => {
    try {
        const alerts = await Ingredient.find({
            restaurantId: req.params.restaurantId,
            lowStockAlert: true,
            active: true,
        }).sort({ name: 1 });

        res.json({
            success: true,
            message: `${alerts.length} ingredientes con bajo stock`,
            data: alerts,
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};

