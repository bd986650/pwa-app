#!/bin/bash

# Скрипт для инициализации базы данных
# Используйте этот скрипт, если база данных не создается автоматически

echo "Ожидание запуска PostgreSQL..."
sleep 5

echo "Создание базы данных shoplist_db (если не существует)..."
docker exec -i shoplist-postgres psql -U shoplist -d postgres << EOF
SELECT 'CREATE DATABASE shoplist_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'shoplist_db')\gexec
EOF

echo "База данных готова!"
echo "Теперь можно запустить миграции: npm run db:migrate"

