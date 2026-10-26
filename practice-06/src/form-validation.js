const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const MAX_TITLE = 100;

// Возвращает { valid, value, errors }.
// value содержит нормализованные title, priority и числовой categoryId.
export function validateTaskDraft(draft, categories) {
  const errors = {};
  let title = "";
  let priority = "";
  let categoryId = null;

  if (!draft || typeof draft !== "object") {
    return { valid: false, value: { title, priority, categoryId }, errors: { title: "Некорректные данные формы." } };
  }

  if (typeof draft.title === "string") {
    title = draft.title.trim();
  }
  if (title.length < 1 || title.length > MAX_TITLE) {
    errors.title = `Название должно содержать от 1 до ${MAX_TITLE} символов.`;
  }

  if (ALLOWED_PRIORITIES.has(draft.priority)) {
    priority = draft.priority;
  } else {
    errors.priority = "Приоритет должен быть low, medium или high.";
  }

  const rawCategory = draft.categoryId;
  let asNumber = NaN;
  if (typeof rawCategory === "number") asNumber = rawCategory;
  else if (typeof rawCategory === "string" && rawCategory.trim() !== "") asNumber = Number(rawCategory);

  const knownIds = new Set((categories ?? []).map((category) => category.id));
  if (!Number.isSafeInteger(asNumber) || asNumber <= 0) {
    errors.categoryId = "Выберите категорию.";
  } else if (!knownIds.has(asNumber)) {
    errors.categoryId = "Указана неизвестная категория.";
  } else {
    categoryId = asNumber;
  }

  return {
    valid: Object.keys(errors).length === 0,
    value: { title, priority, categoryId },
    errors,
  };
}