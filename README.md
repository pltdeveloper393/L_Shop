# Пояснительная записка

## Проект: IYHAN SHOP (L_Shop) — Интернет-магазин танков

---

## Содержание

1. [Введение](#1-введение)
2. [Архитектура проекта](#2-архитектура-проекта)
3. [API-документация (Backend)](#3-api-документация-backend)
   - 3.1. [Авторизация (Auth)](#31-авторизация-auth)
   - 3.2. [Каталог (Catalog)](#32-каталог-catalog)
   - 3.3. [Корзина (Cart)](#33-корзина-cart)
   - 3.4. [Доставка (Delivery)](#34-доставка-delivery)
4. [Типизация данных](#4-типизация-данных)
   - 4.1. [Типы серверной части](#41-типы-серверной-части)
   - 4.2. [Типы клиентской части](#42-типы-клиентской-части)
5. [JSDoc-документация функций](#5-jsdoc-документация-функций)
   - 5.1. [Серверные функции (Backend)](#51-серверные-функции-backend)
   - 5.2. [Клиентские функции (Frontend)](#52-клиентские-функции-frontend)
6. [Стандартизация компонентов Frontend](#6-стандартизация-компонентов-frontend)
7. [Структура JSON-файлов данных](#7-структура-json-файлов-данных)
8. [Инструкция по запуску](#8-инструкция-по-запуску)

---

## 1. Введение

**IYHAN SHOP** — это SPA (Single Page Application) интернет-магазин по продаже танков. Проект выполнен в рамках лабораторных работ по дисциплине «Веб-программирование».

### Участники команды

| Роль | GitHub |
|------|--------|
| Разработчик 1 | [@Idhenxysvs](https://github.com/Idhenxysvs) |
| Разработчик 2 | [@Fitzowski](https://github.com/Fitzowski) |
| Разработчик 3 | [@pltdeveloper393](https://github.com/pltdeveloper393) |
| Разработчик 4 | [@rxxksyan](https://github.com/rxxksyan) |

### Технологический стек

| Компонент | Технологии |
|-----------|------------|
| Бэкенд | Node.js, Express.js, TypeScript |
| Фронтенд | HTML5, CSS3, TypeScript (SPA) |
| Хранение данных | Файловая система (JSON-файлы) |
| Сессии | express-session |
| Хеширование паролей | bcrypt |

---

## 2. Архитектура проекта

```
L_Shop/
├── server/                         # Бэкенд (Node.js + Express)
│   ├── index.ts                     # Главный сервер (точка входа)
│   ├── routes/                      # Маршруты API
│   │   ├── auth.ts                  # Маршруты авторизации
│   │   ├── route_catalog.ts         # Маршруты каталога
│   │   ├── route_cart.ts            # Маршруты корзины
│   │   └── route_delivery.ts        # Маршруты доставки
│   ├── controllers/                 # Логика обработки запросов
│   │   ├── authController.ts        # Контроллер авторизации
│   │   ├── controller_catalog.ts    # Контроллер каталога
│   │   ├── controller_cart.ts       # Контроллер корзины
│   │   └── controller_delivery.ts   # Контроллер доставки
│   ├── models/                      # Работа с данными
│   │   ├── UserModel.ts             # Модель пользователя
│   │   ├── ProductModel_catalog.ts  # Модель товара
│   │   ├── CartModel_cart.ts        # Модель корзины
│   │   └── DeliveryModel_delivery.ts # Модель доставки
│   └── middleware/                  # Промежуточные обработчики
│       └── authMiddleware.ts        # Middleware авторизации
│
├── src/                            # Клиентский TypeScript
│   ├── main.ts                      # Точка входа
│   ├── router.ts                    # SPA роутер
│   ├── pages/                       # TS страницы с HTML
│   │   ├── HomePage.ts              # Главная (неавторизованный)
│   │   ├── LoginPage.ts             # Вход
│   │   ├── RegisterPage.ts          # Регистрация
│   │   ├── MainPage.ts              # Главная (авторизованный)
│   │   ├── ProfilePage.ts           # Профиль
│   │   ├── CatalogPage_catalog.ts   # Каталог
│   │   ├── CartPage_cart.ts         # Корзина
│   │   └── DeliveryPage_delivery.ts # Доставка
│   ├── services/                    # Взаимодействие с сервером
│   │   ├── api.ts                   # API авторизации
│   │   ├── api_catalog.ts           # API каталога
│   │   ├── api_cart.ts              # API корзины
│   │   └── api_delivery.ts          # API доставки
│   └── types/                       # Общие типы
│       ├── index.ts                 # Типы авторизации
│       ├── index_catalog.ts         # Типы каталога
│       ├── index_cart.ts            # Типы корзины
│       └── index_delivery.ts        # Типы доставки
│
├── public/                         # Статика (доступно браузеру)
│   ├── index.html                   # HTML страница SPA
│   ├── styles.css                   # Общие стили
│   ├── *-page.css                   # Стили страниц
│   ├── js/                          # Скомпилированный JS
│   └── images/                      # Изображения
│
├── tanks.json                       # Данные товаров
├── users.json                       # Учётные записи
├── deliveries.json                  # Заказы и доставки
├── carts.json                       # Корзины пользователей
├── package.json                     # Зависимости
├── tsconfig.json                    # Настройки TS сервера
└── tsconfig.client.json             # Настройки TS клиента
```

### Архитектурная схема взаимодействия

```
Браузер (SPA)                Сервер (Express)
┌──────────────────┐        ┌───────────────────────┐
│  Router (SPA)    │        │  app.use('/api/...')  │
│  ┌───────────┐   │  fetch │  ┌───────────────┐    │
│  │ Pages     │───┼────────┼─▶│ Routes         │   │
│  └───────────┘   │        │  └───────┬───────┘    │
│  ┌───────────┐   │        │          ▼            │
│  │ Services  │◀──┼─────── ┼── Controllers        │
│  └───────────┘   │        │  ┌───────────────┐    │
│  ┌───────────┐   │        │  │ Models        │    │
│  │ Types     │   │        │  └───────┬───────┘    │
│  └───────────┘   │        │          ▼            │
└──────────────────┘        │    JSON-файлы         │
                            └───────────────────────┘
```

---

## 3. API-документация (Backend)

Базовый URL: `http://localhost:3000/api`

### 3.1. Авторизация (Auth)

**Базовый путь:** `/api/auth`

---

#### `POST /api/auth/register` — Регистрация нового пользователя

**Описание:** Создаёт новую учётную запись пользователя с указанными данными.

**Middleware:** Нет (публичный доступ)

**Request Body:**
```json
{
  "nickname": "string (обязательно)",
  "email": "string (обязательно)",
  "password": "string (обязательно)",
  "phone": "string (опционально)"
}
```

**Успешный ответ (201):**
```json
{
  "message": "Регистрация прошла успешно",
  "user": {
    "id": "string",
    "nickname": "string",
    "email": "string",
    "phone": "string | undefined"
  }
}
```

**Ошибки:**
| Код | Описание |
|-----|----------|
| 400 | Не заполнены обязательные поля |
| 400 | Email уже занят |
| 400 | Никнейм уже занят |
| 500 | Внутренняя ошибка сервера |

---

#### `POST /api/auth/login` — Вход в аккаунт

**Описание:** Аутентификация пользователя по email и паролю, создание сессии.

**Middleware:** Нет (публичный доступ)

**Request Body:**
```json
{
  "email": "string (обязательно)",
  "password": "string (обязательно)"
}
```

**Успешный ответ (200):**
```json
{
  "message": "Авторизация прошла успешно",
  "user": {
    "id": "string",
    "nickname": "string",
    "email": "string"
  }
}
```

**Ошибки:**
| Код | Описание |
|-----|----------|
| 400 | Email и пароль обязательны |
| 401 | Неверный email или пароль |
| 500 | Внутренняя ошибка сервера |

---

#### `GET /api/auth/me` — Получение текущего пользователя

**Описание:** Возвращает данные авторизованного пользователя по ID из сессии.

**Middleware:** `requireAuth` (требуется авторизация)

**Успешный ответ (200):**
```json
{
  "user": {
    "id": "string",
    "nickname": "string",
    "email": "string",
    "createdAt": "string (ISO date)"
  }
}
```

**Ошибки:**
| Код | Описание |
|-----|----------|
| 401 | Пользователь не аутентифицирован |
| 401 | Пользователь не найден |
| 500 | Внутренняя ошибка сервера |

---

#### `POST /api/auth/logout` — Выход из аккаунта

**Описание:** Завершает текущую сессию пользователя.

**Middleware:** Нет

**Успешный ответ (200):**
```json
{
  "message": "Выход выполнен успешно"
}
```

---

#### `POST /api/auth/change-password` — Смена пароля

**Описание:** Меняет пароль пользователя при условии корректного старого пароля. После успешной смены сессия завершается.

**Middleware:** `requireAuth` (требуется авторизация)

**Request Body:**
```json
{
  "oldPassword": "string (обязательно)",
  "newPassword": "string (обязательно, минимум 6 символов)"
}
```

**Успешный ответ (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Ошибки:**
| Код | Описание |
|-----|----------|
| 400 | Не указан старый или новый пароль |
| 400 | Новый пароль короче 6 символов |
| 400 | Старый пароль неверен |
| 401 | Пользователь не аутентифицирован |
| 404 | Пользователь не найден |
| 500 | Внутренняя ошибка сервера |

---

### 3.2. Каталог (Catalog)

**Базовый путь:** `/api/catalog`

---

#### `GET /api/catalog` — Получение списка товаров

**Описание:** Возвращает список всех товаров с возможностью фильтрации и сортировки.

**Query Parameters (все опциональные):**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `search` | string | Поиск по названию/описанию |
| `nation` | string | Фильтр по нации (например `ussr`, `germany`) |
| `type` | string | Фильтр по типу (`heavy`, `medium`, `light`, `at`) |
| `level` | number | Фильтр по уровню (1–10) |
| `inStock` | boolean | Только в наличии (`true`) |
| `sortBy` | string | Сортировка: `price-asc` (по возрастанию) / `price-desc` (по убыванию) |

**Успешный ответ (200):**
```json
{
  "products": [
    {
      "id": "number",
      "name": "string",
      "nation": "string",
      "type": "string",
      "level": "number",
      "img": "string",
      "price": "number",
      "inStock": "boolean",
      "hp": "string",
      "dmg": "string",
      "dpm": "string",
      "ptrs": "string",
      "ptrp": "string",
      "spw": "string",
      "description": "string | undefined"
    }
  ]
}
```

---

#### `GET /api/catalog/:id` — Получение товара по ID

**Описание:** Возвращает конкретный товар по его идентификатору.

**Path Parameters:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `id` | number | ID товара |

**Успешный ответ (200):**
```json
{
  "product": { "...Product" }
}
```

**Ошибки:**
| Код | Описание |
|-----|----------|
| 400 | Некорректный ID товара |
| 404 | Товар не найден |
| 500 | Внутренняя ошибка сервера |

---

#### `GET /api/catalog/filters` — Получение доступных фильтров

**Описание:** Возвращает уникальные значения наций, типов и уровней для построения фильтров на клиенте.

**Успешный ответ (200):**
```json
{
  "filters": {
    "nations": ["string"],
    "types": ["string"],
    "levels": ["number"]
  }
}
```

---

#### `GET /api/catalog/search` — Поиск товаров

**Описание:** Поиск товаров по поисковому запросу (по названию и описанию).

**Query Parameters:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `q` | string | Поисковый запрос (обязательно) |

**Успешный ответ (200):**
```json
{
  "products": [ "...Product" ]
}
```

**Ошибки:**
| Код | Описание |
|-----|----------|
| 400 | Не указан поисковый запрос |
| 500 | Внутренняя ошибка сервера |

---

### 3.3. Корзина (Cart)

**Базовый путь:** `/api/cart`

---

#### `GET /api/cart` — Получение корзины

**Описание:** Возвращает корзину текущего авторизованного пользователя с общей суммой.

**Middleware:** `requireAuth` (требуется авторизация)

**Успешный ответ (200):**
```json
{
  "cart": {
    "userId": "string",
    "items": [
      {
        "productId": "number",
        "quantity": "number",
        "product": { "...Product" }
      }
    ],
    "updatedAt": "string (ISO date)"
  },
  "total": "number"
}
```

---

#### `GET /api/cart/count` — Количество товаров в корзине

**Описание:** Возвращает общее количество единиц товаров в корзине.

**Успешный ответ (200):**
```json
{
  "count": "number"
}
```

---

#### `POST /api/cart` — Добавление товара в корзину

**Описание:** Добавляет указанный товар в корзину. Если товар уже есть — увеличивает количество.

**Middleware:** `requireAuth` (требуется авторизация)

**Request Body:**
```json
{
  "productId": "number (обязательно)",
  "quantity": "number (опционально, по умолчанию 1)"
}
```

**Успешный ответ (200):**
```json
{
  "message": "Товар добавлен в корзину",
  "cart": { "...Cart" },
  "total": "number"
}
```

---

#### `PUT /api/cart` — Обновление количества товара

**Описание:** Обновляет количество указанного товара в корзине.

**Middleware:** `requireAuth` (требуется авторизация)

**Request Body:**
```json
{
  "productId": "number (обязательно)",
  "quantity": "number (обязательно)"
}
```

**Успешный ответ (200):**
```json
{
  "message": "Количество обновлено",
  "cart": { "...Cart" },
  "total": "number"
}
```

---

#### `DELETE /api/cart/:productId` — Удаление товара из корзины

**Описание:** Удаляет конкретный товар из корзины пользователя.

**Middleware:** `requireAuth` (требуется авторизация)

**Path Parameters:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `productId` | number | ID товара |

**Успешный ответ (200):**
```json
{
  "message": "Товар удалён из корзины",
  "cart": { "...Cart" },
  "total": "number"
}
```

---

#### `DELETE /api/cart` — Очистка корзины

**Описание:** Полностью очищает корзину пользователя.

**Middleware:** `requireAuth` (требуется авторизация)

**Успешный ответ (200):**
```json
{
  "message": "Корзина очищена"
}
```

---

### 3.4. Доставка (Delivery)

**Базовый путь:** `/api/delivery`

---

#### `GET /api/delivery` — Получение доставок пользователя

**Описание:** Возвращает список всех доставок текущего авторизованного пользователя (отсортированных по дате создания — сначала новые).

**Middleware:** `requireAuth` (требуется авторизация)

**Успешный ответ (200):**
```json
{
  "deliveries": [
    {
      "id": "string",
      "userId": "string",
      "items": [
        {
          "productId": "number",
          "productName": "string",
          "productImg": "string",
          "quantity": "number",
          "price": "number"
        }
      ],
      "totalPrice": "number",
      "address": "string",
      "phone": "string",
      "email": "string",
      "paymentMethod": "card | cash",
      "status": "pending | processing | completed | cancelled",
      "createdAt": "string (ISO date)"
    }
  ]
}
```

---

#### `POST /api/delivery` — Создание доставки

**Описание:** Создаёт новый заказ на основе текущей корзины пользователя, после чего очищает корзину.

**Middleware:** `requireAuth` (требуется авторизация)

**Request Body:**
```json
{
  "address": "string (обязательно)",
  "phone": "string (обязательно)",
  "email": "string (обязательно)",
  "paymentMethod": "card | cash (обязательно)"
}
```

**Успешный ответ (201):**
```json
{
  "message": "Доставка оформлена успешно",
  "delivery": { "...Delivery" }
}
```

**Ошибки:**
| Код | Описание |
|-----|----------|
| 400 | Не все поля заполнены |
| 400 | Некорректный способ оплаты |
| 500 | Корзина пуста |
| 500 | Внутренняя ошибка сервера |

---

#### `GET /api/delivery/:id` — Получение доставки по ID

**Описание:** Возвращает конкретную доставку по ID, если она принадлежит текущему пользователю.

**Middleware:** `requireAuth` (требуется авторизация)

**Path Parameters:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `id` | string | UUID доставки |

**Успешный ответ (200):**
```json
{
  "delivery": { "...Delivery" }
}
```

**Ошибки:**
| Код | Описание |
|-----|----------|
| 401 | Не авторизован |
| 403 | Нет доступа к этой доставке |
| 404 | Доставка не найдена |
| 500 | Внутренняя ошибка сервера |

---

#### `DELETE /api/delivery/:id` — Отмена доставки

**Описание:** Отменяет доставку, если она находится в статусе `pending`.

**Middleware:** `requireAuth` (требуется авторизация)

**Path Parameters:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `id` | string | UUID доставки |

**Успешный ответ (200):**
```json
{
  "message": "Доставка отменена",
  "delivery": { "...Delivery" }
}
```

**Ошибки:**
| Код | Описание |
|-----|----------|
| 500 | Доставка не найдена / Невозможно отменить |

---

## 4. Типизация данных

### 4.1. Типы серверной части

Типы определены непосредственно в моделях `server/models/`.

#### User (UserModel.ts)
```typescript
interface User {
  id: string;
  nickname: string;
  email: string;
  phone?: string;
  passwordHash: string;
  createdAt: string;
}
```

#### Product (ProductModel_catalog.ts)
```typescript
interface Product {
  id: number;
  name: string;
  nation: string;
  type: string;
  level: number;
  img: string;
  price: number;
  inStock: boolean;
  hp: string;
  dmg: string;
  dpm: string;
  ptrs: string;
  ptrp: string;
  spw: string;
  description?: string;
}

interface ProductFilters {
  search?: string;
  nation?: string;
  type?: string;
  level?: number;
  inStock?: boolean;
  sortBy?: 'price-asc' | 'price-desc';
}
```

#### Cart (CartModel_cart.ts)
```typescript
interface CartItem {
  productId: number;
  quantity: number;
  product: Product;
}

interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}
```

#### Delivery (DeliveryModel_delivery.ts)
```typescript
interface DeliveryItem {
  productId: number;
  productName: string;
  productImg: string;
  quantity: number;
  price: number;
}

interface Delivery {
  id: string;
  userId: string;
  items: DeliveryItem[];
  totalPrice: number;
  address: string;
  phone: string;
  email: string;
  paymentMethod: 'card' | 'cash';
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

interface DeliveryFormData {
  address: string;
  phone: string;
  email: string;
  paymentMethod: 'card' | 'cash';
}
```

### 4.2. Типы клиентской части

Типы находятся в `src/types/` и дублируют серверные структуры для обеспечения type-safe запросов.

#### Auth (`src/types/index.ts`)
```typescript
interface User {
  id: string;
  nickname: string;
  email: string;
  phone?: string;
  createdAt?: string;
}

interface AuthResponse {
  message?: string;
  user: User;
}
```

#### Catalog (`src/types/index_catalog.ts`)
```typescript
interface Product {
  id: number;
  name: string;
  nation: string;
  type: string;
  level: number;
  img: string;
  price: number;
  inStock: boolean;
  hp: string;
  dmg: string;
  dpm: string;
  ptrs: string;
  ptrp: string;
  spw: string;
  description?: string;
}

interface ProductFilters {
  nations: string[];
  types: string[];
  levels: number[];
}

interface ProductsResponse {
  products: Product[];
}

interface ProductResponse {
  product: Product;
}

interface FiltersResponse {
  filters: ProductFilters;
}
```

#### Cart (`src/types/index_cart.ts`)
```typescript
interface CartItem {
  productId: number;
  quantity: number;
  product: Product;
}

interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

interface CartResponse {
  cart: Cart | { items: CartItem[] };
  total: number;
  message?: string;
}

interface CartCountResponse {
  count: number;
}
```

#### Delivery (`src/types/index_delivery.ts`)
```typescript
interface DeliveryItem {
  productId: number;
  productName: string;
  productImg: string;
  quantity: number;
  price: number;
}

interface Delivery {
  id: string;
  userId: string;
  items: DeliveryItem[];
  totalPrice: number;
  address: string;
  phone: string;
  email: string;
  paymentMethod: 'card' | 'cash';
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

interface DeliveryFormData {
  address: string;
  phone: string;
  email: string;
  paymentMethod: 'card' | 'cash';
}

interface DeliveriesResponse {
  deliveries: Delivery[];
}

interface DeliveryResponse {
  delivery: Delivery;
  message?: string;
}
```

---

## 5. JSDoc-документация функций

### 5.1. Серверные функции (Backend)

#### Middleware

**`requireAuth(req, res, next)`** — Middleware, проверяющий наличие userId в сессии. При отсутствии возвращает 401.

**`getUserId(req)`** — Вспомогательная функция, извлекающая userId из сессии запроса. Возвращает `string | undefined`.

#### Auth Controller

| Функция | Описание |
|---------|----------|
| `register(req, res)` | Регистрация нового пользователя. Принимает `{ nickname, email, password, phone }`. Проверяет уникальность email и nickname, создаёт запись, устанавливает сессию. |
| `login(req, res)` | Аутентификация пользователя. Принимает `{ email, password }`. Сравнивает хеш пароля с bcrypt. |
| `getMe(req, res)` | Получение данных авторизованного пользователя из сессии. |
| `logout(req, res)` | Завершение сессии пользователя. |
| `changePassword(req, res)` | Смена пароля. Требует `{ oldPassword, newPassword }`. После успешной смены уничтожает сессию. |

#### Catalog Controller

| Функция | Описание |
|---------|----------|
| `getProducts(req, res)` | Получение товаров с фильтрацией. Принимает query params: `search`, `nation`, `type`, `level`, `inStock`, `sortBy`. |
| `getProduct(req, res)` | Получение товара по ID из params. |
| `getFilters(req, res)` | Получение доступных значений фильтров (нации, типы, уровни). |
| `searchProducts(req, res)` | Поиск товаров по текстовому запросу `q`. |

#### Cart Controller

| Функция | Описание |
|---------|----------|
| `getCart(req, res)` | Получение корзины текущего пользователя с общей суммой. |
| `addItemToCart(req, res)` | Добавление товара в корзину. Принимает `{ productId, quantity }`. |
| `updateItemQuantity(req, res)` | Обновление количества товара. Принимает `{ productId, quantity }`. |
| `removeItemFromCart(req, res)` | Удаление товара из корзины по `productId` из params. |
| `clearUserCart(req, res)` | Очистка всей корзины пользователя. |
| `getCartItemCount(req, res)` | Получение общего количества единиц товаров в корзине. |

#### Delivery Controller

| Функция | Описание |
|---------|----------|
| `getDeliveries(req, res)` | Получение списка доставок пользователя (сортировка по дате). |
| `getDelivery(req, res)` | Получение доставки по ID с проверкой принадлежности пользователю. |
| `createNewDelivery(req, res)` | Создание доставки из корзины. Принимает `{ address, phone, email, paymentMethod }`. |
| `cancelDeliveryById(req, res)` | Отмена доставки по ID (только в статусе `pending`). |

#### User Model

| Функция | Описание |
|---------|----------|
| `readUsers()` | Читает и возвращает массив пользователей из `users.json`. |
| `writeUsers(users)` | Записывает массив пользователей в `users.json`. |
| `findUserByEmail(email)` | Поиск пользователя по email. |
| `findUserByNickname(nickname)` | Поиск пользователя по nickname. |
| `createUser(nickname, email, password, phone?)` | Создаёт нового пользователя с хешированием пароля через bcrypt. |

#### Product Model

| Функция | Описание |
|---------|----------|
| `readProducts()` | Читает товары из `tanks.json`. |
| `getAllProducts()` | Возвращает все товары. |
| `getProductById(id)` | Поиск товара по ID. |
| `getFilteredProducts(filters)` | Фильтрация товаров по переданным критериям (search, nation, type, level, inStock, sortBy). |
| `getAvailableNations()` | Получение уникальных значений наций. |
| `getAvailableTypes()` | Получение уникальных значений типов. |
| `getAvailableLevels()` | Получение уникальных значений уровней с сортировкой. |

#### Cart Model

| Функция | Описание |
|---------|----------|
| `readCarts()` | Читает корзины из `carts.json`. |
| `writeCarts(carts)` | Записывает корзины в `carts.json`. |
| `getCartByUserId(userId)` | Поиск корзины по ID пользователя. |
| `createCart(userId)` | Создание новой пустой корзины для пользователя. |
| `getOrCreateCart(userId)` | Получение или создание корзины. |
| `addToCart(userId, productId, quantity?)` | Добавление товара в корзину (с проверкой существования товара). |
| `updateCartItemQuantity(userId, productId, quantity)` | Обновление количества товара. При quantity <= 0 удаляет товар. |
| `removeFromCart(userId, productId)` | Удаление товара из корзины. |
| `clearCart(userId)` | Очистка корзины пользователя. |
| `getCartTotal(userId)` | Вычисление общей суммы корзины. |

#### Delivery Model

| Функция | Описание |
|---------|----------|
| `readDeliveries()` | Читает доставки из `deliveries.json`. |
| `writeDeliveries(deliveries)` | Записывает доставки в `deliveries.json`. |
| `getDeliveriesByUserId(userId)` | Получение доставок пользователя (сортировка по убыванию даты). |
| `getDeliveryById(id)` | Поиск доставки по ID. |
| `createDelivery(userId, formData)` | Создание доставки из корзины с последующей очисткой корзины. |
| `updateDeliveryStatus(id, status)` | Обновление статуса доставки. |
| `cancelDelivery(id, userId)` | Отмена доставки (только если статус `pending`). |

---

### 5.2. Клиентские функции (Frontend)

#### Router (`src/router.ts`)

| Метод | Описание |
|-------|----------|
| `Router.addRoute(path, handler)` | Регистрирует обработчик для указанного маршрута. |
| `Router.navigateTo(path)` | Выполняет навигацию на указанный путь (pushState + обработка). |
| `Router.start()` | Запускает роутер, обрабатывая текущий URL. |
| `Router.handleRoute()` (private) | Обрабатывает текущий маршрут — вызывает соответствующий handler. |

#### API Services

**`api` (`src/services/api.ts`)** — Сервис для работы с эндпоинтами авторизации:
- `api.register(nickname, email, password, phone?)` — регистрация
- `api.login(email, password)` — вход
- `api.getMe()` — получение текущего пользователя
- `api.logout()` — выход
- `api.changePassword(oldPassword, newPassword)` — смена пароля

**`apiCatalog` (`src/services/api_catalog.ts`)** — Сервис для работы с каталогом:
- `apiCatalog.getProducts(params?)` — получение товаров с фильтрацией
- `apiCatalog.getProduct(id)` — получение товара по ID
- `apiCatalog.getFilters()` — получение фильтров
- `apiCatalog.searchProducts(query)` — поиск товаров

**`apiCart` (`src/services/api_cart.ts`)** — Сервис для работы с корзиной:
- `apiCart.getCart()` — получение корзины
- `apiCart.getCartCount()` — количество товаров
- `apiCart.addToCart(productId, quantity?)` — добавление товара
- `apiCart.updateQuantity(productId, quantity)` — обновление количества
- `apiCart.removeFromCart(productId)` — удаление товара
- `apiCart.clearCart()` — очистка корзины

**`apiDelivery` (`src/services/api_delivery.ts`)** — Сервис для работы с доставкой:
- `apiDelivery.getDeliveries()` — получение списка доставок
- `apiDelivery.getDelivery(id)` — получение доставки по ID
- `apiDelivery.createDelivery(formData)` — создание доставки
- `apiDelivery.cancelDelivery(id)` — отмена доставки

#### Утилитарные функции страниц

**CatalogPage_catalog.ts:**
- `getNationName(nation)` — преобразование кода нации в русское название (например `ussr` → `СССР`)
- `getTypeName(type)` — преобразование кода типа в русское название (`heavy` → `ТТ`, `medium` → `СТ`, `light` → `ЛТ`, `at` → `ПТ`)
- `openModal(productId)` — открытие модального окна с детальной информацией о товаре
- `closeModal()` — закрытие модального окна
- `renderProductCard(product)` — генерация HTML карточки товара
- `renderModalContent(product)` — генерация HTML содержимого модального окна
- `applyFilters()` — применение текущих фильтров и обновление списка товаров
- `showNotification(message)` — отображение уведомления
- `updateCartBadge()` — обновление счётчика корзины

**CartPage_cart.ts:**
- `renderCartItem(item)` — генерация HTML строки элемента корзины
- `refreshCartDisplay()` — обновление отображения корзины (сумма, количество)
- `getNationName(nation)` / `getTypeName(type)` — аналогично каталогу

**DeliveryPage_delivery.ts:**
- `generateCaptcha()` — генерация случайного математического выражения для проверки
- `showSuccessMessage(deliveryId)` — отображение страницы успешного заказа

**MainPage.ts:**
- `showNotification(message)` — отображение уведомления о добавлении в корзину
- `startSimpleTimer()` — запуск таймера обратного отсчёта до конца дня

**HomePage.ts:**
- `renderNotAuth(app)` — отображение контента для неавторизованных пользователей
- `animateCounter()` — анимация счётчика довольных командиров
- `animateMetrics()` — анимация метрик на hero-секции

**RegisterPage.ts:**
- `showNotification(message, isError)` — кастомное уведомление
- `checkPasswordMatch()` — проверка совпадения паролей в реальном времени

**ProfilePage.ts:**
- Функционал отображения/скрытия email (toggle)

---

## 6. Стандартизация компонентов Frontend

Для обеспечения единообразия интерфейса и упрощения поддержки в проекте используются переиспользуемые CSS-классы, определённые в `public/styles.css` и применяемые во всех страницах:

### Кнопки

| Класс | Назначение | Применение |
|-------|------------|------------|
| `.wot-btn` | Базовая кнопка | Все кнопки по умолчанию |
| `.wot-btn-primary` | Основная кнопка (акцентная) | Каталог, Корзина, Оформление |
| `.wot-btn-secondary` | Вторичная кнопка | Альтернативные действия |
| `.wot-btn-small` | Маленькая кнопка | Кнопка "Показать email" в профиле |
| `.auth-btn` | Кнопка в формах авторизации | Войти, Зарегистрироваться |
| `.back-btn` | Кнопка "Назад" | Возврат на главную |

### Поля ввода

| Класс | Назначение | Применение |
|-------|------------|------------|
| `.wot-input` | Текстовое поле ввода | Все input'ы в проекте |
| `.wot-select` | Выпадающий список | Фильтры каталога |
| `.wot-label` | Подпись поля | Все label'ы форм |
| `.wot-input-group` | Группа полей ввода | Контейнер для label + input |

### Карточки

| Класс | Назначение | Применение |
|-------|------------|------------|
| `.wot-card` | Базовая карточка | Профиль (информация, пароль) |
| `.wot-card-header` | Заголовок карточки | |
| `.wot-card-body` | Тело карточки | |
| `.wot-card-title` | Заголовок внутри карточки | |
| `.product-card` | Карточка товара в каталоге | |
| `.tank-sale-card` | Карточка танка в топе продаж | MainPage |
| `.advantage-card` | Карточка преимущества | HomePage, MainPage |
| `.review-card` | Карточка отзыва | HomePage |
| `.news-card` | Карточка новости | MainPage |

### Навигация

| Компонент | Описание |
|-----------|----------|
| `.shop-header` | Верхняя панель с логотипом и навигацией |
| `.header-left` | Левая часть хедера (логотип, приветствие) |
| `.header-right` | Правая часть хедера (кнопки навигации) |
| `.shop-title` | Логотип магазина |
| `.shop-footer` | Нижний колонтитул |

### Другие переиспользуемые компоненты

| Компонент | Описание |
|-----------|----------|
| `.quantity-selector` | Селектор количества (кнопки - / +) |
| `.notification` | Всплывающее уведомление |
| `.modal-overlay` / `.modal-content` | Модальное окно (каталог) |
| `.cart-badge` | Бейдж счётчика корзины |
| `.badge` | Бейджи (уровень, тип, наличие) |
| `.section-title` | Заголовок секции |
| `.stats-bar` | Панель статистики |
| `.cart-summary` / `.order-summary` | Блок итоговой суммы |
| `.delivery-form` / `.delivery-summary-section` | Форма доставки |

### Принципы стандартизации

1. **Единая цветовая схема** — через CSS-переменные (`--wot-primary`, `--wot-secondary`, `--wot-bg`, etc.)
2. **Единые отступы и типографика** — через общие классы и переменные
3. **Минимизация дублирования** — компоненты страниц строятся из одних и тех же CSS-классов
4. **Семантическая вёрстка** — заголовки, секции, списки используют правильные HTML-теги

---

## 7. Структура JSON-файлов данных

### tanks.json — Каталог товаров
```json
[
  {
    "id": 1,
    "name": "Объект 140",
    "nation": "ussr",
    "type": "medium",
    "level": 10,
    "img": "images/tanks/object-140.png",
    "price": 6200,
    "inStock": true,
    "hp": "1900",
    "dmg": "320",
    "dpm": "3200",
    "ptrs": "0.35",
    "ptrp": "48",
    "spw": "55",
    "description": "Советский средний танк"
  }
]
```

### users.json — Пользователи
```json
[
  {
    "id": "1743861933640",
    "nickname": "Player1",
    "email": "player1@example.com",
    "phone": "+375291234567",
    "passwordHash": "$2b$10$...",
    "createdAt": "2026-04-05T12:00:00.000Z"
  }
]
```

### carts.json — Корзины
```json
[
  {
    "userId": "1743861933640",
    "items": [
      {
        "productId": 1,
        "quantity": 2,
        "product": { "...полный объект Product" }
      }
    ],
    "updatedAt": "2026-04-05T12:30:00.000Z"
  }
]
```

### deliveries.json — Доставки
```json
[
  {
    "id": "1743862033640",
    "userId": "1743861933640",
    "items": [
      {
        "productId": 1,
        "productName": "Объект 140",
        "productImg": "images/tanks/object-140.png",
        "quantity": 2,
        "price": 6200
      }
    ],
    "totalPrice": 12400,
    "address": "Player1",
    "phone": "+375291234567",
    "email": "player1@example.com",
    "paymentMethod": "card",
    "status": "pending",
    "createdAt": "2026-04-05T12:35:00.000Z"
  }
]
```

---

## 8. Инструкция по запуску

### Требования

- Node.js (версия 18+)
- npm (версия 9+)

### Установка и запуск

```bash
# 1. Клонирование репозитория
git clone <URL репозитория>
cd L_Shop

# 2. Установка зависимостей
npm install

# 3. Режим разработки (сервер + компиляция клиента)
npm run dev

# 4. Сборка проекта
npm run build

# 5. Запуск в production
npm start
```

После запуска приложение будет доступно по адресу: `http://localhost:3000`

### Режимы запуска

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск сервера через nodemon с горячей перезагрузкой + компиляция TS клиента в фоне |
| `npm run build` | Компиляция серверного и клиентского TypeScript |
| `npm start` | Запуск скомпилированной production-версии |

### SPA Маршруты

| Страница | Маршрут | Доступ |
|----------|---------|--------|
| Home | `/` | Все |
| Login | `/login` | Неавторизованные |
| Register | `/register` | Неавторизованные |
| Main | `/main` | Авторизованные |
| Profile | `/profile` | Авторизованные |
| Catalog | `/catalog` | Авторизованные |
| Cart | `/cart` | Авторизованные |
| Delivery | `/delivery` | Авторизованные |

---