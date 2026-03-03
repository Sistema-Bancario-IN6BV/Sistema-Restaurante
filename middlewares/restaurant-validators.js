<<<<<<< HEAD
=======

>>>>>>> origin/develop
import { body, param, query } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';
<<<<<<< HEAD

export const validateCreateField = [
    //validateJWT,
    //requireRole('ADMIN_ROLE'),

    body('name')
        .notEmpty()
        .withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 150 })
        .withMessage('El nombre debe tener entre 2 y 150 caracteres'),

    body('description')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres'),

    body('address')
        .notEmpty()
        .withMessage('La dirección es requerida'),

    body('category')
        .optional({ nullable: true, checkFalsy: true })
        .isString()
        .withMessage('La categoría debe ser un string'),

    body('averagePrice')
        .optional({ nullable: true, checkFalsy: true })
        .isFloat({ min: 0 })
        .withMessage('El precio promedio debe ser mayor o igual a 0'),

    body('contactEmail')
        .optional({ nullable: true, checkFalsy: true })
        .isEmail()
        .withMessage('Debe ser un correo electrónico válido'),

    body('contactPhone')
        .optional({ nullable: true, checkFalsy: true })
        .isString()
        .withMessage('El teléfono debe ser un string'),

    checkValidators,
];

export const validateUpdateFieldRequest = [
    validateJWT,
    requireRole('ADMIN_ROLE'),

    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),

    body('name')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 2, max: 150 })
        .withMessage('El nombre debe tener entre 2 y 150 caracteres'),

    body('description')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres'),

    body('address')
        .optional({ nullable: true, checkFalsy: true })
        .isString()
        .withMessage('La dirección debe ser un string'),

    body('category')
        .optional({ nullable: true, checkFalsy: true })
        .isString()
        .withMessage('La categoría debe ser un string'),

    body('averagePrice')
        .optional({ nullable: true, checkFalsy: true })
        .isFloat({ min: 0 })
        .withMessage('El precio promedio debe ser mayor o igual a 0'),

    body('contactEmail')
        .optional({ nullable: true, checkFalsy: true })
        .isEmail()
        .withMessage('Debe ser un correo electrónico válido'),

    body('contactPhone')
        .optional({ nullable: true, checkFalsy: true })
        .isString()
        .withMessage('El teléfono debe ser un string'),

    checkValidators,
];

export const validateFieldStatusChange = [
    validateJWT,
    requireRole('ADMIN_ROLE'),

    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),

    checkValidators,
];

export const validateGetFieldById = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),

    checkValidators,
];

export const validateGetFields = [
    query('page')
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número mayor a 0'),

    query('limit')
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 1 })
        .withMessage('El límite debe ser un número mayor a 0'),

    query('category')
        .optional({ nullable: true, checkFalsy: true })
        .isString()
        .withMessage('La categoría debe ser un string'),

    checkValidators,
=======
import { USER_ROLES } from './roles.js';

export const validateCreateField = [
	validateJWT,
	requireRole(USER_ROLES.PLATFORM_ADMIN),

	body('name')
		.trim()
		.notEmpty()
		.withMessage('El nombre es requerido')
		.isLength({ min: 2, max: 150 })
		.withMessage('El nombre debe tener entre 2 y 150 caracteres'),

	body('description')
		.optional()
		.trim()
		.isLength({ max: 500 })
		.withMessage('La descripción no puede exceder 500 caracteres'),

	body('address')
		.trim()
		.notEmpty()
		.withMessage('La dirección es requerida'),

	body('category')
		.optional()
		.trim(),

	body('averagePrice')
		.optional()
		.isFloat({ min: 0 })
		.withMessage('El precio promedio no puede ser negativo'),

	body('contactEmail')
		.optional()
		.isEmail()
		.withMessage('Email de contacto no válido'),

	body('contactPhone')
		.optional()
		.trim(),

	checkValidators,
];

export const validateUpdateFieldRequest = [
	validateJWT,
	requireRole(USER_ROLES.PLATFORM_ADMIN),

	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),

	body('name')
		.optional()
		.trim()
		.isLength({ min: 2, max: 150 })
		.withMessage('El nombre debe tener entre 2 y 150 caracteres'),

	body('description')
		.optional()
		.trim()
		.isLength({ max: 500 })
		.withMessage('La descripción no puede exceder 500 caracteres'),

	body('address')
		.optional()
		.trim(),

	body('category')
		.optional()
		.trim(),

	body('averagePrice')
		.optional()
		.isFloat({ min: 0 })
		.withMessage('El precio promedio no puede ser negativo'),

	body('contactEmail')
		.optional()
		.isEmail()
		.withMessage('Email de contacto no válido'),

	body('contactPhone')
		.optional()
		.trim(),

	checkValidators,
];

export const validateFieldStatusChange = [
	validateJWT,
	requireRole(USER_ROLES.PLATFORM_ADMIN),
	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),
	checkValidators,
];

export const validateGetFieldById = [
	param('id')
		.isMongoId()
		.withMessage('ID debe ser un ObjectId válido de MongoDB'),
	checkValidators,
];

export const validateGetRestaurants = [
	query('page')
		.optional()
		.isInt({ min: 1 })
		.withMessage('La página debe ser un número mayor a 0'),

	query('limit')
		.optional()
		.isInt({ min: 1 })
		.withMessage('El límite debe ser un número mayor a 0'),

	query('category')
		.optional()
		.trim(),

	checkValidators,
>>>>>>> origin/develop
];
