const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const MAX_TITLE_LENGTH = 100;

// Чистая проверка данных формы. DOM и показ сообщений выполняются в main.js.
// draft: { id, title, priority }; editingId: null либо id редактируемой задачи.
export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  const isEdit = editingId !== null;

  let id;
  if (isEdit) {
    // В режиме редактирования draft.id не используется.
    if (
      typeof editingId !== "number"
      || !Number.isSafeInteger(editingId)
      || editingId <= 0
    ) {
      errors.id = "Некорректный идентификатор редактируемой задачи.";
    } else if (!tasks.some((task) => task.id === editingId)) {
      errors.id = "Редактируемая задача не найдена.";
    } else {
      id = editingId;
    }
  } else {
    // Пустая строка не принимается как ноль.
    const rawId = draft?.id;
    const asNumber = typeof rawId === "string" && rawId.trim() !== ""
      ? Number(rawId)
      : typeof rawId === "number"
        ? rawId
        : NaN;
    if (!Number.isSafeInteger(asNumber) || asNumber <= 0) {
      errors.id = "Идентификатор должен быть положительным целым числом.";
    } else if (tasks.some((task) => task.id === asNumber)) {
      errors.id = "Задача с таким идентификатором уже существует.";
    } else {
      id = asNumber;
    }
  }

  const rawTitle = draft?.title;
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  if (title.length < 1 || title.length > MAX_TITLE_LENGTH) {
    errors.title = `Название должно содержать от 1 до ${MAX_TITLE_LENGTH} символов после удаления пробелов.`;
  }

  const priority = draft?.priority;
  if (!ALLOWED_PRIORITIES.has(priority)) {
    errors.priority = "Приоритет должен быть low, medium или high.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, value: { id, title, priority } };
} 