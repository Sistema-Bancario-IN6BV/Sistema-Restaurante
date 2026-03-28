import Restaurant from '../src/restaurants/restaurant.model.js';
import { userExists } from '../services/auth-service.js';

export const normalizeAdminIds = (data) => {
    if (data.adminId && !data.adminIds?.length) data.adminIds = [data.adminId];
    return data;
};

export const extractToken = (req) =>
    req.header('Authorization')?.match(/^(?:Bearer )?(.*)$/i)?.[1];

export const validateAdminIds = async (adminIds = [], token) => {
    if (!adminIds.length || !token) return;
    for (const aId of adminIds) {
        if (!await userExists(aId, token)) {
            const err = new Error(`El administrador con ID ${aId} no existe en el sistema de autenticación`);
            err.statusCode = 400;
            throw err;
        }
    }
};

export const findOrFail = async (id) => {
    const record = await Restaurant.findById(id);
    if (!record) {
        const err = new Error('Restaurante no encontrado');
        err.statusCode = 404;
        throw err;
    }
    return record;
};

export const buildFilter = (query) => {
    const { active = true, city, category, minPrice, maxPrice, search } = query;
    const filter = { active: active === 'true' || active === true };

    if (city) filter['address.city'] = { $regex: city, $options: 'i' };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
        filter.avgPrice = {};
        if (minPrice) filter.avgPrice.$gte = parseFloat(minPrice);
        if (maxPrice) filter.avgPrice.$lte = parseFloat(maxPrice);
    }
    if (search) filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
    ];

    return filter;
};

export const buildSort = (sort) => ({
    rating:     { 'rating.average': -1 },
    price_asc:  { avgPrice: 1 },
    price_desc: { avgPrice: -1 },
}[sort] ?? { createdAt: -1 });