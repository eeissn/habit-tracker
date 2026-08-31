// app.js
// Клиентская логика: запросы к API и отрисовка списка привычек.

const API_URL = '/api/habits';

const form = document.getElementById('add-form');
const input = document.getElementById('habit-name');
const list = document.getElementById('habit-list');
const errorMessage = document.getElementById('error-message');
const emptyState = document.getElementById('empty-state');

// Загрузить и отрисовать все привычки
async function loadHabits() {
  const res = await fetch(API_URL);
  const habits = await res.json();
  renderHabits(habits);
}

// Отрисовать список привычек в DOM
function renderHabits(habits) {
  list.innerHTML = '';
  emptyState.classList.toggle('hidden', habits.length > 0);

  habits.forEach((habit) => {
    const li = document.createElement('li');
    li.className = 'habit-card';
    li.innerHTML = `
      <div class="habit-main">
        <button class="habit-check ${habit.doneToday ? 'done' : ''}" data-id="${habit.id}">
          ${habit.doneToday ? '✓' : ''}
        </button>
        <span class="habit-name ${habit.doneToday ? 'done' : ''}">${escapeHtml(habit.name)}</span>
      </div>
      <div>
        <span class="habit-streak">🔥 ${habit.streak}</span>
        <button class="habit-delete" data-id="${habit.id}" title="Удалить">✕</button>
      </div>
    `;
    list.appendChild(li);
  });
}

// Простая защита от XSS при вставке названия привычки в innerHTML
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Добавление новой привычки
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMessage.classList.add('hidden');

  const name = input.value.trim();
  if (!name) return;

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const data = await res.json();
    errorMessage.textContent = data.error || 'Ошибка при добавлении';
    errorMessage.classList.remove('hidden');
    return;
  }

  input.value = '';
  loadHabits();
});

// Клики по списку: отметить выполнение или удалить (делегирование событий)
list.addEventListener('click', async (e) => {
  const checkBtn = e.target.closest('.habit-check');
  const deleteBtn = e.target.closest('.habit-delete');

  if (checkBtn) {
    const id = checkBtn.dataset.id;
    await fetch(`${API_URL}/${id}/toggle`, { method: 'POST' });
    loadHabits();
  }

  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    if (confirm('Удалить эту привычку?')) {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      loadHabits();
    }
  }
});

// Первая загрузка
loadHabits();
