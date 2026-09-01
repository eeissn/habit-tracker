# Habit Tracker — трекер привычек

🔗 **Демо:** https://habit-tracker-eu.onrender.com

Курсовая работа по дисциплине «Интернет-технологии».
Веб-приложение для отслеживания ежедневных привычек: добавление привычки,
отметка выполнения на сегодня, подсчёт серии (streak) выполнения без пропусков.

## Стек

- **Backend:** Node.js, Express
- **Frontend:** HTML, CSS, JavaScript (без фреймворков)
- **Хранилище:** JSON-файл (`backend/habits.json`, создаётся автоматически)

## Структура проекта
habit-tracker/
├── backend/
│ ├── server.js # точка входа, поднимает Express-сервер
│ ├── db.js # чтение/запись JSON-файла с данными
│ ├── routes/
│ │ └── habits.js # REST API для привычек
│ └── package.json
├── frontend/
│ ├── index.html
│ ├── style.css
│ └── app.js
└── README.md

## Запуск проекта

```bash
cd backend
npm install
npm start
```

Приложение будет доступно по адресу: http://localhost:3000

## API

| Метод | Путь | Описание |
|-|-|-|
| GET | /api/habits | Получить список привычек |
| GET | /api/habits/:id | Получить одну привычку по id |
| POST | /api/habits | Создать привычку `{ name }` |
| PUT | /api/habits/:id | Переименовать привычку `{ name }` |
| DELETE | /api/habits/:id | Удалить привычку |
| POST | /api/habits/:id/toggle | Отметить/снять выполнение на сегодня |
| GET | /api/habits/:id/history | История отметок за последние 30 дней |

## Автор

Поветьев Герман, ПИН-Б-З-22-1, курс 4, дисциплина «Интернет-технологии»