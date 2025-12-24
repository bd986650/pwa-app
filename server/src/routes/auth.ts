import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { registerValidator, loginValidator } from '../validators/auth.validator';

const router = Router();
const authController = new AuthController();

// Регистрация
router.post('/register', validate(registerValidator), (req, res) => {
  authController.register(req, res);
});

// Вход
router.post('/login', validate(loginValidator), (req, res) => {
  authController.login(req, res);
});

// Получение информации о текущем пользователе
router.get('/me', authenticateToken, (req, res) => {
  authController.getCurrentUser(req, res);
});

export default router;
