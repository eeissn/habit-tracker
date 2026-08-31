// server.js
// Точка входа приложения: поднимает Express, отдаёт статику фронтенда
// и подключает API-роуты.

const express = require('express');
const path = require('path');
const habitsRouter = require('./routes/habits');

const app = express();
const PORT = process.env.PORT || 3000;

// Разбор JSON-тела запросов
app.use(express.json());

// Отдаём фронтенд как статику (папка ../frontend)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API
app.use('/api/habits', habitsRouter);

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
