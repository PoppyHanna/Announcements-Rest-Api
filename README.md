# REST API Дошки оголошень

REST API для дошки оголошень з JWT-автентифікацією, авторизацією та контролем доступу. Реалізовано в рамках курсового завдання магістратури.

## Загальний опис

Чистий JSON API без рендерингу HTML. Бекенд обслуговує клієнтів (React-застосунки, мобільні додатки тощо) через HTTP-запити.

Користувачі можуть публікувати, редагувати та видаляти власні оголошення. Анонімні відвідувачі бачать список оголошень і можуть переглядати деталі. Для створення оголошення потрібна реєстрація. Редагувати та видаляти можна лише власні оголошення.

Автентифікація — JWT з refresh токенами. Access token: 15 хвилин, refresh token: 7 днів. Token rotation для refresh токенів.

## Технологічний стек

| Технологія                     | Опис                            |
| ------------------------------ | ------------------------------- |
| Node.js                        | Середовище виконання            |
| Express 5                      | Веб-фреймворк                   |
| Prisma 7                       | ORM для бази даних (PostgreSQL) |
| Zod                            | Валідація вхідних даних         |
| bcrypt                         | Хешування паролів               |
| jsonwebtoken                   | JWT-автентифікація              |
| @asteasolutions/zod-to-openapi | Генерація OpenAPI документації  |
| swagger-ui-express             | Swagger UI                      |
| dotenv                         | Змінні середовища               |

## Встановлення

1. Встановіть залежності:

```bash
npm install
```

2. Створіть файл конфігурації .env на основі .env.example:

**macOS / Linux**

```bash :
cp .env.example .env
```

**Windows PowerShell**

```powershell:
Copy-Item .env.example .env
```

3. Налаштуйте `.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/announcements?schema=public
JWT_SECRET=your-secret-key-at-least-256-bits-long
```

4. Застосуйте міграцію:

```bash
npm run prisma:migrate
```

5. Згенеруйте Prisma Client:

```bash
npm run prisma:generate
```

6. Запустіть проект:

```bash
npm run dev
```

## Маршрути

### Auth

| Метод | Шлях             | Опис                          | Auth |
| ----- | ---------------- | ----------------------------- | ---- |
| POST  | `/auth/register` | Реєстрація користувача        | Ні   |
| POST  | `/auth/login`    | Вхід користувача              | Ні   |
| POST  | `/auth/refresh`  | Оновлення токенів             | Ні   |
| POST  | `/auth/logout`   | Вихід                         | Так  |
| GET   | `/auth/me`       | Профіль поточного користувача | Так  |

### Оголошення

| Метод  | Шлях                 | Опис                                      | Auth |
| ------ | -------------------- | ----------------------------------------- | ---- |
| GET    | `/announcements`     | Список з пагінацією, пошуком, сортуванням | Ні   |
| GET    | `/announcements/:id` | Деталі оголошення                         | Ні   |
| POST   | `/announcements`     | Створення оголошення                      | Так  |
| PATCH  | `/announcements/:id` | Часткове оновлення (власне)               | Так  |
| DELETE | `/announcements/:id` | Видалення (власне)                        | Так  |

### Авторизація
Для доступу до захищених маршрутів необхідно передати JWT access token у заголовку HTTP-запиту:

Authorization: Bearer <accessToken>

Access token дійсний 15 хвилин, refresh token — 7 днів. Оновлення токенів відбувається через /auth/refresh.

## Параметри запитів

### GET /announcements

| Параметр | Тип   | Опис                                            |
| -------- | ----- | ----------------------------------------------- |
| `search` | query | Пошук по назві (нечутливий до регістру)         |
| `sort`   | query | `newest` (за замовчуванням) або `oldest`        |
| `page`   | query | Номер сторінки (число > 0), 10 записів/сторінка |

### POST /auth/register

| Поле       | Вимоги                                  |
| ---------- | --------------------------------------- |
| `username` | рядок, обов'язковий, 3–30 символів      |
| `email`    | email, обов'язковий                     |
| `password` | рядок, обов'язковий, мінімум 6 символів |
| `name`     | рядок, обов'язковий, мінімум 2 символи  |

### POST /announcements

| Поле          | Вимоги                                                 |
| ------------- | ------------------------------------------------------ |
| `title`       | рядок, обов'язковий, 5–50 символів                     |
| `description` | рядок, обов'язковий, мінімум 10 символів               |
| `price`       | число, обов'язкове, > 0                                |
| `category`    | рядок, обов'язковий: `sale`, `service`, `job`, `other` |

PATCH використовує ті ж правила валідації, але всі поля опціональні (хоча б одне має бути присутнє).

## Приклад створення оголошення:

```json
{
  "title": "iPhone 13",
  "description": "Смартфон у хорошому стані",
  "price": 420,
  "category": "sale"
}
```

## Структура проекту

```
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
│   │   └── validate.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── announcements.routes.ts
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   └── announcements.validator.ts
│   ├── auth.openapi.ts
│   ├── announcements.openapi.ts
│   └── openapi.ts
├── app.ts
├── .env.example
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
├── prisma.config.ts
└── README.md
```
Файл .env містить конфіденційні налаштування та не додається до репозиторію. Для створення локальної конфігурації використовується .env.example.

## Конфігурація проєкту

- package.json — залежності та npm-скрипти.
- tsconfig.json — налаштування TypeScript.
- src/openapi.ts — реєстр OpenAPI та схема bearerAuth.
- src/auth.openapi.ts, src/announcements.openapi.ts — документація маршрутів.
- prisma/client.ts — ініціалізація Prisma Client через PostgreSQL-адаптер.
- prisma.config.ts — конфігурація Prisma.
- .env.example — шаблон змінних середовища.

## Доступні скрипти

| Команда                   | Опис                                 |
| ------------------------- | ------------------------------------ |
| `npm run dev`             | Запуск з hot reload (`node --watch`) |
| `npm start`               | Запуск у виробничому режимі          |
| `npm run prisma:migrate`  | Створення та застосування міграцій   |
| `npm run prisma:generate` | Генерація Prisma Client              |

## Документація API

Swagger UI доступний за адресою: http://localhost:3000/api-docs

Документація містить маршрути автентифікації та оголошень, схеми запитів і відповідей, а також підтримує авторизацію через Bearer token.

## Prisma schema

Три моделі: `User`, `RefreshToken`, `Announcement`.

- `User` — `username` (унікальний), хешований `password`, `email` (унікальний), `name`, `createdAt`
- `RefreshToken` — `token` (унікальний), зв'язок з `User`
- `Announcement` — `title`, `description`, `price`, `category`, зв'язок з `User`, `createdAt`, `updatedAt`

## Ліцензія

ISC
