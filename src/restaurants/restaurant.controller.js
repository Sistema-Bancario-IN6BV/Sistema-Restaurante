'use strict';
import Restaurant from './restaurant.model.js';
import Table from '../tables/table.model.js';
import {
    normalizeAdminIds, extractToken, validateAdminIds,
    findOrFail, buildFilter, buildSort
} from '../../helpers/restaurant.helper.js';
import { ok, fail } from '../../helpers/response.helper.js';

const handleError = (res, error, message, defaultStatus = 500) =>
    fail(res, message, error.statusCode ?? defaultStatus, error.message);


const normalizeTags = (tags) => {
    if (Array.isArray(tags)) return tags.map((tag) => String(tag).trim()).filter(Boolean);
    if (typeof tags !== 'string') return [];
    const raw = tags.trim();
    if (!raw) return [];
    if (raw.startsWith('[')) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed.map((tag) => String(tag).trim()).filter(Boolean);
        } catch {
            // fall back to comma split
        }
    }
    return raw.split(',').map((tag) => tag.trim()).filter(Boolean);
};

const normalizePhoto = (file) => file?.secure_url || file?.path || null;

export const createRestaurant = async (req, res) => {
    try {
        const data = normalizeAdminIds(req.body);
        data.tags = normalizeTags(data.tags);

        if (req.file) {
            data.photo = normalizePhoto(req.file);
        }

        await validateAdminIds(data.adminIds, extractToken(req));
        const record = await new Restaurant(data).save();
        ok(res, record, 'Restaurante creado exitosamente', 201);
    } catch (error) {
        handleError(res, error, 'Error al crear restaurante', 400);
    }
};

export const createRestaurantAdmin = async (req, res) => {
    try {
        const restaurantData = { ...req.body };

        if (req.file) {
            restaurantData.photo = req.file.path;
        }

        const restaurant = new Restaurant(restaurantData);
        await restaurant.save();

        return res.status(201).json({
            success: true,
            message: 'Restaurante creado exitosamente por admin',
            data: restaurant
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Error al crear el restaurante desde admin',
            error: error.message
        });
    }
};

export const getRestaurantsAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 10, name, category, city, isActive } = req.query;

        const filter = {};
        if (name) filter.name = { $regex: name, $options: 'i' };
        if (category) filter.category = { $regex: category, $options: 'i' };
        if (city) filter.address = { $regex: city, $options: 'i' };
        if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true';

        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);

        const restaurants = await Restaurant.find(filter)
            .sort({ createdAt: -1 })
            .skip((parsedPage - 1) * parsedLimit)
            .limit(parsedLimit);

        const total = await Restaurant.countDocuments(filter);

        return res.status(200).json({
            success: true,
            data: restaurants,
            pagination: {
                currentPage: parsedPage,
                totalPages: Math.ceil(total / parsedLimit),
                totalRecords: total,
                limit: parsedLimit
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al listar restaurantes desde admin',
            error: error.message
        });
    }
};

export const getRestaurantByIdAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurante no encontrado' });
        }

        return res.status(200).json({ success: true, data: restaurant });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener restaurante desde admin',
            error: error.message
        });
    }
};

export const updateRestaurantAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const currentRestaurant = await Restaurant.findById(id);

        if (!currentRestaurant) {
            return res.status(404).json({ success: false, message: 'Restaurante no encontrado' });
        }

        const updateData = { ...req.body };

        if (req.file) {
            if (currentRestaurant.photo_public_id) {
                await cloudinary.uploader.destroy(currentRestaurant.photo_public_id);
            }
            updateData.photo = req.file.path;
            updateData.photo_public_id = req.file.filename;
        }

        const restaurant = await Restaurant.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        return res.status(200).json({
            success: true,
            message: 'Restaurante actualizado exitosamente por admin',
            data: restaurant
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar restaurante desde admin',
            error: error.message
        });
    }
};

export const deactivateRestaurantAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurante no encontrado' });
        }

        if (!restaurant.isActive) {
            return res.status(200).json({
                success: true,
                message: 'El restaurante ya está inactivo',
                data: restaurant
            });
        }

        restaurant.isActive = false;
        await restaurant.save();

        return res.status(200).json({
            success: true,
            message: 'Restaurante desactivado exitosamente',
            data: restaurant
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al desactivar restaurante desde admin',
            error: error.message
        });
    }
};

export const getRestaurants = async (req, res) => {
    try {
        const {
            page = 1, limit = 10, isActive, name,
            category, city, averagePrice,
            minAveragePrice, maxAveragePrice
        } = req.query;

        const filter = {};

        if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true';
        if (name) filter.name = { $regex: name, $options: 'i' };
        if (category) filter.category = { $regex: category, $options: 'i' };
        if (city) filter.address = { $regex: city, $options: 'i' };

        if (averagePrice) {
            filter.averagePrice = Number(averagePrice);
        } else if (minAveragePrice || maxAveragePrice) {
            filter.averagePrice = {};
            if (minAveragePrice) filter.averagePrice.$gte = Number(minAveragePrice);
            if (maxAveragePrice) filter.averagePrice.$lte = Number(maxAveragePrice);
        }

        const parsedPage = Number(page) > 0 ? Number(page) : 1;
        const parsedLimit = Number(limit) > 0 ? Number(limit) : 10;

        const restaurants = await Restaurant.find(filter)
            .limit(parsedLimit)
            .skip((parsedPage - 1) * parsedLimit)
            .sort({ createdAt: -1 });

        const total = await Restaurant.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: restaurants,
            pagination: {
                currentPage: parsedPage,
                totalPages: Math.ceil(total / parsedLimit),
                totalRecords: total,
                limit: parsedLimit
            }
        });
    } catch (error) {
        handleError(res, error, 'Error al obtener restaurantes');
    }
};

const parsePagination = (body = {}) => {
    const page = Number(body.page) > 0 ? Number(body.page) : 1;
    const limit = Number(body.limit) > 0 ? Number(body.limit) : 10;
    return { page, limit };
};

const parsePaginationQuery = (query = {}) => {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    return { page, limit };
};

const sendSearchResponse = async (res, filter, page, limit) => {
    const restaurants = await Restaurant.find(filter)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    const total = await Restaurant.countDocuments(filter);

    return res.status(200).json({
        success: true,
        data: restaurants,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalRecords: total,
            limit
        }
    });
};

export const searchRestaurantsByName = async (req, res) => {
    try {
        const { name, isActive } = req.body;
        const { page, limit } = parsePagination(req.body);
        const filter = { name: { $regex: name, $options: 'i' } };
        if (typeof isActive !== 'undefined') filter.isActive = isActive;
        return await sendSearchResponse(res, filter, page, limit);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al buscar restaurantes por nombre', error: error.message });
    }
};

export const searchRestaurantsByCategory = async (req, res) => {
    try {
        const { category, isActive } = req.body;
        const { page, limit } = parsePagination(req.body);
        const filter = { category: { $regex: category, $options: 'i' } };
        if (typeof isActive !== 'undefined') filter.isActive = isActive;
        return await sendSearchResponse(res, filter, page, limit);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al buscar restaurantes por categoría', error: error.message });
    }
};

export const searchRestaurantsByCity = async (req, res) => {
    try {
        const { city, isActive } = req.body;
        const { page, limit } = parsePagination(req.body);
        const filter = { address: { $regex: city, $options: 'i' } };
        if (typeof isActive !== 'undefined') filter.isActive = isActive;
        return await sendSearchResponse(res, filter, page, limit);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al buscar restaurantes por ciudad', error: error.message });
    }
};

export const searchRestaurantsByAveragePrice = async (req, res) => {
    try {
        const { averagePrice, minAveragePrice, maxAveragePrice, isActive } = req.body;
        const { page, limit } = parsePagination(req.body);
        const filter = {};

        if (typeof averagePrice !== 'undefined') {
            filter.averagePrice = Number(averagePrice);
        } else {
            filter.averagePrice = {};
            if (typeof minAveragePrice !== 'undefined') filter.averagePrice.$gte = Number(minAveragePrice);
            if (typeof maxAveragePrice !== 'undefined') filter.averagePrice.$lte = Number(maxAveragePrice);
        }

        if (typeof isActive !== 'undefined') filter.isActive = isActive;
        return await sendSearchResponse(res, filter, page, limit);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al buscar restaurantes por precio promedio', error: error.message });
    }
};

export const searchClientRestaurantsByName = async (req, res) => {
    try {
        const { name } = req.query;
        const { page, limit } = parsePaginationQuery(req.query);
        const filter = { isActive: true, name: { $regex: name, $options: 'i' } };
        return await sendSearchResponse(res, filter, page, limit);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al buscar restaurantes por nombre para cliente', error: error.message });
    }
};

export const searchClientRestaurantsByCategory = async (req, res) => {
    try {
        const { category } = req.query;
        const { page, limit } = parsePaginationQuery(req.query);
        const filter = { isActive: true, category: { $regex: category, $options: 'i' } };
        return await sendSearchResponse(res, filter, page, limit);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al buscar restaurantes por categoría para cliente', error: error.message });
    }
};

export const searchClientRestaurantsByCity = async (req, res) => {
    try {
        const { city } = req.query;
        const { page, limit } = parsePaginationQuery(req.query);
        const filter = { isActive: true, address: { $regex: city, $options: 'i' } };
        return await sendSearchResponse(res, filter, page, limit);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al buscar restaurantes por ciudad para cliente', error: error.message });
    }
};

export const searchClientRestaurantsByAveragePrice = async (req, res) => {
    try {
        const { averagePrice, minAveragePrice, maxAveragePrice } = req.query;
        const { page, limit } = parsePaginationQuery(req.query);
        const filter = { isActive: true };

        if (typeof averagePrice !== 'undefined') {
            filter.averagePrice = Number(averagePrice);
        } else {
            filter.averagePrice = {};
            if (typeof minAveragePrice !== 'undefined') filter.averagePrice.$gte = Number(minAveragePrice);
            if (typeof maxAveragePrice !== 'undefined') filter.averagePrice.$lte = Number(maxAveragePrice);
        }

        return await sendSearchResponse(res, filter, page, limit);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al buscar restaurantes por precio promedio para cliente', error: error.message });
    }
};

export const getRestaurantById = async (req, res) => {
    try {
        const record = await findOrFail(req.params.id);
        ok(res, record);
    } catch (error) {
        handleError(res, error, 'Error al obtener restaurante');
    }
};

export const updateRestaurant = async (req, res) => {
    try {
        const data = normalizeAdminIds(req.body);
        data.tags = normalizeTags(data.tags);

        if (req.file) {
            data.photo = normalizePhoto(req.file);
        }

        const record = await Restaurant.findByIdAndUpdate(
            req.params.id, data, { new: true, runValidators: true }
        );
        if (!record) throw Object.assign(new Error('Restaurante no encontrado'), { statusCode: 404 });
        ok(res, record, 'Restaurante actualizado exitosamente');
    } catch (error) {
        handleError(res, error, 'Error al actualizar restaurante', 400);
    }
};

export const deleteRestaurant = async (req, res) => {
    try {
        const record = await Restaurant.findByIdAndUpdate(
            req.params.id, { active: false }, { new: true }
        );
        if (!record) throw Object.assign(new Error('Restaurante no encontrado'), { statusCode: 404 });
        ok(res, record, 'Restaurante eliminado exitosamente');
    } catch (error) {
        handleError(res, error, 'Error al eliminar restaurante');
    }
};

export const uploadCover = async (req, res) => {
    try {
        const data = normalizeAdminIds(req.body);
        data.tags = normalizeTags(data.tags);

        if (req.file) {
            data.photo = normalizePhoto(req.file);
        }

        const record = await Restaurant.findByIdAndUpdate(
            req.params.id,
            { photo: data.photo },
            { new: true }
        );
        if (!record) throw Object.assign(new Error('Restaurante no encontrado'), { statusCode: 404 });
        ok(res, record, 'Foto actualizada exitosamente');
    } catch (error) {
        handleError(res, error, 'Error al actualizar foto', 400);
    }
};

export const addPhoto = async (req, res) => {
    try {
        const record = await findOrFail(req.params.id);
        if (record.photos.length >= 8) throw Object.assign(new Error('Máximo 8 fotos permitidas'), { statusCode: 400 });
        record.photos.push({ url: req.file.secure_url, publicId: req.file.public_id });
        await record.save();
        ok(res, record, 'Foto agregada exitosamente', 201);
    } catch (error) {
        handleError(res, error, 'Error al agregar foto', 400);
    }
};

export const deletePhoto = async (req, res) => {
    try {
        const record = await Restaurant.findByIdAndUpdate(
            req.params.id,
            { $pull: { photos: { _id: req.params.photoId } } },
            { new: true }
        );
        if (!record) throw Object.assign(new Error('Restaurante no encontrado'), { statusCode: 404 });
        ok(res, record, 'Foto eliminada exitosamente');
    } catch (error) {
        handleError(res, error, 'Error al eliminar foto', 400);
    }
};

export const getTablesByRestaurant = async (req, res) => {
    try {
        const tables = await Table.find({
            restaurantId: req.params.restaurantId,
            active: true
        });
        res.status(200).send({ success: true, tables });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};