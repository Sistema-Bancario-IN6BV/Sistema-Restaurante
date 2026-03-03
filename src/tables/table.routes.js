import { Router } from 'express';
import {
	createTable,
	getTables,
	getTableById,
	updateTable,
	changeTableStatus
} from './table.controller.js';

import {
	validateCreateTable,
	validateUpdateTableRequest,
	validateGetTableById,
	validateTableStatusChange,
	validateGetTables
} from '../../middlewares/table-validators.js';

const router = Router();

/**
 * @openapi
 * /tables/create:
 *   post:
 *     tags: [Tables]
 *     summary: Crear mesa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [restaurant, tableNumber, capacity]
 *             properties:
 *               restaurant: { type: string }
 *               tableNumber: { type: number }
 *               capacity: { type: number }
 *     responses:
 *       201:
 *         description: Mesa creada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Table'
 */

router.post(
	'/create',
	validateCreateTable,
	createTable
);

/**
 * @openapi
 * /tables/get:
 *   get:
 *     tags: [Tables]
 *     summary: Listar mesas
 *     responses:
 *       200:
 *         description: Listado de mesas
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
 *                         $ref: '#/components/schemas/Table'
 */

router.get(
	'/get',
	validateGetTables,
	getTables
);

/**
 * @openapi
 * /tables/{id}:
 *   get:
 *     tags: [Tables]
 *     summary: Obtener mesa por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mesa encontrada
 */

router.get(
	'/:id',
	validateGetTableById,
	getTableById
);

/**
 * @openapi
 * /tables/{id}:
 *   put:
 *     tags: [Tables]
 *     summary: Actualizar mesa
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mesa actualizada
 */

router.put(
	'/:id',
	validateUpdateTableRequest,
	updateTable
);

/**
 * @openapi
 * /tables/{id}/activate:
 *   put:
 *     tags: [Tables]
 *     summary: Activar mesa
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mesa activada
 */

router.put(
	'/:id/activate',
	validateTableStatusChange,
	changeTableStatus
);

/**
 * @openapi
 * /tables/{id}/deactivate:
 *   put:
 *     tags: [Tables]
 *     summary: Desactivar mesa
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mesa desactivada
 */

router.put(
	'/:id/deactivate',
	validateTableStatusChange,
	changeTableStatus
);

export default router;
