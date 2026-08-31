// routes/habits.js
// Все эндпоинты, связанные с привычками, собраны в одном Express-роутере.

const express = require('express');
const db = require('../db');

const router = express.Router();

// Сегодняшняя дата в формате YYYY-MM-DD
function today() {
  return new Date().toISOString().slice(0, 10);
}

// Считает текущий стрик (сколько дней подряд, включая сегодня/вчера,
// привычка выполнялась без пропусков)
function calculateStreak(habitId) {
  const rows = db
    .prepare('SELECT date FROM completions WHERE habit_id = ? ORDER BY date DESC')
    .all(habitId);

  if (rows.length === 0) return 0;

  const dates = new Set(rows.map((r) => r.date));
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
  const habits = db.prepare('SELECT * FROM habits ORDER BY created_at').all();

  const result = habits.map((habit) => {
    const doneToday = db
      .prepare('SELECT 1 FROM completions WHERE habit_id = ? AND date = ?')
      .get(habit.id, today());

    return {
      ...habit,
      doneToday: Boolean(doneToday),
      streak: calculateStreak(habit.id),
    };
  });

  res.json(result);
});

// POST /api/habits — создать новую привычку { name }
router.post('/', (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Название привычки обязательно' });
  }

  const info = db
    .prepare('INSERT INTO habits (name) VALUES (?)')
    .run(name.trim());

  const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ ...habit, doneToday: false, streak: 0 });
});

// DELETE /api/habits/:id — удалить привычку (и её отметки — по каскаду)
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM habits WHERE id = ?').run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Привычка не найдена' });
  }

  res.status(204).end();
});

// POST /api/habits/:id/toggle — отметить/снять отметку выполнения на сегодня
router.post('/:id/toggle', (req, res) => {
  const habitId = req.params.id;
  const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(habitId);

  if (!habit) {
    return res.status(404).json({ error: 'Привычка не найдена' });
  }

  const existing = db
    .prepare('SELECT id FROM completions WHERE habit_id = ? AND date = ?')
    .get(habitId, today());

  if (existing) {
    db.prepare('DELETE FROM completions WHERE id = ?').run(existing.id);
  } else {
    db.prepare('INSERT INTO completions (habit_id, date) VALUES (?, ?)').run(habitId, today());
  }

  res.json({
    doneToday: !existing,
    streak: calculateStreak(habitId),
  });
});

// GET /api/habits/:id/history — история отметок за последние 30 дней (для календарика)
router.get('/:id/history', (req, res) => {
  const rows = db
    .prepare(
      `SELECT date FROM completions
       WHERE habit_id = ? AND date >= date('now', '-30 days')
       ORDER BY date`
    )
    .all(req.params.id);

  res.json(rows.map((r) => r.date));
});

module.exports = router;
