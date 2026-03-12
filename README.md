# L_Shop Лабораторные работы 11-12-13 ВебПрог

IYHAN SHOP – Интернет-магазин по продаже танков в НАШЕЙ ИГРЕ.

## Участники команды
- **Разработчик 1** — [@Idhenxysvs](https://github.com/Idhenxysvs)
- **Разработчик 2** — [@Fitzowski](https://github.com/Fitzowski)
- **Разработчик 3** — [@pltdeveloper393](https://github.com/pltdeveloper393)
- **Разработчик 4** — [@rxxksyan](https://github.com/rxxksyan)

## Технологии
Бэкенд (серверная часть)
- Node.js
- Express.js
- TypeScript
- Файловая система (fs) - JSON-файлы

Фронтенд (клиентская часть)
- HTML5
- CSS3
- TypeScript
- SPA (Single Page Application)

## О проекте
IYHAN SHOP – это SPA интернет-магазин танков. Проект построен на Node.js + Express (бэкенд) и TypeScript (клиент). Проект предполагает авторизацию учётных записей для пользователей, обширный каталог танков, корзину выбранных позиций к покупке и её оплату с информацией о доставке.

## Структура проекта
```
L_Shop/
├── server/                          # Бэкенд (Node.js + Express)
│   ├── index.ts                     # Главный сервер (точка входа)
│   ├── routes/                      # Маршруты API
│   │   └── auth.ts                   # Авторизация (пример для подражания)
│   ├── controllers/                  # Логика обработки запросов
│   │   └── authController.ts         
│   ├── models/                       # Работа с данными
│   │   └── UserModel.ts              
│   ├── middleware/                    # Промежуточные обработчики
│   │   └── authMiddleware.ts          # Защита роутов (ВАЖНО!)
│   └── types/                         # TypeScript типы для сервера
│       └── index.ts                   
│
├── public/                          # Статика (доступно браузеру)
│   ├── index.html                    # Единственная HTML страница
│   ├── styles.css                     # Общие стили всего проекта
│   ├── main-page.css                   # Стили главной страницы (пример)
│   ├── js/                             # Скомпилированный JavaScript
│   └── images/                         # Изображения
│
├── src/                              # Клиентский TypeScript
│   ├── main.ts                        # Точка входа
│   ├── router.ts                       # SPA роутер
│   ├── pages/                          # Страницы приложения
│   │   ├── HomePage.ts                  # Пример страницы
│   │   ├── LoginPage.ts                 
│   │   ├── RegisterPage.ts              
│   │   └── MainPage.ts                  # Главная после входа
│   ├── services/                        # Взаимодействие с сервером
│   │   └── api.ts                        # API клиент
│   └── types/                           # Общие типы
│       └── index.ts                      
│
├── users.json                        # База пользователей (создаётся автоматически)
├── package.json                      # Зависимости
├── tsconfig.json                      # Настройки TypeScript для сервера
├── tsconfig.client.json                # Настройки TypeScript для клиента
└── README.md                          # Этот файл
```

## Маршруты SPA-страниц
Здесь перечислен список маршрутов для SPA-страниц проекта (конечное название страниц может отличаться)

| Страница      | Маршрут     | Описание                              |
|---------------|-------------|---------------------------------------|
| HomePage      | `/`         | Страница для юзеров без регистрации   |
| LoginPage     | `/login`    | Вход в аккаунт                        |
| RegisterPage  | `/register` | Регистрация аккаунта                  |
| MainPage      | `/main`     | Главная страница проекта              |
| ProfilePage   | `/profile`  | Профиль пользователя                  |
| CatalogPage   | `/catalog`  | Каталог товаров магазина              |
| CartPage      | `/cart`     | Корзина покупок с выбранными товарами |
| DeliveryPage  | `/delivery` | Информация о доставке                 |