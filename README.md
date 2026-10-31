# REST API дошки оголошень

REST API для дошки оголошень із JWT-автентифікацією, авторизацією, контролем доступу, завантаженням фотографій і базовими механізмами безпеки.

Проєкт розроблено в рамках навчання на магістерській програмі Software Engineering.

## Загальний опис

Застосунок надає JSON REST API для вебклієнтів і мобільних застосунків.

Користувачі можуть:

- Реєструватися та входити до системи.
- Переглядати оголошення без авторизації.
- Шукати, сортувати та переглядати оголошення з пагінацією.
- Створювати оголошення з фотографією або без неї.
- Редагувати та видаляти лише власні оголошення.
- Оновлювати фотографію оголошення.

Автентифікація реалізована через JWT. Access token дійсний 15 хвилин, refresh token — 7 днів. Реалізовано ротацію refresh-токенів і перевірку типу токена.

## Технологічний стек

| Технологія | Призначення |
|---|---|
| Node.js | Середовище виконання |
| TypeScript | Типізація коду |
| Express 5 | HTTP-сервер і маршрутизація |
| PostgreSQL | Реляційна база даних |
| Prisma 7 | ORM і міграції бази даних |
| Zod | Валідація вхідних даних |
| bcrypt | Хешування паролів |
| jsonwebtoken | JWT-автентифікація |
| Helmet | Захисні HTTP-заголовки |
| CORS | Контроль дозволених джерел запитів |
| express-rate-limit | Обмеження кількості запитів |
| Pino, pino-http | Логування подій і HTTP-запитів |
| Multer | Приймання та тимчасове збереження файлів |
| Cloudinary | Хмарне зберігання фотографій |
| zod-to-openapi | Генерація OpenAPI-документації |
| swagger-ui-express | Інтерфейс Swagger UI |
| Vitest | Автоматизоване тестування |
| dotenv | Змінні середовища |

## Основні можливості

### Автентифікація та авторизація

- Реєстрація та вхід користувачів.
- Хешування паролів через bcrypt.
- JWT access і refresh tokens.
- Ротація refresh-токенів.
- Перевірка типу токена (`access` або `refresh`).
- Захист приватних маршрутів.
- Перевірка власника перед редагуванням або видаленням оголошення.

### Безпека

- **Helmet** додає захисні HTTP-заголовки.
- **CORS** дозволяє браузерні запити лише з Origins, зазначених у `ALLOWED_ORIGINS`.
- **Rate Limiting** обмежує маршрути `/auth` до 10 запитів з однієї IP-адреси за 15 хвилин.
- Після перевищення ліміту сервер повертає `429 Too Many Requests`.
- Помилки API повертаються у форматі з полем `message`.

### Логування

Pino використовується для логування:

- HTTP-запитів і відповідей.
- Успішної реєстрації.
- Успішного входу користувача.
- Створення та оновлення оголошень.
- Завантаження фотографій.
- Помилок сервера.

Паролі та JWT-токени не додаються до повідомлень прикладного логування.

### Завантаження фотографій

Маршрути `POST /announcements` і `PATCH /announcements/:id` підтримують `multipart/form-data`.

- Фотографія передається в полі `image`.
- Підтримуються JPEG, PNG і WEBP.
- Максимальний розмір файлу — 5 MB.
- Multer тимчасово зберігає файл у папці `uploads/`.
- Cloudinary завантажує фотографію до хмарного сховища.
- HTTPS-посилання зберігається в полі `imageUrl`.
- Після завантаження тимчасовий файл видаляється.
- Створення оголошення без фотографії також підтримується.

## Встановлення та запуск

### 1. Встановлення залежностей

```bash
npm install
```

Для роботи проєкту необхідно мати встановлений PostgreSQL і створену базу даних `announcements`.

### 2. Створення `.env`

Скопіюйте `.env.example` у `.env`.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

### 3. Налаштування змінних середовища

Приклад:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/announcements?schema=public
JWT_SECRET=replace_with_a_long_random_secret

ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

Значення Cloudinary можна отримати в Cloudinary Console.

Не додавайте справжні паролі, токени або API-ключі до репозиторію.

### 4. Застосування міграцій

```bash
npm run prisma:migrate
```

### 5. Генерація Prisma Client

```bash
npm run prisma:generate
```

### 6. Запуск сервера

```bash
npm run dev
```

За стандартних налаштувань сервер доступний за адресою:

`http://localhost:3000`

Swagger UI:

http://localhost:3000/api-docs

## Маршрути API

### Auth

| Метод | Маршрут | Опис | Авторизація |
|---|---|---|---|
| POST | `/auth/register` | Реєстрація | Ні |
| POST | `/auth/login` | Вхід | Ні |
| POST | `/auth/refresh` | Оновлення токенів | Ні |
| POST | `/auth/logout` | Вихід | Так |
| GET | `/auth/me` | Дані поточного користувача | Так |

### Announcements

| Метод | Маршрут | Опис | Авторизація |
|---|---|---|---|
| GET | `/announcements` | Список, пошук, сортування, пагінація | Ні |
| GET | `/announcements/:id` | Деталі оголошення | Ні |
| POST | `/announcements` | Створення, необов'язкова фотографія | Так |
| PATCH | `/announcements/:id` | Оновлення власного оголошення або фотографії | Так |
| DELETE | `/announcements/:id` | Видалення власного оголошення | Так |

### Авторизація запитів

Для захищених маршрутів передайте access token у заголовку:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Refresh token не можна використовувати замість access token.

## Параметри запитів

### GET /announcements

| Параметр | Опис |
|---|---|
| `search` | Пошук за назвою без урахування регістру |
| `sort` | `newest` або `oldest`, за замовчуванням `newest` |
| `page` | Додатне ціле число, за замовчуванням 1 |

На сторінці повертається 10 оголошень.

### POST /auth/register

| Поле | Вимоги |
|---|---|
| `username` | Рядок, 3–30 символів |
| `email` | Коректна email-адреса |
| `password` | Рядок, мінімум 6 символів |
| `name` | Рядок, мінімум 2 символи |

### POST /announcements

| Поле | Вимоги |
|---|---|
| `title` | Обов'язкове, 5–50 символів |
| `description` | Обов'язкове, мінімум 10 символів |
| `price` | Обов'язкове додатне число |
| `category` | `sale`, `service`, `job`, `other` |
| `image` | Необов'язковий файл JPEG, PNG або WEBP до 5 MB |

Підтримуються `application/json` і `multipart/form-data`.

**Приклад JSON-запиту без фотографії:**

```json
{
  "title": "iPhone 13",
  "description": "Смартфон у хорошому стані",
  "price": 420,
  "category": "sale"
}
```

**Приклад `multipart/form-data` з фотографією:**

| Key | Type | Value |
|---|---|---|
| `title` | Text | Coffee Machine |
| `description` | Text | Coffee machine in excellent condition |
| `price` | Text | 150 |
| `category` | Text | sale |
| `image` | File | photo.jpg |

Для `multipart/form-data` поле `price` передається як текст і перетворюється на число під час валідації.

### PATCH /announcements/:id

Усі текстові поля необов'язкові. Необхідно передати хоча б одне поле або фотографію.

Можна оновити лише фотографію, передавши `image` через `multipart/form-data`.

Редагувати оголошення може лише його власник.

## Автоматичні тести

Для тестування використовується Vitest.

Запуск:

```bash
npm test
```

Файл `tests/auth.test.ts` містить три тести:

1. Запит без Bearer token повертає `401 Unauthorized`.
2. Правильний access token дозволяє пройти middleware авторизації.
3. Refresh token відхиляється при використанні замість access token.

Перевірено: **3 тести успішно пройшли**.

Додаткова перевірка TypeScript:

```bash
npx tsc --noEmit
```

## Структура проєкту

```text
Announcements-Rest-Api/
├── prisma/
│   ├── schema.prisma
│   ├── client.ts
│   └── migrations/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── announcements.controller.ts
│   ├── middleware/
│   │   ├── authenticate.ts
│   │   ├── validate.ts
│   │   └── upload.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── announcements.routes.ts
│   ├── services/
│   │   └── uploadImage.ts
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   └── announcements.validator.ts
│   ├── auth.openapi.ts
│   ├── announcements.openapi.ts
│   ├── cloudinary.ts
│   ├── logger.ts
│   └── openapi.ts
├── tests/
│   └── auth.test.ts
├── app.ts
├── vitest.config.ts
├── prisma.config.ts
├── tsconfig.json
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

Папки `node_modules/` і `uploads/`, а також файл `.env` не включаються до репозиторію.

## Доступні npm-скрипти

| Команда | Призначення |
|---|---|
| `npm run dev` | Запуск із відстеженням змін через `tsx --watch` |
| `npm start` | Запуск сервера через `tsx` |
| `npm run prisma:migrate` | Створення та застосування міграцій |
| `npm run prisma:generate` | Генерація Prisma Client |
| `npm test` | Одноразовий запуск тестів Vitest |

## Swagger / OpenAPI

Документація доступна за адресою:

http://localhost:3000/api-docs

Swagger UI містить:

- Маршрути автентифікації та оголошень.
- Схеми запитів і відповідей.
- Bearer JWT-авторизацію.
- Підтримку `application/json`.
- Підтримку `multipart/form-data` для POST і PATCH.
- Поле вибору фотографії `image`.

## Моделі бази даних

**User** — користувач із полями `username`, `email`, `password`, `name`, `createdAt`.

**RefreshToken** — збережений refresh token, пов'язаний із користувачем.

**Announcement** — оголошення з полями `title`, `description`, `price`, `category`, `imageUrl`, `createdAt`, `updatedAt` і зв'язком із користувачем.

Поле `imageUrl` необов'язкове.

## Ліцензія

ISC
