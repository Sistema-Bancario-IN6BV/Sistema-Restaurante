import Restaurant from './restaurant.model.js';
import { cloudinary } from '../../middlewares/file-uploader.js'

export const createRestaurant = async (req, res) => {
    try {

        const restaurantData = req.body;

        if (req.file) {
            restaurantData.photo = req.file.path;
        }

        const restaurant = new Restaurant(restaurantData);
        await restaurant.save();

        res.status(201).json({
            success: true,
            message: 'Restaurante creado exitosamente',
            data: restaurant
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el restaurante',
            error: error.message
        })
    }
}

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
        const {
            page = 1,
            limit = 10,
            name,
            category,
            city,
            isActive
        } = req.query;

        const filter = {};

        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }

        if (category) {
            filter.category = { $regex: category, $options: 'i' };
        }

        if (city) {
            filter.address = { $regex: city, $options: 'i' };
        }

        if (typeof isActive !== 'undefined') {
            filter.isActive = isActive === 'true';
        }

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
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            data: restaurant
        });
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
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
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
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
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
            page = 1,
            limit = 10,
            isActive,
            name,
            category,
            city,
            averagePrice,
            minAveragePrice,
            maxAveragePrice
        } = req.query;

        const filter = {};

        if (typeof isActive !== 'undefined') {
            filter.isActive = isActive === 'true';
        }

        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }

        if (category) {
            filter.category = { $regex: category, $options: 'i' };
        }

        if (city) {
            // Actualmente la ciudad forma parte de la dirección.
            filter.address = { $regex: city, $options: 'i' };
        }

        if (averagePrice) {
            filter.averagePrice = Number(averagePrice);
        } else if (minAveragePrice || maxAveragePrice) {
            filter.averagePrice = {};

            if (minAveragePrice) {
                filter.averagePrice.$gte = Number(minAveragePrice);
            }

            if (maxAveragePrice) {
                filter.averagePrice.$lte = Number(maxAveragePrice);
            }
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const restaurants = await Restaurant.find(filter)
            .limit(options.limit)
            .skip((options.page - 1) * options.limit)
            .sort(options.sort);

        const total = await Restaurant.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: restaurants,
            pagination: {
                currentPage: options.page,
                totalPages: Math.ceil(total / options.limit),
                totalRecords: total,
                limit: options.limit
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los restaurantes',
            error: error.message
        })
    }

}

const parsePagination = (body = {}) => {
    const page = Number(body.page) > 0 ? Number(body.page) : 1;
    const limit = Number(body.limit) > 0 ? Number(body.limit) : 10;

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

        const filter = {
            name: { $regex: name, $options: 'i' }
        };

        if (typeof isActive !== 'undefined') {
            filter.isActive = isActive;
        }

        return await sendSearchResponse(res, filter, page, limit);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al buscar restaurantes por nombre',
            error: error.message
        });
    }
};

export const searchRestaurantsByCategory = async (req, res) => {
    try {
        const { category, isActive } = req.body;
        const { page, limit } = parsePagination(req.body);

        const filter = {
            category: { $regex: category, $options: 'i' }
        };

        if (typeof isActive !== 'undefined') {
            filter.isActive = isActive;
        }

        return await sendSearchResponse(res, filter, page, limit);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al buscar restaurantes por categoría',
            error: error.message
        });
    }
};

export const searchRestaurantsByCity = async (req, res) => {
    try {
        const { city, isActive } = req.body;
        const { page, limit } = parsePagination(req.body);

        const filter = {
            // Actualmente la ciudad forma parte de la dirección.
            address: { $regex: city, $options: 'i' }
        };

        if (typeof isActive !== 'undefined') {
            filter.isActive = isActive;
        }

        return await sendSearchResponse(res, filter, page, limit);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al buscar restaurantes por ciudad',
            error: error.message
        });
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

            if (typeof minAveragePrice !== 'undefined') {
                filter.averagePrice.$gte = Number(minAveragePrice);
            }

            if (typeof maxAveragePrice !== 'undefined') {
                filter.averagePrice.$lte = Number(maxAveragePrice);
            }
        }

        if (typeof isActive !== 'undefined') {
            filter.isActive = isActive;
        }

        return await sendSearchResponse(res, filter, page, limit);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al buscar restaurantes por precio promedio',
            error: error.message
        });
    }
};

export const getRestaurantById = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado',
            });
        }

        res.status(200).json({
            success: true,
            data: restaurant,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el restaurante',
            error: error.message,
        });
    }
};

export const updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        const currentRestaurant = await Restaurant.findById(id);
        if (!currentRestaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurante no encontrado",
            });
        }

        const updateData = { ...req.body };

        if (req.file) {
            if (currentRestaurant.photo_public_id) {
                await cloudinary.uploader.destroy(currentRestaurant.photo_public_id);
            }

            updateData.photo = req.file.path;
            updateData.photo_public_id = req.file.filename;
        }

        const updatedRestaurant = await Restaurant.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: "Restaurante actualizado exitosamente",
            data: updatedRestaurant,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar restaurante",
            error: error.message,
        });
    }
};

export const changeRestaurantStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activado' : 'desactivado';

        const restaurant = await Restaurant.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado',
            });
        }

        res.status(200).json({
            success: true,
            message: `Restaurante ${action} exitosamente`,
            data: restaurant,

        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado del restaurante',
            error: error.message,

        });
    }

};