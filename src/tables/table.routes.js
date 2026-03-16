import { Router } from "express";
import { createTable, getRestaurantTables, getTableById, updateTable, changeTableStatus, changeTableActive } from "./table.controller.js";
import { validateTableActiveChange } from '../../middlewares/table-validators.js';

const router = Router();

router.post( "/restaurants/:id", createTable );

router.get( "/restaurants/:id", getRestaurantTables );

router.get( "/:id", getTableById );

router.put( "/:id", updateTable );

router.patch( "/:id/status", changeTableStatus );

router.put( '/activate/:id', validateTableActiveChange, changeTableActive );

router.put( '/deactivate/:id', validateTableActiveChange, changeTableActive );

export default router;