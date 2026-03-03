'use strict';

import { Router } from 'express';
import {
    createMenuItem,
    getAllMenuItem,
    getMenuItemById,
    updateMenuItem,
    changeMenuItemStatus
} from './menuItem.controller.js';

import { uploadMenuItemImage } from '../../middlewares/file-uploader.js';
import { cleanUploaderFileOnFinish } from '../../middlewares/delete-file-on-error.js';

import {
    validateCreateMenuItem,
    validateUpdateMenuItemRequest,
    validateGetMenuItemById,
    validateMenuItemStatusChange,
    validateGetMenuItems
} from '../../middlewares/menuItem-validators.js';

const router = Router();

/**
 * @openapi
 * /menuItems/create:
 *   post:
 *     tags: [Menu Items]
 *     summary: Crear ítem de menú
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [restaurant, name, price, type]
 *             properties:
 *               restaurant: { type: string }
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               type: { type: string, enum: [ENTRADA, PLATO_FUERTE, POSTRE, BEBIDA] }
 *               photo: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Ítem creado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MenuItem'
 */

router.post(
    '/create',
    uploadMenuItemImage.single('photo'),
    cleanUploaderFileOnFinish,
    validateCreateMenuItem,
    createMenuItem
);

/**
 * @openapi
 * /menuItems/get:
 *   get:
 *     tags: [Menu Items]
 *     summary: Listar ítems de menú
 *     responses:
 *       200:
 *         description: Listado de ítems
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
 *                         $ref: '#/components/schemas/MenuItem'
 */

router.get(
    '/get',
    validateGetMenuItems,
    getAllMenuItem
);

/**
 * @openapi
 * /menuItems/{id}:
 *   get:
 *     tags: [Menu Items]
 *     summary: Obtener ítem por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ítem encontrado
 */

router.get(
    '/:id',
    validateGetMenuItemById,
    getMenuItemById
);

/**
 * @openapi
 * /menuItems/{id}:
 *   put:
 *     tags: [Menu Items]
 *     summary: Actualizar ítem de menú
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ítem actualizado
 */

router.put(
    '/:id',
    uploadMenuItemImage.single('photo'),
    cleanUploaderFileOnFinish,
    validateUpdateMenuItemRequest,
    updateMenuItem
);

/**
 * @openapi
 * /menuItems/{id}/activate:
 *   put:
 *     tags: [Menu Items]
 *     summary: Activar ítem
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ítem activado
 */

router.put(
    '/:id/activate',
    validateMenuItemStatusChange,
    changeMenuItemStatus
);

/**
 * @openapi
 * /menuItems/{id}/deactivate:
 *   put:
 *     tags: [Menu Items]
 *     summary: Desactivar ítem
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ítem desactivado
 */

router.put(
    '/:id/deactivate',
    validateMenuItemStatusChange,
    changeMenuItemStatus
);

export default router;