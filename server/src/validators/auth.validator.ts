import { body, ValidationChain } from 'express-validator';

export const registerValidator: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Некорректный email')
    .notEmpty()
    .withMessage('Email обязателен'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль должен быть не менее 6 символов')
    .notEmpty()
    .withMessage('Пароль обязателен'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Имя обязательно')
    .isLength({ min: 2, max: 50 })
    .withMessage('Имя должно быть от 2 до 50 символов'),
];

export const loginValidator: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Некорректный email')
    .notEmpty()
    .withMessage('Email обязателен'),
  body('password')
    .notEmpty()
    .withMessage('Пароль обязателен'),
];

