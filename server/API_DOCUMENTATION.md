# API Документация для Frontend

## Базовый URL

```
http://localhost:3000/api
```

## Аутентификация

Большинство эндпоинтов требуют JWT токен в заголовке запроса:

```
Authorization: Bearer <token>
```

Токен получается при регистрации или входе и действителен 7 дней.

---

## Структуры данных

### User (Пользователь)

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string; // ISO 8601 date string
}
```

### GroceryList (Список покупок)

```typescript
interface GroceryList {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  items: GroceryItem[];
}
```

### GroceryItem (Товар)

```typescript
interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  completed: boolean;
  listId: string;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}
```

---

## Эндпоинты

### 1. Health Check

Проверка работоспособности сервера.

**Endpoint:** `GET /api/health`

**Аутентификация:** Не требуется

**Ответ:**
```json
{
  "status": "ok"
}
```

---

### 2. Аутентификация

#### 2.1. Регистрация

**Endpoint:** `POST /api/auth/register`

**Аутентификация:** Не требуется

**Тело запроса:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Имя Пользователя"
}
```

**Валидация:**
- `email` - обязательное, валидный email
- `password` - обязательное, минимум 6 символов
- `name` - обязательное, от 2 до 50 символов

**Успешный ответ (201):**
```json
{
  "user": {
    "id": "clx123...",
    "email": "user@example.com",
    "name": "Имя Пользователя",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Ошибки:**
- `400` - Все поля обязательны / Пользователь с таким email уже существует
- `500` - Ошибка при регистрации

**Пример использования:**
```typescript
const response = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'Имя Пользователя',
  }),
});

const data = await response.json();
localStorage.setItem('token', data.token);
```

---

#### 2.2. Вход

**Endpoint:** `POST /api/auth/login`

**Аутентификация:** Не требуется

**Тело запроса:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Валидация:**
- `email` - обязательное, валидный email
- `password` - обязательное

**Успешный ответ (200):**
```json
{
  "user": {
    "id": "clx123...",
    "email": "user@example.com",
    "name": "Имя Пользователя",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Ошибки:**
- `400` - Email и пароль обязательны
- `401` - Неверный email или пароль
- `500` - Ошибка при входе

**Пример использования:**
```typescript
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});

const data = await response.json();
localStorage.setItem('token', data.token);
```

---

#### 2.3. Получить текущего пользователя

**Endpoint:** `GET /api/auth/me`

**Аутентификация:** Требуется

**Успешный ответ (200):**
```json
{
  "user": {
    "id": "clx123...",
    "email": "user@example.com",
    "name": "Имя Пользователя",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Ошибки:**
- `401` - Токен доступа отсутствует / Недействительный токен
- `404` - Пользователь не найден
- `500` - Ошибка при получении пользователя

**Пример использования:**
```typescript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/api/auth/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const data = await response.json();
```

---

### 3. Списки покупок

Все эндпоинты требуют аутентификации.

#### 3.1. Получить все списки

**Endpoint:** `GET /api/lists`

**Аутентификация:** Требуется

**Успешный ответ (200):**
```json
{
  "lists": [
    {
      "id": "clx123...",
      "name": "Список покупок на неделю",
      "description": "Основные продукты",
      "userId": "clx456...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "items": [
        {
          "id": "clx789...",
          "name": "Молоко",
          "quantity": 2,
          "unit": "л",
          "completed": false,
          "listId": "clx123...",
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  ]
}
```

**Ошибки:**
- `401` - Токен доступа отсутствует / Недействительный токен
- `500` - Ошибка при получении списков

**Пример использования:**
```typescript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/api/lists', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const data = await response.json();
const lists = data.lists;
```

---

#### 3.2. Получить один список

**Endpoint:** `GET /api/lists/:id`

**Аутентификация:** Требуется

**Параметры URL:**
- `id` - ID списка (обязательный)

**Успешный ответ (200):**
```json
{
  "list": {
    "id": "clx123...",
    "name": "Список покупок на неделю",
    "description": "Основные продукты",
    "userId": "clx456...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "items": [...]
  }
}
```

**Ошибки:**
- `400` - ID списка обязателен
- `401` - Токен доступа отсутствует / Недействительный токен
- `404` - Список не найден
- `500` - Ошибка при получении списка

**Пример использования:**
```typescript
const listId = 'clx123...';
const token = localStorage.getItem('token');

const response = await fetch(`http://localhost:3000/api/lists/${listId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const data = await response.json();
const list = data.list;
```

---

#### 3.3. Создать список

**Endpoint:** `POST /api/lists`

**Аутентификация:** Требуется

**Тело запроса:**
```json
{
  "name": "Список покупок на неделю",
  "description": "Основные продукты",
  "items": [
    {
      "name": "Молоко",
      "quantity": 2,
      "unit": "л",
      "completed": false
    },
    {
      "name": "Хлеб",
      "quantity": 1,
      "unit": "шт."
    }
  ]
}
```

**Валидация:**
- `name` - обязательное, от 1 до 100 символов
- `description` - опциональное, максимум 500 символов
- `items` - опциональное, массив товаров
  - `items[].name` - опциональное, от 1 до 200 символов
  - `items[].quantity` - опциональное, положительное число (по умолчанию 1)
  - `items[].unit` - опциональное, максимум 20 символов (по умолчанию "шт.")

**Успешный ответ (201):**
```json
{
  "list": {
    "id": "clx123...",
    "name": "Список покупок на неделю",
    "description": "Основные продукты",
    "userId": "clx456...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "items": [...]
  }
}
```

**Ошибки:**
- `400` - Название списка обязательно / Ошибка валидации
- `401` - Токен доступа отсутствует / Недействительный токен
- `500` - Ошибка при создании списка

**Пример использования:**
```typescript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/api/lists', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    name: 'Список покупок на неделю',
    description: 'Основные продукты',
    items: [
      { name: 'Молоко', quantity: 2, unit: 'л' },
      { name: 'Хлеб', quantity: 1, unit: 'шт.' },
    ],
  }),
});

const data = await response.json();
const newList = data.list;
```

---

#### 3.4. Обновить список

**Endpoint:** `PUT /api/lists/:id`

**Аутентификация:** Требуется

**Параметры URL:**
- `id` - ID списка (обязательный)

**Тело запроса:**
```json
{
  "name": "Обновленное название",
  "description": "Обновленное описание"
}
```

**Валидация:**
- `name` - опциональное, от 1 до 100 символов
- `description` - опциональное, максимум 500 символов

**Успешный ответ (200):**
```json
{
  "list": {
    "id": "clx123...",
    "name": "Обновленное название",
    "description": "Обновленное описание",
    "userId": "clx456...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T01:00:00.000Z",
    "items": [...]
  }
}
```

**Ошибки:**
- `400` - ID списка обязателен / Ошибка валидации
- `401` - Токен доступа отсутствует / Недействительный токен
- `404` - Список не найден
- `500` - Ошибка при обновлении списка

**Пример использования:**
```typescript
const listId = 'clx123...';
const token = localStorage.getItem('token');

const response = await fetch(`http://localhost:3000/api/lists/${listId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    name: 'Обновленное название',
    description: 'Обновленное описание',
  }),
});

const data = await response.json();
const updatedList = data.list;
```

---

#### 3.5. Удалить список

**Endpoint:** `DELETE /api/lists/:id`

**Аутентификация:** Требуется

**Параметры URL:**
- `id` - ID списка (обязательный)

**Успешный ответ (200):**
```json
{
  "message": "Список удален"
}
```

**Ошибки:**
- `400` - ID списка обязателен
- `401` - Токен доступа отсутствует / Недействительный токен
- `404` - Список не найден
- `500` - Ошибка при удалении списка

**Пример использования:**
```typescript
const listId = 'clx123...';
const token = localStorage.getItem('token');

const response = await fetch(`http://localhost:3000/api/lists/${listId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

if (response.ok) {
  console.log('Список удален');
}
```

---

### 4. Товары в списке

Все эндпоинты требуют аутентификации.

#### 4.1. Добавить товар в список

**Endpoint:** `POST /api/lists/:id/items`

**Аутентификация:** Требуется

**Параметры URL:**
- `id` - ID списка (обязательный)

**Тело запроса:**
```json
{
  "name": "Яйца",
  "quantity": 10,
  "unit": "шт."
}
```

**Валидация:**
- `name` - обязательное, от 1 до 200 символов
- `quantity` - опциональное, положительное число (по умолчанию 1)
- `unit` - опциональное, максимум 20 символов (по умолчанию "шт.")

**Успешный ответ (201):**
```json
{
  "item": {
    "id": "clx789...",
    "name": "Яйца",
    "quantity": 10,
    "unit": "шт.",
    "completed": false,
    "listId": "clx123...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Ошибки:**
- `400` - ID списка обязателен / Название товара обязательно / Ошибка валидации
- `401` - Токен доступа отсутствует / Недействительный токен
- `404` - Список не найден
- `500` - Ошибка при добавлении товара

**Пример использования:**
```typescript
const listId = 'clx123...';
const token = localStorage.getItem('token');

const response = await fetch(`http://localhost:3000/api/lists/${listId}/items`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    name: 'Яйца',
    quantity: 10,
    unit: 'шт.',
  }),
});

const data = await response.json();
const newItem = data.item;
```

---

#### 4.2. Обновить товар

**Endpoint:** `PUT /api/lists/:id/items/:itemId`

**Аутентификация:** Требуется

**Параметры URL:**
- `id` - ID списка (обязательный)
- `itemId` - ID товара (обязательный)

**Тело запроса:**
```json
{
  "name": "Обновленное название",
  "quantity": 5,
  "unit": "кг",
  "completed": true
}
```

**Валидация:**
- `name` - опциональное, от 1 до 200 символов
- `quantity` - опциональное, положительное число
- `unit` - опциональное, максимум 20 символов
- `completed` - опциональное, boolean

**Успешный ответ (200):**
```json
{
  "item": {
    "id": "clx789...",
    "name": "Обновленное название",
    "quantity": 5,
    "unit": "кг",
    "completed": true,
    "listId": "clx123...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T01:00:00.000Z"
  }
}
```

**Ошибки:**
- `400` - ID списка/товара обязателен / Ошибка валидации
- `401` - Токен доступа отсутствует / Недействительный токен
- `404` - Список не найден / Товар не найден
- `500` - Ошибка при обновлении товара

**Пример использования:**
```typescript
const listId = 'clx123...';
const itemId = 'clx789...';
const token = localStorage.getItem('token');

const response = await fetch(`http://localhost:3000/api/lists/${listId}/items/${itemId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    name: 'Обновленное название',
    quantity: 5,
    unit: 'кг',
    completed: true,
  }),
});

const data = await response.json();
const updatedItem = data.item;
```

---

#### 4.3. Удалить товар

**Endpoint:** `DELETE /api/lists/:id/items/:itemId`

**Аутентификация:** Требуется

**Параметры URL:**
- `id` - ID списка (обязательный)
- `itemId` - ID товара (обязательный)

**Успешный ответ (200):**
```json
{
  "message": "Товар удален"
}
```

**Ошибки:**
- `400` - ID списка/товара обязателен
- `401` - Токен доступа отсутствует / Недействительный токен
- `404` - Список не найден / Товар не найден
- `500` - Ошибка при удалении товара

**Пример использования:**
```typescript
const listId = 'clx123...';
const itemId = 'clx789...';
const token = localStorage.getItem('token');

const response = await fetch(`http://localhost:3000/api/lists/${listId}/items/${itemId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

if (response.ok) {
  console.log('Товар удален');
}
```

---

#### 4.4. Переключить статус выполнения товара

**Endpoint:** `PATCH /api/lists/:id/items/:itemId/toggle`

**Аутентификация:** Требуется

**Параметры URL:**
- `id` - ID списка (обязательный)
- `itemId` - ID товара (обязательный)

**Успешный ответ (200):**
```json
{
  "item": {
    "id": "clx789...",
    "name": "Яйца",
    "quantity": 10,
    "unit": "шт.",
    "completed": true,
    "listId": "clx123...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T01:00:00.000Z"
  }
}
```

**Ошибки:**
- `400` - ID списка/товара обязателен
- `401` - Токен доступа отсутствует / Недействительный токен
- `404` - Список не найден / Товар не найден
- `500` - Ошибка при переключении статуса товара

**Пример использования:**
```typescript
const listId = 'clx123...';
const itemId = 'clx789...';
const token = localStorage.getItem('token');

const response = await fetch(`http://localhost:3000/api/lists/${listId}/items/${itemId}/toggle`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const data = await response.json();
const toggledItem = data.item;
```

---

## Коды ошибок

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 201 | Ресурс создан |
| 400 | Ошибка валидации / Неверные параметры запроса |
| 401 | Не авторизован / Токен отсутствует или недействителен |
| 403 | Доступ запрещен |
| 404 | Ресурс не найден |
| 500 | Внутренняя ошибка сервера |

## Формат ошибок

Все ошибки возвращаются в следующем формате:

```json
{
  "error": "Описание ошибки"
}
```

При ошибках валидации:

```json
{
  "error": "Ошибка валидации",
  "errors": [
    {
      "type": "field",
      "msg": "Некорректный email",
      "path": "email",
      "location": "body"
    }
  ]
}
```

---

## Пример API клиента (TypeScript)

```typescript
class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка запроса');
    }

    return response.json();
  }

  // Auth
  async register(email: string, password: string, name: string) {
    const data = await this.request<{ user: User; token: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      }
    );
    this.setToken(data.token);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<{ user: User; token: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    this.setToken(data.token);
    return data;
  }

  async getCurrentUser() {
    return this.request<{ user: User }>('/auth/me');
  }

  // Lists
  async getLists() {
    return this.request<{ lists: GroceryList[] }>('/lists');
  }

  async getList(id: string) {
    return this.request<{ list: GroceryList }>(`/lists/${id}`);
  }

  async createList(data: { name: string; description?: string; items?: any[] }) {
    return this.request<{ list: GroceryList }>('/lists', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateList(id: string, data: { name?: string; description?: string }) {
    return this.request<{ list: GroceryList }>(`/lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteList(id: string) {
    return this.request<{ message: string }>(`/lists/${id}`, {
      method: 'DELETE',
    });
  }

  // Items
  async addItem(listId: string, data: { name: string; quantity?: number; unit?: string }) {
    return this.request<{ item: GroceryItem }>(`/lists/${listId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateItem(listId: string, itemId: string, data: Partial<GroceryItem>) {
    return this.request<{ item: GroceryItem }>(`/lists/${listId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteItem(listId: string, itemId: string) {
    return this.request<{ message: string }>(`/lists/${listId}/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  async toggleItemStatus(listId: string, itemId: string) {
    return this.request<{ item: GroceryItem }>(`/lists/${listId}/items/${itemId}/toggle`, {
      method: 'PATCH',
    });
  }
}

// Использование
const api = new ApiClient();

// Регистрация
await api.register('user@example.com', 'password123', 'Имя');

// Получить списки
const { lists } = await api.getLists();

// Создать список
const { list } = await api.createList({
  name: 'Список покупок',
  description: 'Описание',
});

// Добавить товар
const { item } = await api.addItem(list.id, {
  name: 'Молоко',
  quantity: 2,
  unit: 'л',
});
```

---

## Примечания

1. **Токен аутентификации** сохраняется в `localStorage` и автоматически добавляется ко всем запросам, требующим аутентификации.

2. **Даты** возвращаются в формате ISO 8601 (например: `2024-01-01T00:00:00.000Z`).

3. **ID** генерируются автоматически и имеют формат CUID (например: `clx123abc456...`).

4. **Валидация** выполняется на сервере. Все ошибки валидации возвращаются с кодом `400`.

5. **CORS** настроен для работы с фронтендом на любом домене в режиме разработки.

6. **Токен действителен 7 дней** с момента выдачи. После истечения срока необходимо выполнить повторный вход.

