export const STORAGE_VERSION = 1;

const ALLOWED_PRIORITIES = ["low", "medium", "high"];

function isValidId(id) {
  return typeof id === "number" && Number.isSafeInteger(id) && id > 0;
}

function isValidTask(task) {
  if (task === null || typeof task !== "object") return false;
  if (!isValidId(task.id)) return false;
  if (typeof task.title !== "string") return false;
  const trimmed = task.title.trim();
  if (trimmed.length < 1 || trimmed.length > 100) return false;
  if (task.title !== trimmed) return false;
  if (typeof task.completed !== "boolean") return false;
  if (!ALLOWED_PRIORITIES.includes(task.priority)) return false;
  return true;
}

// Все функции принимают объект storage явно, чтобы их можно было проверить
// без обращения к глобальному window.localStorage.

export function isValidTaskList(value) {
  if (!Array.isArray(value)) return false;
  const seen = new Set();
  for (const task of value) {
    if (!isValidTask(task)) return false;
    if (seen.has(task.id)) return false;
    seen.add(task.id);
  }
  return true;
}

function copyTasks(tasks) {
  return tasks.map((task) => ({ ...task }));
}

export function loadTasks(storage, key, fallbackTasks) {
  const fallbackCopy = copyTasks(fallbackTasks);
  let raw;
  try {
    raw = storage.getItem(key);
  } catch (error) {
    return {
      ok: false,
      source: "fallback",
      tasks: fallbackCopy,
      error: `Не удалось прочитать сохранённые данные: ${error.message}`,
    };
  }

  if (raw === null) {
    return { ok: true, source: "initial", tasks: fallbackCopy };
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return {
      ok: false,
      source: "fallback",
      tasks: fallbackCopy,
      error: `Сохранённые данные повреждены: ${error.message}`,
    };
  }

  if (parsed === null || typeof parsed !== "object") {
    return {
      ok: false,
      source: "fallback",
      tasks: fallbackCopy,
      error: "Сохранённые данные имеют неверный формат.",
    };
  }

  if (parsed.version !== STORAGE_VERSION) {
    return {
      ok: false,
      source: "fallback",
      tasks: fallbackCopy,
      error: `Неизвестная версия сохранённых данных: ${parsed.version}.`,
    };
  }

  if (!isValidTaskList(parsed.tasks)) {
    return {
      ok: false,
      source: "fallback",
      tasks: fallbackCopy,
      error: "Сохранённые задачи не соответствуют схеме.",
    };
  }

  return { ok: true, source: "storage", tasks: copyTasks(parsed.tasks) };
}

export function saveTasks(storage, key, tasks) {
  if (!isValidTaskList(tasks)) {
    return { ok: false, error: "Некорректный список задач: сохранение отклонено." };
  }
  try {
    storage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, tasks }));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Не удалось сохранить задачи: ${error.message}` };
  }
}

export function removeSavedTasks(storage, key) {
  try {
    storage.removeItem(key);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Не удалось удалить сохранённые данные: ${error.message}` };
  }
}