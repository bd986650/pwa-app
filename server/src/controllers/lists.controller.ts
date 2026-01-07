import { Response } from 'express';
import { ListsService } from '../services/lists.service';
import { AuthRequest } from '../middleware/auth';

const listsService = new ListsService();

export class ListsController {
  async getAllLists(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const lists = await listsService.getAllLists(userId);
      res.json({ lists });
    } catch (error) {
      console.error('Ошибка при получении списков:', error);
      res.status(500).json({ error: 'Ошибка при получении списков' });
    }
  }

  async getListById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const list = await listsService.getListById(id, userId);

      if (!list) {
        res.status(404).json({ error: 'Список не найден' });
        return;
      }

      res.json({ list });
    } catch (error) {
      console.error('Ошибка при получении списка:', error);
      res.status(500).json({ error: 'Ошибка при получении списка' });
    }
  }

  async createList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { name, description, items } = req.body;

      if (!name) {
        res.status(400).json({ error: 'Название списка обязательно' });
        return;
      }

      const list = await listsService.createList(userId, { name, description, items });
      res.status(201).json({ list });
    } catch (error) {
      console.error('Ошибка при создании списка:', error);
      res.status(500).json({ error: 'Ошибка при создании списка' });
    }
  }

  async updateList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const { name, description } = req.body;

      const list = await listsService.updateList(id, userId, { name, description });
      res.json({ list });
    } catch (error) {
      console.error('Ошибка при обновлении списка:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при обновлении списка';
      const statusCode = message.includes('не найден') ? 404 : 500;
      res.status(statusCode).json({ error: message });
    }
  }

  async deleteList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      await listsService.deleteList(id, userId);
      res.json({ message: 'Список удален' });
    } catch (error) {
      console.error('Ошибка при удалении списка:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при удалении списка';
      const statusCode = message.includes('не найден') ? 404 : 500;
      res.status(statusCode).json({ error: message });
    }
  }

  async addItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const { name, quantity, unit } = req.body;

      if (!name) {
        res.status(400).json({ error: 'Название товара обязательно' });
        return;
      }

      const item = await listsService.addItemToList(id, userId, { name, quantity, unit });
      res.status(201).json({ item });
    } catch (error) {
      console.error('Ошибка при добавлении товара:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при добавлении товара';
      const statusCode = message.includes('не найден') ? 404 : 500;
      res.status(statusCode).json({ error: message });
    }
  }

  async updateItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { id, itemId } = req.params;
      const { name, quantity, unit, completed } = req.body;

      const item = await listsService.updateItem(id, itemId, userId, {
        name,
        quantity,
        unit,
        completed,
      });
      res.json({ item });
    } catch (error) {
      console.error('Ошибка при обновлении товара:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при обновлении товара';
      const statusCode = message.includes('не найден') ? 404 : 500;
      res.status(statusCode).json({ error: message });
    }
  }

  async deleteItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { id, itemId } = req.params;

      await listsService.deleteItem(id, itemId, userId);
      res.json({ message: 'Товар удален' });
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      const message = error instanceof Error ? error.message : 'Ошибка при удалении товара';
      const statusCode = message.includes('не найден') ? 404 : 500;
      res.status(statusCode).json({ error: message });
    }
  }

  async toggleItemStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { id, itemId } = req.params;

      const item = await listsService.toggleItemStatus(id, itemId, userId);
      res.json({ item });
    } catch (error) {
      console.error('Ошибка при переключении статуса товара:', error);
      const message =
        error instanceof Error ? error.message : 'Ошибка при переключении статуса товара';
      const statusCode = message.includes('не найден') ? 404 : 500;
      res.status(statusCode).json({ error: message });
    }
  }

  async getPublicListById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const list = await listsService.getPublicListById(id);

      if (!list) {
        res.status(404).json({ error: 'Список не найден' });
        return;
      }

      res.json({ list });
    } catch (error) {
      console.error('Ошибка при получении публичного списка:', error);
      res.status(500).json({ error: 'Ошибка при получении списка' });
    }
  }
}

