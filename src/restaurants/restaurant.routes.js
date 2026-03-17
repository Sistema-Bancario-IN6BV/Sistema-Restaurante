import { Router } from 'express';
import {
    changeRestaurantStatus,
    createRestaurantAdmin,
    createRestaurant,
    deactivateRestaurantAdmin,
    getRestaurantByIdAdmin,
    getRestaurantsAdmin,
    getRestaurantById,
    getRestaurants,
    searchRestaurantsByAveragePrice,
    searchRestaurantsByCategory,
    searchRestaurantsByCity,
    searchRestaurantsByName,
    updateRestaurantAdmin,
    updateRestaurant
} from './restaurant.controller.js';
import { uploadFieldImage } from '../../middlewares/file-uploader.js';
import { cleanUploaderFileOnFinish } from '../../middlewares/delete-file-on-error.js';
import {
    validateAdminCreateRestaurant,
    validateAdminDeactivateRestaurant,
    validateAdminGetRestaurantById,
    validateAdminGetRestaurants,
    validateAdminUpdateRestaurant,
    validateCreateField,
    validateFieldStatusChange,
    validateGetFieldById,
    validateGetRestaurants,
    validateSearchRestaurantsByAveragePrice,
    validateSearchRestaurantsByCategory,
    validateSearchRestaurantsByCity,
    validateSearchRestaurantsByName,
    validateUpdateFieldRequest
} from '../../middlewares/restaurant-validators.js';

const router = Router();

router.post(
    '/admin/catalog',
    uploadFieldImage.single('image'),
    cleanUploaderFileOnFinish,
    validateAdminCreateRestaurant,
    createRestaurantAdmin
);

router.get(
    '/admin/catalog',
    validateAdminGetRestaurants,
    getRestaurantsAdmin
);

router.get(
    '/admin/catalog/:id',
    validateAdminGetRestaurantById,
    getRestaurantByIdAdmin
);

router.put(
    '/admin/catalog/:id',
    uploadFieldImage.single('image'),
    cleanUploaderFileOnFinish,
    validateAdminUpdateRestaurant,
    updateRestaurantAdmin
);

router.delete(
    '/admin/catalog/:id',
    validateAdminDeactivateRestaurant,
    deactivateRestaurantAdmin
);

/**
 * @openapi
 * /restaurants/create:
 *   post:
 *     tags: [Restaurants]
 *     summary: Crear restaurante
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, location, phone]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               location: { type: string }
 *               phone: { type: string }
 *               image: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Restaurante creado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Restaurant'
 */

router.post(
    '/create',
    uploadFieldImage.single('image'),
    cleanUploaderFileOnFinish,
    validateCreateField,
    createRestaurant
)

/**
 * @openapi
 * /restaurants/get:
 *   get:
 *     tags: [Restaurants]
 *     summary: Listar y buscar restaurantes
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Búsqueda parcial por nombre
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Búsqueda parcial por categoría
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Búsqueda parcial por ciudad (se evalúa sobre la dirección)
 *       - in: query
 *         name: averagePrice
 *         schema:
 *           type: number
 *           minimum: 0
 *       - in: query
 *         name: minAveragePrice
 *         schema:
 *           type: number
 *           minimum: 0
 *       - in: query
 *         name: maxAveragePrice
 *         schema:
 *           type: number
 *           minimum: 0
 *     responses:
 *       200:
 *         description: Listado de restaurantes
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Restaurant'
 */

router.get(
    '/get',
    validateGetRestaurants,
    getRestaurants
)

/**
 * @openapi
 * /restaurants/search/name:
 *   put:
 *     tags: [Restaurants]
 *     summary: Buscar restaurantes por nombre
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               isActive: { type: boolean }
 *               page: { type: integer, minimum: 1 }
 *               limit: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Listado de restaurantes filtrados por nombre
 */

router.put(
    '/search/name',
    validateSearchRestaurantsByName,
    searchRestaurantsByName
)

/**
 * @openapi
 * /restaurants/search/category:
 *   put:
 *     tags: [Restaurants]
 *     summary: Buscar restaurantes por categoría
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category]
 *             properties:
 *               category: { type: string }
 *               isActive: { type: boolean }
 *               page: { type: integer, minimum: 1 }
 *               limit: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Listado de restaurantes filtrados por categoría
 */

router.put(
    '/search/category',
    validateSearchRestaurantsByCategory,
    searchRestaurantsByCategory
)

/**
 * @openapi
 * /restaurants/search/city:
 *   put:
 *     tags: [Restaurants]
 *     summary: Buscar restaurantes por ciudad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [city]
 *             properties:
 *               city: { type: string }
 *               isActive: { type: boolean }
 *               page: { type: integer, minimum: 1 }
 *               limit: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Listado de restaurantes filtrados por ciudad
 */

router.put(
    '/search/city',
    validateSearchRestaurantsByCity,
    searchRestaurantsByCity
)

/**
 * @openapi
 * /restaurants/search/average-price:
 *   put:
 *     tags: [Restaurants]
 *     summary: Buscar restaurantes por precio promedio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               averagePrice: { type: number, minimum: 0 }
 *               minAveragePrice: { type: number, minimum: 0 }
 *               maxAveragePrice: { type: number, minimum: 0 }
 *               isActive: { type: boolean }
 *               page: { type: integer, minimum: 1 }
 *               limit: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Listado de restaurantes filtrados por precio promedio
 */

router.put(
    '/search/average-price',
    validateSearchRestaurantsByAveragePrice,
    searchRestaurantsByAveragePrice
)

/**
 * @openapi
 * /restaurants/{id}:
 *   get:
 *     tags: [Restaurants]
 *     summary: Obtener restaurante por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurante encontrado
 */

router.get(
    '/:id',
    validateGetFieldById,
    getRestaurantById
)

/**
 * @openapi
 * /restaurants/{id}:
 *   put:
 *     tags: [Restaurants]
 *     summary: Actualizar restaurante
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurante actualizado
 */

router.put(
    '/:id',
    uploadFieldImage.single('image'),
    cleanUploaderFileOnFinish,
    validateUpdateFieldRequest,
    updateRestaurant
);

/**
 * @openapi
 * /restaurants/{id}/activate:
 *   put:
 *     tags: [Restaurants]
 *     summary: Activar restaurante
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurante activado
 */

router.put(
    '/:id/activate',
    validateFieldStatusChange,
    changeRestaurantStatus
)

/**
 * @openapi
 * /restaurants/{id}/desactivate:
 *   put:
 *     tags: [Restaurants]
 *     summary: Desactivar restaurante
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurante desactivado
 */

router.put(
    '/:id/desactivate',
    validateFieldStatusChange,
    changeRestaurantStatus
)

export default router;