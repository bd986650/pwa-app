import { body, param, ValidationChain } from 'express-validator';

export const createListValidator: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Название списка обязательно')
    .isLength({ min: 1, max: 100 })
    .withMessage('Название должно быть от 1 до 100 символов'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Описание не должно превышать 500 символов'),
  body('items')
    .optional()
    .isArray()
    .withMessage('Товары должны быть массивом'),
  body('items.*.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Название товара обязательно')
    .isLength({ min: 1, max: 200 })
    .withMessage('Название товара должно быть от 1 до 200 символов'),
  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Количество должно быть положительным числом'),
  body('items.*.unit')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Единица измерения не должна превышать 20 символов'),
  body('items.*.category')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Категория не должна превышать 50 символов'),
];

export const updateListValidator: ValidationChain[] = [
  param('id')
    .notEmpty()
    .withMessage('ID списка обязателен'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Название должно быть от 1 до 100 символов'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Описание не должно превышать 500 символов'),
];

export const listIdValidator: ValidationChain[] = [
  param('id')
    .notEmpty()
    .withMessage('ID списка обязателен'),
];

export const createItemValidator: ValidationChain[] = [
  param('id')
    .notEmpty()
    .withMessage('ID списка обязателен'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Название товара обязательно')
    .isLength({ min: 1, max: 200 })
    .withMessage('Название товара должно быть от 1 до 200 символов'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Количество должно быть положительным числом'),
  body('unit')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Единица измерения не должна превышать 20 символов'),
  body('category')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Категория не должна превышать 50 символов'),
];

export const updateItemValidator: ValidationChain[] = [
  param('id')
    .notEmpty()
    .withMessage('ID списка обязателен'),
  param('itemId')
    .notEmpty()
    .withMessage('ID товара обязателен'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Название товара должно быть от 1 до 200 символов'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Количество должно быть положительным числом'),
  body('unit')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Единица измерения не должна превышать 20 символов'),
  body('category')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Категория не должна превышать 50 символов'),
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Статус выполнения должен быть булевым значением'),
];

export const itemIdValidator: ValidationChain[] = [
  param('id')
    .notEmpty()
    .withMessage('ID списка обязателен'),
  param('itemId')
    .notEmpty()
    .withMessage('ID товара обязателен'),
];

