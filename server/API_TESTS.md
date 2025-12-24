# API Тесты - cURL запросы

Базовый URL: `http://localhost:3000`

**Важно:** Сохраните токен из ответа регистрации/входа и используйте его в заголовке `Authorization: Bearer <TOKEN>` для защищенных эндпоинтов.

---

## 1. Health Check

```bash
curl -X GET http://localhost:3000/api/health
```

---

## 2. Аутентификация

### 2.1. Регистрация

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Тестовый Пользователь"
  }'
```

**Ответ:** Сохраните `token` из ответа для последующих запросов.

### 2.2. Вход

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Ответ:** Сохраните `token` из ответа.

### 2.3. Получить текущего пользователя

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 3. Списки покупок

**Все запросы требуют токен в заголовке `Authorization: Bearer <TOKEN>`**

### 3.1. Получить все списки

```bash
curl -X GET http://localhost:3000/api/lists \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3.2. Получить один список по ID

```bash
curl -X GET http://localhost:3000/api/lists/LIST_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3.3. Создать новый список

```bash
curl -X POST http://localhost:3000/api/lists \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Список покупок на неделю",
    "description": "Основные продукты",
    "items": [
      {
        "name": "Молоко",
        "quantity": 2,
        "unit": "л"
      },
      {
        "name": "Хлеб",
        "quantity": 1,
        "unit": "шт."
      }
    ]
  }'
```

**Ответ:** Сохраните `id` списка из ответа для последующих запросов.

### 3.4. Обновить список

```bash
curl -X PUT http://localhost:3000/api/lists/LIST_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Обновленное название",
    "description": "Обновленное описание"
  }'
```

### 3.5. Удалить список

```bash
curl -X DELETE http://localhost:3000/api/lists/LIST_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 4. Товары в списке

**Все запросы требуют токен в заголовке `Authorization: Bearer <TOKEN>`**

### 4.1. Добавить товар в список

```bash
curl -X POST http://localhost:3000/api/lists/LIST_ID_HERE/items \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Яйца",
    "quantity": 10,
    "unit": "шт."
  }'
```

**Ответ:** Сохраните `id` товара из ответа для последующих запросов.

### 4.2. Обновить товар

```bash
curl -X PUT http://localhost:3000/api/lists/LIST_ID_HERE/items/ITEM_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Обновленное название товара",
    "quantity": 5,
    "unit": "кг",
    "completed": true
  }'
```

### 4.3. Удалить товар

```bash
curl -X DELETE http://localhost:3000/api/lists/LIST_ID_HERE/items/ITEM_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4.4. Переключить статус выполнения товара

```bash
curl -X PATCH http://localhost:3000/api/lists/LIST_ID_HERE/items/ITEM_ID_HERE/toggle \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Пример полного сценария тестирования

```bash
# 1. Проверка здоровья сервера
curl -X GET http://localhost:3000/api/health

# 2. Регистрация пользователя
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Тестовый Пользователь"
  }' | jq -r '.token')

echo "Token: $TOKEN"

# 3. Получить информацию о пользователе
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 4. Создать список
LIST_ID=$(curl -s -X POST http://localhost:3000/api/lists \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Список покупок",
    "description": "Тестовый список"
  }' | jq -r '.list.id')

echo "List ID: $LIST_ID"

# 5. Получить все списки
curl -X GET http://localhost:3000/api/lists \
  -H "Authorization: Bearer $TOKEN"

# 6. Получить один список
curl -X GET http://localhost:3000/api/lists/$LIST_ID \
  -H "Authorization: Bearer $TOKEN"

# 7. Добавить товар
ITEM_ID=$(curl -s -X POST http://localhost:3000/api/lists/$LIST_ID/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Молоко",
    "quantity": 2,
    "unit": "л"
  }' | jq -r '.item.id')

echo "Item ID: $ITEM_ID"

# 8. Обновить товар
curl -X PUT http://localhost:3000/api/lists/$LIST_ID/items/$ITEM_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }'

# 9. Переключить статус товара
curl -X PATCH http://localhost:3000/api/lists/$LIST_ID/items/$ITEM_ID/toggle \
  -H "Authorization: Bearer $TOKEN"

# 10. Удалить товар
curl -X DELETE http://localhost:3000/api/lists/$LIST_ID/items/$ITEM_ID \
  -H "Authorization: Bearer $TOKEN"

# 11. Удалить список
curl -X DELETE http://localhost:3000/api/lists/$LIST_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## Примечания

- Замените `YOUR_TOKEN_HERE` на реальный токен из ответа регистрации/входа
- Замените `LIST_ID_HERE` на реальный ID списка
- Замените `ITEM_ID_HERE` на реальный ID товара
- Для удобства можно использовать переменные окружения в bash:
  ```bash
  export TOKEN="your_token_here"
  export LIST_ID="your_list_id_here"
  export ITEM_ID="your_item_id_here"
  ```
- Для красивого вывода JSON используйте `jq`:
  ```bash
  curl ... | jq
  ```

