"use strict";
import Restaurant from './restaurant.model.js';
import {
    normalizeAdminIds, extractToken, validateAdminIds,
    findOrFail, buildFilter, buildSort
} from '../../helpers/restaurant.helper.js';
const handleError = (res, error, message, defaultStatus = 500) =>
    fail(res, message, error.statusCode ?? defaultStatus, error.message);

export const createRestaurant = async (req, res) => {
    try {
        const data = normalizeAdminIds(req.body);

        if (req.file) {
            data.photo = req.file.path;
        }

        await validateAdminIds(data.adminIds, extractToken(req));

        const record = await new Restaurant(data).save();
        ok(res, record, 'Restaurante creado exitosamente', 201);
    } catch (error) {
        handleError(res, error, 'Error al crear restaurante', 400);
    }
};

export const getRestaurants = async (req, res) => {
    try {
        const { page = 1, limit = 12, sort } = req.query;
        const filter = buildFilter(req.query);
        const sortOption = buildSort(sort);

        const [records, total] = await Promise.all([
            Restaurant.find(filter).limit(limit * 1).skip((page - 1) * limit).sort(sortOption),
            Restaurant.countDocuments(filter)
        ]);

        ok(res, records, null, 200);
    } catch (error) {
        handleError(res, error, 'Error al obtener restaurantes');
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
        const record = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!record) throw Object.assign(new Error('Restaurante no encontrado'), { statusCode: 404 });
        ok(res, record, 'Restaurante actualizado exitosamente');
    } catch (error) {
        handleError(res, error, 'Error al actualizar restaurante', 400);
    }
};

export const deleteRestaurant = async (req, res) => {
    try {
        const record = await Restaurant.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
        if (!record) throw Object.assign(new Error('Restaurante no encontrado'), { statusCode: 404 });
        ok(res, record, 'Restaurante eliminado exitosamente');
    } catch (error) {
        handleError(res, error, 'Error al eliminar restaurante');
    }
};

export const uploadCover = async (req, res) => {
    try {
        const data = req.body;

        if (req.file) {
            data.photo = req.file.path;
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
