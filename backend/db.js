// db.js
// Простое файловое хранилище на JSON вместо SQLite.
// Так не нужно компилировать нативные модули (что часто ломается на Windows) -
// для уровня этой курсовой достаточно обычного файла с данными.

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'habits.json');

// Структура данных по умолчанию, если файла ещё нет
function defaultData() {
  return { habits: [], completions: [], nextHabitId: 1, nextCompletionId: 1 };
}

// Прочитать все данные из файла (создаёт файл, если его нет)
function readData() {
  if (!fs.existsSync(DB_FILE)) {
    writeData(defaultData());
  }
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw);
}

// Записать все данные в файл
function writeData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readData, writeData };
