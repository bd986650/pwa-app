import { Router } from 'express';
import { ListsController } from '../controllers/lists.controller';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  createListValidator,
  updateListValidator,
  listIdValidator,
  createItemValidator,
  updateItemValidator,
  itemIdValidator,
} from '../validators/lists.validator';

const router = Router();
const listsController = new ListsController();

// ПУБЛИЧНЫЕ маршруты (БЕЗ аутентификации) - для просмотра расшаренных списков
// Должны быть ДО router.use(authenticateToken)

// Получить публичный список по ID (только для чтения, без проверки userId)
router.get('/public/:id', validate(listIdValidator), (req, res) => {
  listsController.getPublicListById(req, res);
});

// Все остальные маршруты требуют аутентификации
router.use(authenticateToken);

// Получить все списки пользователя
router.get('/', (req, res) => {
  listsController.getAllLists(req, res);
});

// Получить один список по ID
router.get('/:id', validate(listIdValidator), (req, res) => {
  listsController.getListById(req, res);
});

// Создать новый список
router.post('/', validate(createListValidator), (req, res) => {
  listsController.createList(req, res);
});

// Обновить список
router.put('/:id', validate(updateListValidator), (req, res) => {
  listsController.updateList(req, res);
});

// Удалить список
router.delete('/:id', validate(listIdValidator), (req, res) => {
  listsController.deleteList(req, res);
});

// Добавить товар в список
router.post('/:id/items', validate(createItemValidator), (req, res) => {
  listsController.addItem(req, res);
});

// Обновить товар
router.put('/:id/items/:itemId', validate(updateItemValidator), (req, res) => {
  listsController.updateItem(req, res);
});

// Удалить товар
router.delete('/:id/items/:itemId', validate(itemIdValidator), (req, res) => {
  listsController.deleteItem(req, res);
});

// Переключить статус выполнения товара
router.patch('/:id/items/:itemId/toggle', validate(itemIdValidator), (req, res) => {
  listsController.toggleItemStatus(req, res);
});

export default router;
