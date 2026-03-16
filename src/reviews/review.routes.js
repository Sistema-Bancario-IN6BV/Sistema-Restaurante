import { Router } from 'express';
import { 
    changeReviewStatus, 
    createReview, 
    getReviewById, 
    getReviews, 
    updateReview 
} from './review.controller.js';

import { 
    validateCreateReview, 
    validateReviewStatusChange, 
    validateGetReviewById, 
    validateUpdateReview,
    validateGetReviews
} from '../../middlewares/reviews-validators.js';

const router = Router();

/**
 * @openapi
 * /reviews/create:
 *   post:
 *     tags: [Reviews]
 *     summary: Crear reseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, restaurant, rating, comment]
 *             properties:
 *               userId: { type: string }
 *               restaurant: { type: string }
 *               rating: { type: number, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       201:
 *         description: Reseña creada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Review'
 */

router.post(
    '/create',
    validateCreateReview,
    createReview
);

/**
 * @openapi
 * /reviews/get:
 *   get:
 *     tags: [Reviews]
 *     summary: Listar reseñas
 *     responses:
 *       200:
 *         description: Listado de reseñas
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
 *                         $ref: '#/components/schemas/Review'
 */

router.get(
    '/get',
    validateGetReviews,
    getReviews
);

/**
 * @openapi
 * /reviews/{id}:
 *   get:
 *     tags: [Reviews]
 *     summary: Obtener reseña por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reseña encontrada
 */

router.get('/:id', validateGetReviewById, getReviewById);

/**
 * @openapi
 * /reviews/{id}:
 *   put:
 *     tags: [Reviews]
 *     summary: Actualizar reseña
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reseña actualizada
 */

router.put(
    '/:id',
    validateUpdateReview,
    updateReview
);

/**
 * @openapi
 * /reviews/{id}/activate:
 *   put:
 *     tags: [Reviews]
 *     summary: Activar reseña
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reseña activada
 */

router.put('/:id/activate', validateReviewStatusChange, changeReviewStatus);

/**
 * @openapi
 * /reviews/{id}/deactivate:
 *   put:
 *     tags: [Reviews]
 *     summary: Desactivar reseña
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reseña desactivada
 */

router.put('/:id/deactivate', validateReviewStatusChange, changeReviewStatus);

export default router;
