export function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === id);
}

export function getPendingTasks(tasks) {
  return tasks.filter((task) => task.completed === false);
}

export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed === true).length;
  const pending = total - completed;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return { total, completed, pending, progress };
}

function isValidId(id) {
  return Number.isInteger(id) && id > 0;
}

function normalizeTitle(title) {
  if (typeof title !== "string") {
    return { ok: false, error: "Название должно быть строкой" };
  }
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: "Название не может быть пустым" };
  }
  return { ok: true, title: trimmed };
}

export function addTask(tasks, id, title, priority = "medium") {
  if (!isValidId(id)) {
    return { ok: false, error: "Некорректный идентификатор задачи" };
  }
  if (findTaskById(tasks, id) !== undefined) {
    return { ok: false, error: "Задача с таким id уже существует" };
  }

  const created = createTask(id, title, priority);
  if (!created.ok) {
    return created;
  }

  return { ok: true, tasks: [...tasks, created.task] };
}

export function setTaskCompleted(tasks, id, completed) {
  if (!isValidId(id)) {
    return { ok: false, error: "Некорректный идентификатор задачи" };
  }
  if (typeof completed !== "boolean") {
    return { ok: false, error: "Признак выполнения должен быть логическим" };
  }

  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: "Задача не найдена" };
  }

  return {
    ok: true,
    tasks: tasks.map((task) =>
      task.id === id ? { ...task, completed } : task,
    ),
  };
}

export function renameTask(tasks, id, title) {
  if (!isValidId(id)) {
    return { ok: false, error: "Некорректный идентификатор задачи" };
  }

  const normalized = normalizeTitle(title);
  if (!normalized.ok) {
    return normalized;
  }

  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: "Задача не найдена" };
  }

  return {
    ok: true,
    tasks: tasks.map((task) =>
      task.id === id ? { ...task, title: normalized.title } : task,
    ),
  };
}

export function removeTask(tasks, id) {
  if (!isValidId(id)) {
    return { ok: false, error: "Некорректный идентификатор задачи" };
  }

  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: "Задача не найдена" };
  }

  return {
    ok: true,
    tasks: tasks.filter((task) => task.id !== id),
  };
}
