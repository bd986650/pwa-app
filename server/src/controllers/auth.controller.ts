import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({ error: 'Все поля обязательны' });
        return;
      }

      const result = await authService.register({ email, password, name });
      res.status(201).json(result);
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при регистрации';
      const statusCode = message.includes('уже существует') ? 400 : 500;
      res.status(statusCode).json({ error: message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email и пароль обязательны' });
        return;
      }

      const result = await authService.login({ email, password });
      res.json(result);
    } catch (error) {
      console.error('Ошибка при входе:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при входе';
      const statusCode = message.includes('Неверный') ? 401 : 500;
      res.status(statusCode).json({ error: message });
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const user = await authService.getCurrentUser(userId);
      res.json({ user });
    } catch (error) {
      console.error('Ошибка при получении пользователя:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при получении пользователя';
      const statusCode = message.includes('не найден') ? 404 : 500;
      res.status(statusCode).json({ error: message });
    }
  }
}

