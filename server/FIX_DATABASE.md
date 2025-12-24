# Исправление проблемы с базой данных

## Проблема

База данных `shoplist_db` не создается автоматически, появляется ошибка:
```
FATAL: database "shoplist" does not exist
```

## Решение

### Вариант 1: Пересоздать Docker volume (рекомендуется)

1. Остановите контейнер:
```bash
docker-compose down
```

2. Удалите volume с данными:
```bash
docker volume rm shoplist-server_postgres_data
```

3. Запустите заново:
```bash
docker-compose up -d
```

База данных `shoplist_db` создастся автоматически.

### Вариант 2: Создать базу данных вручную

1. Подключитесь к PostgreSQL:
```bash
docker exec -it shoplist-postgres psql -U shoplist -d postgres
```

2. Создайте базу данных:
```sql
CREATE DATABASE shoplist_db;
\q
```

3. Или используйте скрипт:
```bash
./init-db.sh
```

### Вариант 3: Проверить .env файл

Убедитесь, что в файле `.env` указано правильное имя базы данных:

```env
DATABASE_URL="postgresql://shoplist:shoplist_password@localhost:5432/shoplist_db?schema=public"
```

**Важно:** Имя базы данных должно быть `shoplist_db` (с `_db`), а не `shoplist`.

## После исправления

1. Примените миграции:
```bash
npm run db:migrate
```

2. Сгенерируйте Prisma Client:
```bash
npm run db:generate
```

3. Проверьте подключение:
```bash
npm run db:studio
```

