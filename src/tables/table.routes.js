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

router.post(
	'/create',
	validateCreateTable,
	createTable
);

router.get(
	'/get',
	validateGetTables,
	getTables
);

router.get(
	'/:id',
	validateGetTableById,
	getTableById
);

router.put(
	'/:id',
	validateUpdateTableRequest,
	updateTable
);

router.put(
	'/:id/activate',
	validateTableStatusChange,
	changeTableStatus
);

router.put(
	'/:id/deactivate',
	validateTableStatusChange,
	changeTableStatus
);

export default router;
