import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function isTask(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.title === "string"
    && value.title.trim().length >= 1
    && value.title.trim().length <= 100
    && typeof value.completed === "boolean"
    && ALLOWED_PRIORITIES.has(value.priority)
    && isPositiveSafeInteger(value.categoryId),
  );
}

function isCategory(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.name === "string"
    && value.name.trim().length >= 1
    && value.name.trim().length <= 100,
  );
}

function normalizeFilters(rawFilters) {
  if (rawFilters === undefined) {
    return {};
  }
  if (rawFilters === null || typeof rawFilters !== "object" || Array.isArray(rawFilters)) {
    throw new TypeError("filters должен быть объектом.");
  }
  for (const name of Object.keys(rawFilters)) {
    if (!ALLOWED_FILTERS.has(name)) {
      throw new TypeError(`Неизвестный фильтр: ${name}.`);
    }
  }

  const result = {};
  if (rawFilters.completed !== undefined) {
    if (typeof rawFilters.completed !== "boolean") {
      throw new TypeError("completed должен быть boolean.");
    }
    result.completed = rawFilters.completed;
  }
  if (rawFilters.priority !== undefined) {
    if (!ALLOWED_PRIORITIES.has(rawFilters.priority)) {
      throw new TypeError("priority должен быть low, medium или high.");
    }
    result.priority = rawFilters.priority;
  }
  if (rawFilters.categoryId !== undefined) {
    if (!isPositiveSafeInteger(rawFilters.categoryId)) {
      throw new TypeError("categoryId должен быть положительным целым.");
    }
    result.categoryId = rawFilters.categoryId;
  }
  if (rawFilters.q !== undefined) {
    if (typeof rawFilters.q !== "string") {
      throw new TypeError("q должен быть строкой.");
    }
    const trimmed = rawFilters.q.trim();
    if (trimmed.length > 100) {
      throw new TypeError("q длиннее 100 символов.");
    }
    result.q = trimmed;
  }
  return result;
}

function checkTask(task) {
  if (!isTask(task)) throw invalidResponse("Задача не соответствует схеме.");
  return task;
}

function checkCategory(category) {
  if (!isCategory(category)) throw invalidResponse("Категория не соответствует схеме.");
  return category;
}

function checkTaskCollection(payload) {
  if (!payload || typeof payload !== "object" || !Array.isArray(payload.data)) {
    throw invalidResponse("Ожидался объект { data: [...] }.");
  }
  const seen = new Set();
  for (const task of payload.data) {
    if (!isTask(task)) throw invalidResponse("Задача не соответствует схеме.");
    if (seen.has(task.id)) throw invalidResponse("Повторяющийся id задачи.");
    seen.add(task.id);
  }
  const meta = payload.meta;
  if (!meta || typeof meta !== "object" || meta.total !== payload.data.length) {
    throw invalidResponse("meta.total не совпадает с длиной коллекции.");
  }
  return { tasks: payload.data, meta };
}

// client — объект, созданный createApiClient.
export function createTaskApi(client) {
  if (!client || typeof client.requestJson !== "function") {
    throw new TypeError("client должен иметь requestJson.");
  }

  return {
    async getTasks(rawFilters) {
      const filters = normalizeFilters(rawFilters);
      const payload = await client.requestJson("/tasks", { query: filters });
      return checkTaskCollection(payload);
    },

    async getTaskById(id) {
      if (!isPositiveSafeInteger(id)) {
        throw new TypeError("id должен быть положительным целым.");
      }
      const payload = await client.requestJson(`/tasks/${id}`);
      if (!payload || typeof payload !== "object") {
        throw invalidResponse("Ожидался объект { data: task }.");
      }
      return checkTask(payload.data);
    },

    async getCategories() {
      const payload = await client.requestJson("/categories");
      if (!payload || typeof payload !== "object" || !Array.isArray(payload.data)) {
        throw invalidResponse("Ожидался объект { data: [...] }.");
      }
      const seen = new Set();
      for (const category of payload.data) {
        if (!isCategory(category)) throw invalidResponse("Категория не соответствует схеме.");
        if (seen.has(category.id)) throw invalidResponse("Повторяющийся id категории.");
        seen.add(category.id);
      }
      if (payload.meta && payload.meta.total !== payload.data.length) {
        throw invalidResponse("meta.total не совпадает с длиной коллекции.");
      }
      return payload.data;
    },

    async loadInitialData(rawFilters) {
      const filters = normalizeFilters(rawFilters);
      const [tasksResult, categories] = await Promise.all([
        this.getTasks(filters),
        this.getCategories(),
      ]);
      return { tasks: tasksResult.tasks, categories, meta: tasksResult.meta };
    },
  };
}