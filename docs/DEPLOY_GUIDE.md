## Deploy guide (локальный запуск / учебная практика)

### Требования

- **Node.js**: 18+ (рекомендуется 20+)
- **PostgreSQL**: 13+
- **Windows / Linux / macOS**

### Структура проекта

- `backend/` — Express API + PostgreSQL (`pg`)
- `frontend/` — React (Vite)

---

## 1) Подготовка базы данных PostgreSQL

### 1.1 Создать базу

Создай БД (пример):

- database: `Shop`
- user: `postgres`

### 1.2 Создать таблицы

Выполни SQL со схемой (которую ты использовал в ТЗ): `categories`, `brands`, `sizes`, `colors`, `products`, `product_variants`, `carts`, `cart_items`, `orders`, `order_items`.

### 1.3 Настроить переменные окружения backend

Файл: `backend/.env`

Пример:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=root
DB_NAME=Shop
```

---

## 2) Заполнение тестовыми данными

Сид-скрипт: `backend/seed.sql`

Запуск через psql (пример):

```bash
psql -h localhost -U postgres -d Shop -f backend/seed.sql
```

Важно: `seed.sql` делает `TRUNCATE ... RESTART IDENTITY CASCADE` (подходит для dev/учебной среды).

---

## 3) Запуск backend (API)

Перейти в папку:

```bash
cd backend
```

Установить зависимости:

```bash
npm install
```

Запустить:

```bash
npm run dev
```

API будет доступен по:

- `http://localhost:5000/api`

---

## 4) Запуск frontend

Перейти в папку:

```bash
cd frontend
```

Установить зависимости:

```bash
npm install
```

Запустить:

```bash
npm run dev
```

Открыть в браузере адрес, который покажет Vite (обычно):

- `http://localhost:5173`

---

## 5) Проверка работоспособности (минимальный прогон)

- Открыть каталог `/`
- Поставить фильтр по категории/бренду/размеру
- Открыть товар (клик по карточке → “Подробнее”)
- Выбрать вариант и добавить в корзину
- В корзине изменить количество, удалить позицию
- Нажать “Оформить заказ”
- Перейти в “Заказы” и открыть созданный заказ

---

## 6) Полезные ссылки в репозитории

- **OpenAPI**: `openapi.yaml`
- **Test plan (Cart)**: `docs/TEST_PLAN_CART.md`
- **Test summary report**: `docs/TEST_SUMMARY_REPORT.md`
