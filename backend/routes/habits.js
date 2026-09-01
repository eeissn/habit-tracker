// routes/habits.js
// Все эндпоинты, связанные с привычками, собраны в одном Express-роутере.
// Данные хранятся в JSON-файле через db.js (readData/writeData).

const express = require('express');
const { readData, writeData } = require('../db');

const router = express.Router();

// Сегодняшняя дата в формате YYYY-MM-DD
function today() {
  return new Date().toISOString().slice(0, 10);
}

// Считает текущий стрик (сколько дней подряд, включая сегодня/вчера,
// привычка выполнялась без пропусков)
function calculateStreak(data, habitId) {
  const dates = new Set(
    data.completions.filter((c) => c.habit_id === habitId).map((c) => c.date)
  );

  if (dates.size === 0) return 0;

  let streak = 0;
  let cursor = new Date();

  // Если сегодня ещё не отмечено, начинаем проверку со вчера
  if (!dates.has(today())) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

// GET /api/habits — список всех привычек с признаком "выполнено сегодня" и стриком
router.get('/', (req, res) => {
  const data = readData();

  const result = data.habits.map((habit) => {
    const doneToday = data.completions.some(
      (c) => c.habit_id === habit.id && c.date === today()
    );

    return {
      ...habit,
      doneToday,
      streak: calculateStreak(data, habit.id),
    };
  });

  res.json(result);
});

// GET /api/habits/:id — получить одну привычку по id (READ)
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const data = readData();
  const habit = data.habits.find((h) => h.id === id);

  if (!habit) {
    return res.status(404).json({ error: 'Привычка не найдена' });
  }

  const doneToday = data.completions.some(
    (c) => c.habit_id === id && c.date === today()
  );

  res.json({ ...habit, doneToday, streak: calculateStreak(data, id) });
});

// POST /api/habits — создать новую привычку { name }
router.post('/', (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Название привычки обязательно' });
  }

  const data = readData();

  const habit = {
    id: data.nextHabitId,
    name: name.trim(),
    created_at: new Date().toISOString(),
  };

  data.habits.push(habit);
  data.nextHabitId += 1;
  writeData(data);

  res.status(201).json({ ...habit, doneToday: false, streak: 0 });
});

// PUT /api/habits/:id — переименовать привычку (UPDATE) { name }
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Название привычки обязательно' });
  }

  const data = readData();
  const habit = data.habits.find((h) => h.id === id);

  if (!habit) {
    return res.status(404).json({ error: 'Привычка не найдена' });
  }

  habit.name = name.trim();
  writeData(data);

  const doneToday = data.completions.some(
    (c) => c.habit_id === id && c.date === today()
  );

  res.json({ ...habit, doneToday, streak: calculateStreak(data, id) });
});

// DELETE /api/habits/:id — удалить привычку и все её отметки
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const data = readData();

  const exists = data.habits.some((h) => h.id === id);
  if (!exists) {
    return res.status(404).json({ error: 'Привычка не найдена' });
  }

  data.habits = data.habits.filter((h) => h.id !== id);
  data.completions = data.completions.filter((c) => c.habit_id !== id);
  writeData(data);

  res.status(204).end();
});

// POST /api/habits/:id/toggle — отметить/снять отметку выполнения на сегодня
router.post('/:id/toggle', (req, res) => {
  const id = Number(req.params.id);
  const data = readData();

  const habit = data.habits.find((h) => h.id === id);
  if (!habit) {
    return res.status(404).json({ error: 'Привычка не найдена' });
  }

  const existingIndex = data.completions.findIndex(
    (c) => c.habit_id === id && c.date === today()
  );

  if (existingIndex >= 0) {
    data.completions.splice(existingIndex, 1);
  } else {
    data.completions.push({ id: data.nextCompletionId, habit_id: id, date: today() });
    data.nextCompletionId += 1;
  }

  writeData(data);

  res.json({
    doneToday: existingIndex < 0,
    streak: calculateStreak(data, id),
  });
});

// GET /api/habits/:id/history — история отметок за последние 30 дней (для календарика)
router.get('/:id/history', (req, res) => {
  const id = Number(req.params.id);
  const data = readData();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const dates = data.completions
    .filter((c) => c.habit_id === id && c.date >= cutoffStr)
    .map((c) => c.date)
    .sort();

  res.json(dates);
});

module.exports = router;
