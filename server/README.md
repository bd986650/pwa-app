# ShopList Server

Сервер для приложения списков покупок.

## Технологии

- Node.js + Express
- PostgreSQL (через Prisma ORM)
- JWT аутентификация
- TypeScript

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка базы данных

#### Вариант A: Использование Docker (рекомендуется)

1. Запустите PostgreSQL в Docker:
```bash
docker-compose up -d
```

2. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

3. Примените миграции базы данных:
```bash
npm run db:migrate
```

4. Сгенерируйте Prisma Client:
```bash
npm run db:generate
```

#### Вариант B: Локальный PostgreSQL

1. Установите PostgreSQL локально
2. Создайте базу данных:
```sql
CREATE DATABASE shoplist_db;
CREATE USER shoplist WITH PASSWORD 'shoplist_password';
GRANT ALL PRIVILEGES ON DATABASE shoplist_db TO shoplist;
```

3. Создайте файл `.env` и укажите свой `DATABASE_URL`:
```env
DATABASE_URL="postgresql://shoplist:shoplist_password@localhost:5432/shoplist_db?schema=public"
```

4. Примените миграции:
```bash
npm run db:migrate
npm run db:generate
```

### 3. Запуск сервера

**Режим разработки:**
```bash
npm run dev
```

**Продакшн:**
```bash
npm run build
npm start
```

Сервер будет доступен на `http://localhost:3000`

## Полезные команды

- `npm run dev` - запуск в режиме разработки с hot-reload
- `npm run build` - сборка проекта
- `npm start` - запуск собранного проекта
- `npm run db:migrate` - применение миграций базы данных
- `npm run db:generate` - генерация Prisma Client
- `npm run db:studio` - открыть Prisma Studio (GUI для БД)

## Docker команды

- `docker-compose up -d` - запустить PostgreSQL
- `docker-compose down` - остановить PostgreSQL
- `docker-compose logs -f postgres` - посмотреть логи
- `docker-compose ps` - статус контейнеров

## API эндпоинты

### Аутентификация
- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - вход
- `GET /api/auth/me` - текущий пользователь

### Списки покупок (требуют аутентификации)
- `GET /api/lists` - все списки
- `GET /api/lists/:id` - один список
- `POST /api/lists` - создать список
- `PUT /api/lists/:id` - обновить список
- `DELETE /api/lists/:id` - удалить список

### Товары (требуют аутентификации)
- `POST /api/lists/:id/items` - добавить товар
- `PUT /api/lists/:id/items/:itemId` - обновить товар
- `DELETE /api/lists/:id/items/:itemId` - удалить товар
- `PATCH /api/lists/:id/items/:itemId/toggle` - переключить статус

## Переменные окружения

Создайте файл `.env` на основе `.env.example`:

- `DATABASE_URL` - строка подключения к PostgreSQL
- `JWT_SECRET` - секретный ключ для JWT токенов
- `PORT` - порт сервера (по умолчанию 3000)

## Документация

- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Полная документация API для фронтенда
- [CATEGORIES.md](./CATEGORIES.md) - Рекомендованные категории товаров и примеры использования
- [FIX_DATABASE.md](./FIX_DATABASE.md) - Решение проблем с базой данных
- [MIGRATION_CATEGORIES.md](./MIGRATION_CATEGORIES.md) - Инструкции по применению миграции для категорий

