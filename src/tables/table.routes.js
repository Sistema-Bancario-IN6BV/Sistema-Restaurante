import { Router } from "express";
import { createTable, getRestaurantTables, getTableById, updateTable, changeTableStatus, changeTableActive } from "./table.controller.js";
import { validateCreateTable, validateTableActiveChange, validateUpdateTableRequest, validateGetTableById,
        validateChangeTableStatus, validateGetTables } from '../../middlewares/table-validators.js';

const router = Router();

router.post( "/restaurants/:id", validateCreateTable, createTable );

router.get( "/restaurants/:id", validateGetTables, getRestaurantTables );

router.get( "/:id", validateGetTableById, getTableById);

router.put( "/:id", validateUpdateTableRequest, updateTable );

router.patch( "/:id/status", validateChangeTableStatus, changeTableStatus );

router.put( '/activate/:id', validateTableActiveChange, changeTableActive );

router.put( '/deactivate/:id', validateTableActiveChange, changeTableActive );

export default router;