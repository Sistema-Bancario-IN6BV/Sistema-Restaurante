import { Router } from 'express';
import { createIngredient, getIngredientsByRestaurant as getInventory, getIngredientById, updateIngredient,
    restockIngredient, deleteIngredient, getAlerts as getLowStockAlerts } from '../ingredients/ingredient.controller.js';
import { validateCreateIngredient, validateIngredientId, validateIngredientIdAdmin, validateUpdateIngredient, validateRestockIngredient,
    validateGetInventory } from '../../middlewares/inventory-validators.js';

const router = Router();

router.post('/', validateCreateIngredient, createIngredient);
router.get('/restaurant/:restaurantId', validateGetInventory, getInventory);
router.get('/restaurant/:restaurantId/alerts', validateIngredientIdAdmin, getLowStockAlerts);
router.get('/:id', validateIngredientId, getIngredientById);
router.put('/:id', validateUpdateIngredient, updateIngredient);
router.patch('/:id/restock', validateRestockIngredient, restockIngredient);
router.delete('/:id', validateIngredientIdAdmin, deleteIngredient);

export default router;
