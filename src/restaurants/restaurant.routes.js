import { Router } from 'express';
import { changeRestaurantStatus, createRestaurant, getRestaurantById, getRestaurants, updateRestaurant } from './restaurant.controller.js';
import { uploadFieldImage } from '../../middlewares/file-uploader.js';
import { cleanUploaderFileOnFinish } from '../../middlewares/delete-file-on-error.js';
import { validateCreateField, validateFieldStatusChange, validateGetFieldById, validateUpdateFieldRequest, validateGetRestaurants } from '../../middlewares/restaurant-validators.js';

const router = Router();

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
 *     summary: Listar restaurantes
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