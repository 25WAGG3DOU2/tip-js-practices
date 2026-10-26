import { ApiError } from "./api-client.js";
import { validateTaskDraft } from "./form-validation.js";

export function messageForError(error) {
  if (!(error instanceof ApiError)) return "Не удалось выполнить операцию.";
  if (error.kind === "timeout") return "Сервер не ответил вовремя. Попробуйте ещё раз.";
  if (error.kind === "network") return "Нет соединения с учебным API. Проверьте, запущен ли npm start.";
  if (error.kind === "invalid-response") return "Сервер вернул ответ неожиданного формата.";
  if (error.kind === "http" && error.status === 404) return "Запись уже отсутствует на сервере. Обновите список.";
  if (error.kind === "http") return error.message || `Сервер вернул ошибку ${error.status}.`;
  return "Не удалось выполнить операцию.";
}

export function createAppController({ api, view, validateDraft = validateTaskDraft } = {}) {
  if (!api || typeof api.loadInitialData !== "function") {
    throw new TypeError("api должен реализовывать loadInitialData.");
  }
  if (!view || typeof view.setListState !== "function") {
    throw new TypeError("view должен реализовывать методы интерфейса.");
  }

  let tasks = [];
  let categories = [];
  let filters = {};
  let editingId = null;
  let inflight = null;
  let lastRequestId = 0;
  let started = false;

  function isAborted(error) {
    return error instanceof ApiError && error.kind === "aborted";
  }

  function abortInflight() {
    if (inflight) {
      inflight.abort();
      inflight = null;
    }
  }

  function beginRequest() {
    abortInflight();
    const controller = new AbortController();
    inflight = controller;
    lastRequestId += 1;
    return { controller, id: lastRequestId };
  }

  function applyTasks(nextTasks, meta) {
    tasks = nextTasks;
    view.setTasks(tasks, categories);
    view.setTotal(meta?.total ?? tasks.length);
    if (tasks.length === 0) {
      view.setListState("empty");
    } else {
      view.setListState("ready");
    }
  }

  async function loadWithFilters(nextFilters, { showLoading = true } = {}) {
    filters = { ...nextFilters };
    const { controller, id } = beginRequest();
    if (showLoading) view.setListState("loading");

    try {
      let result;
      if (!started || categories.length === 0) {
        result = await api.loadInitialData(filters, { signal: controller.signal });
        categories = result.categories;
        view.setCategories(categories);
        started = true;
      } else {
        result = await api.getTasks(filters, { signal: controller.signal });
      }

      if (id !== lastRequestId) return;
      applyTasks(result.tasks, result.meta);
    } catch (error) {
      if (isAborted(error)) return;
      if (id !== lastRequestId) return;
      view.setTasks([], categories);
      view.setTotal("—");
      view.setListState("error", messageForError(error));
    } finally {
      if (inflight === controller) inflight = null;
    }
  }

  async function withMutation(pendingAction) {
    view.setMutationPending(true);
    try {
      await pendingAction();
    } finally {
      view.setMutationPending(false);
    }
  }

  async function reloadCurrent() {
    if (categories.length === 0) {
      await loadWithFilters(filters);
    } else {
      await loadWithFilters(filters, { showLoading: false });
    }
  }

  return {
    async start(initialFilters = {}) {
      filters = { ...initialFilters };
      view.setListState("loading");
      await loadWithFilters(filters, { showLoading: false });
    },

    async applyFilters(nextFilters = {}) {
      await loadWithFilters(nextFilters);
    },

    async refresh() {
      await reloadCurrent();
    },

    async submit(draft) {
      const { valid, value, errors } = validateDraft(draft, categories);
      if (!valid) {
        view.showFormErrors(errors);
        return;
      }
      view.showFormErrors({});

      await withMutation(async () => {
        try {
          if (editingId === null) {
            await api.createTask(value);
            view.notify("Задача добавлена.", "success");
          } else {
            await api.updateTask(editingId, value);
            view.notify("Изменения сохранены.", "success");
          }
          editingId = null;
          view.setFormTask(null);
          await reloadCurrent();
        } catch (error) {
          if (isAborted(error)) return;
          view.notify(messageForError(error), "error");
        }
      });
    },

    beginEdit(id) {
      const task = tasks.find((item) => item.id === id);
      if (!task) {
        view.notify("Задача не найдена.", "error");
        return;
      }
      editingId = task.id;
      view.setFormTask(task);
    },

    cancelEdit() {
      editingId = null;
      view.setFormTask(null);
      view.showFormErrors({});
    },

    async toggleTask(id) {
      const task = tasks.find((item) => item.id === id);
      if (!task) return;
      await withMutation(async () => {
        try {
          await api.setTaskCompleted(id, !task.completed);
          await reloadCurrent();
        } catch (error) {
          if (isAborted(error)) return;
          view.notify(messageForError(error), "error");
        }
      });
    },

    async deleteTask(id) {
      await withMutation(async () => {
        try {
          await api.deleteTask(id);
          if (editingId === id) {
            editingId = null;
            view.setFormTask(null);
          }
          await reloadCurrent();
        } catch (error) {
          if (isAborted(error)) return;
          view.notify(messageForError(error), "error");
        }
      });
    },

    async resetData() {
      await withMutation(async () => {
        try {
          await api.resetDemoData();
          editingId = null;
          view.setFormTask(null);
          await reloadCurrent();
          view.notify("Учебные данные восстановлены.", "success");
        } catch (error) {
          if (isAborted(error)) return;
          view.notify(messageForError(error), "error");
        }
      });
    },

    destroy() {
      abortInflight();
    },
  };
}