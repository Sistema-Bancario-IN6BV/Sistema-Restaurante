import { Router } from "express";
import { createTable, getRestaurantTables, getTableById, updateTable, changeTableStatus, changeTableActive, getTablesByRestaurant } from "./table.controller.js";
import { validateCreateTable, validateTableActiveChange, validateUpdateTableRequest, validateGetTableById,
        validateChangeTableStatus, validateGetTables, validateGetTablesByRestaurant } from '../../middlewares/table-validators.js';

const router = Router();

router.post("/", validateCreateTable, createTable);

router.get("/", validateGetTables, getRestaurantTables);

router.get("/restaurant/:restaurantId", validateGetTablesByRestaurant, getTablesByRestaurant);

router.patch("/:id/status", validateChangeTableStatus, changeTableStatus);

router.put("/activate/:id", validateTableActiveChange, changeTableActive);

router.put("/deactivate/:id", validateTableActiveChange, changeTableActive);

router.get("/:id", validateGetTableById, getTableById);

router.put("/:id", validateUpdateTableRequest, updateTable);

export default router;