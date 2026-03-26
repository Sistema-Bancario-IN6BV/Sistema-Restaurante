import { Router } from 'express';
import { updateIngredient, restockIngredient, deleteIngredient } from './ingredient.controller.js';
import { validateUpdateIngredientId, validateRestockIngredientId, validateDeleteIngredientId } from '../../middlewares/inventory-validators.js';
const router = Router();

router.put('/:id', validateUpdateIngredientId, updateIngredient);
router.patch('/:id/restock', validateRestockIngredientId, restockIngredient);
router.delete('/:id', validateDeleteIngredientId, deleteIngredient);

export default router;
