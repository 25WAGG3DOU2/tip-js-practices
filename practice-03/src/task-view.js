// task-view.js

/**
 * Создаёт DOM-элемент карточки задачи.
 */
export function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = "task-card";
  if (task.completed) li.classList.add("is-completed");
  li.dataset.taskId = task.id;

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;
  li.appendChild(title);

  const status = document.createElement("span");
  status.className = "task-status";
  status.textContent = task.completed ? "Выполнена" : "В работе";
  li.appendChild(status);

  const priorityLabels = { low: "Низкий", medium: "Средний", high: "Высокий" };
  const priority = document.createElement("span");
  priority.className = "task-priority";
  priority.textContent = priorityLabels[task.priority] ?? "";
  li.appendChild(priority);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.dataset.action = "toggle";
  toggleBtn.setAttribute("aria-pressed", String(Boolean(task.completed)));
  const toggleLabel = document.createElement("span");
  toggleLabel.className = "action-label";
  toggleLabel.textContent = "Выполнена";
  toggleBtn.appendChild(toggleLabel);
  actions.appendChild(toggleBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.dataset.action = "delete";
  const deleteLabel = document.createElement("span");
  deleteLabel.className = "action-label";
  deleteLabel.textContent = "Удалить";
  deleteBtn.appendChild(deleteLabel);
  actions.appendChild(deleteBtn);

  li.appendChild(actions);
  return li;
}

/**
 * Заменяет дочерние элементы списка карточками переданных задач.
 */
export function renderTaskList(listEl, tasks) {
  listEl.replaceChildren(...tasks.map(createTaskElement));
}

/**
 * Обновляет сводку. Для расчёта используется getTaskStats(currentTasks).
 * @param {HTMLElement} summaryEl - контейнер #task-summary
 * @param {Array<Object>} currentTasks - весь текущий массив
 * @param {number} visibleCount - длина видимой выборки
 */
export function renderSummary(summaryEl, currentTasks, visibleCount) {
  // getTaskStats импортируется отдельно, чтобы не тянуть DOM в сервис.
  const { total, completed, pending, progress } = getTaskStats(currentTasks);

  const set = (name, value) => {
    const el = summaryEl.querySelector(`[data-stat="${name}"]`);
    if (el) el.textContent = String(value);
  };

  set("total", total);
  set("completed", completed);
  set("pending", pending);
  set("progress", `${progress.toFixed(1)}%`);
  set("visible", visibleCount);
}

/**
 * Управляет пустым состоянием списка.
 * @param {HTMLElement} emptyEl - контейнер #empty-message
 * @param {number} total
 * @param {number} visibleCount
 */
export function renderEmptyState(emptyEl, total, visibleCount) {
  let text = "";
  let hidden = true;

  if (total === 0 && visibleCount === 0) {
    text = "Список задач пуст.";
    hidden = false;
  } else if (total > 0 && visibleCount === 0) {
    text = "Нет задач по выбранному фильтру.";
    hidden = false;
  }

  emptyEl.textContent = text;
  emptyEl.hidden = hidden;
}

/* Импорт getTaskStats вынесен в конец файла, чтобы не ломать порядок
   объявлений. Статические импорты поднимаются — это допустимо. */
import { getTaskStats } from "./task-service.js";
