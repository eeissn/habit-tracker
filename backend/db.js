// db.js
// Отвечает за подключение к базе данных SQLite и создание таблиц,
// если они ещё не существуют.

const Database = require('better-sqlite3');
const path = require('path');

// Файл базы данных будет лежать рядом с сервером.
const db = new Database(path.join(__dirname, 'habits.db'));

// Включаем поддержку внешних ключей (по умолчанию в SQLite она выключена)
db.pragma('foreign_keys = ON');

// Таблица привычек
db.exec(`
  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Таблица "отметок выполнения" — по одной записи на привычку на дату
db.exec(`
  CREATE TABLE IF NOT EXISTS completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE (habit_id, date)
  )
`);

module.exports = db;
