// task-service.js — реализация сервисов ПР2, используемых в ПР3.
// Для предусмотренных ошибок возвращается { ok: false, error: "..." }.

const PRIORITIES = ["low", "medium", "high"];
const MAX_TITLE_LENGTH = 100;

function isValidId(id) {
  return typeof id === "number" && Number.isSafeInteger(id) && id > 0;
}

function normalizeTitle(title) {
  if (typeof title !== "string") return null;
  const trimmed = title.trim();
  if (trimmed.length < 1 || trimmed.length > MAX_TITLE_LENGTH) return null;
  return trimmed;
}

function isValidPriority(priority) {
  return PRIORITIES.includes(priority);
}

/* ------------------------------------------------------------------ */
/*  createTask                                                         */
/* ------------------------------------------------------------------ */

export function createTask(id, title, priority = "medium") {
  if (!isValidId(id)) {
    return { ok: false, error: "Некорректный идентификатор задачи." };
  }
  const normalized = normalizeTitle(title);
  if (normalized === null) {
    return { ok: false, error: "Некорректное название задачи." };
  }
  if (priority === undefined) priority = "medium";
  if (!isValidPriority(priority)) {
    return { ok: false, error: "Некорректный приоритет задачи." };
  }
  return {
    ok: true,
    task: { id, title: normalized, completed: false, priority },
  };
}

/* ------------------------------------------------------------------ */
/*  findTaskById                                                       */
/* ------------------------------------------------------------------ */

export function findTaskById(tasks, id) {
  if (!Array.isArray(tasks)) return undefined;
  return tasks.find((task) => task.id === id);
}

/* ------------------------------------------------------------------ */
/*  getPendingTasks / getTaskTitles                                    */
/* ------------------------------------------------------------------ */

export function getPendingTasks(tasks) {
  return tasks.filter((task) => task.completed === false);
}

export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}

/* ------------------------------------------------------------------ */
/*  getTaskStats                                                       */
/* ------------------------------------------------------------------ */

export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed === true).length;
  const pending = total - completed;
  const progress = total === 0 ? 0 : (completed / total) * 100;
  return { total, completed, pending, progress };
}

/* ------------------------------------------------------------------ */
/*  addTask                                                            */
/* ------------------------------------------------------------------ */

export function addTask(tasks, id, title, priority = "medium") {
  const created = createTask(id, title, priority);
  if (!created.ok) return created;
  if (findTaskById(tasks, id) !== undefined) {
    return {
      ok: false,
      error: "Задача с таким идентификатором уже существует.",
    };
  }
  return { ok: true, tasks: [...tasks, created.task] };
}

/* ------------------------------------------------------------------ */
/*  setTaskCompleted                                                   */
/* ------------------------------------------------------------------ */

export function setTaskCompleted(tasks, id, completed) {
  if (!isValidId(id)) {
    return { ok: false, error: "Некорректный идентификатор задачи." };
  }
  if (typeof completed !== "boolean") {
    return { ok: false, error: "Статус должен быть логическим значением." };
  }
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    return { ok: false, error: "Задача не найдена." };
  }
  const next = tasks.slice();
  next[index] = { ...next[index], completed };
  return { ok: true, tasks: next };
}

/* ------------------------------------------------------------------ */
/*  renameTask                                                         */
/* ------------------------------------------------------------------ */

export function renameTask(tasks, id, title) {
  if (!isValidId(id)) {
    return { ok: false, error: "Некорректный идентификатор задачи." };
  }
  const normalized = normalizeTitle(title);
  if (normalized === null) {
    return { ok: false, error: "Некорректное название задачи." };
  }
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    return { ok: false, error: "Задача не найдена." };
  }
  const next = tasks.slice();
  next[index] = { ...next[index], title: normalized };
  return { ok: true, tasks: next };
}

/* ------------------------------------------------------------------ */
/*  removeTask                                                         */
/* ------------------------------------------------------------------ */

export function removeTask(tasks, id) {
  if (!isValidId(id)) {
    return { ok: false, error: "Некорректный идентификатор задачи." };
  }
  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: "Задача не найдена." };
  }
  return { ok: true, tasks: tasks.filter((task) => task.id !== id) };
}
