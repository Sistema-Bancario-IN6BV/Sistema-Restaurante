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

export const getRestaurants = async (req, res) => {

    try {
        const { page = 1, limit = 10, isActive = true } = req.query;

        const filter = { isActive };

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const restaurants = await Restaurant.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(options.sort);

        const total = await Restaurant.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: restaurants,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit
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