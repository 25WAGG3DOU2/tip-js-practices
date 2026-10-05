import { demoTasks, variantTasks, variantNumber } from "./data.js";
import { findTaskById, setTaskCompleted, removeTask } from "./task-service.js";
import { getVisibleTasks } from "./task-selectors.js";
import {
  renderTaskList,
  renderSummary,
  renderEmptyState,
} from "./task-view.js";

const elements = {
  list: document.querySelector("#task-list"),
  filters: document.querySelector("#task-filters"),
  summary: document.querySelector("#task-summary"),
  empty: document.querySelector("#empty-message"),
  message: document.querySelector("#operation-message"),
  datasetLabel: document.querySelector("#dataset-label"),
};

const isVariant =
  new URLSearchParams(window.location.search).get("dataset") === "variant";
const initialTasks = isVariant ? variantTasks : demoTasks;
let currentTasks = initialTasks.map((task) => ({ ...task }));
let currentFilter = "all";

elements.datasetLabel.textContent = isVariant
  ? `Индивидуальный вариант: ${variantNumber ?? "не указан"}`
  : "Общий контрольный набор";

/* ------------------------------------------------------------------ */
/*  Вспомогательные функции                                            */
/* ------------------------------------------------------------------ */

function parseTaskId(raw) {
  if (raw === undefined || raw === null || raw === "") return null;
  const id = Number(raw);
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  return id;
}

function showMessage(text) {
  elements.message.textContent = text;
}

function clearMessage() {
  elements.message.textContent = "";
}

/* ------------------------------------------------------------------ */
/*  renderApp                                                          */
/* ------------------------------------------------------------------ */

function renderApp() {
  const visibleTasks = getVisibleTasks(currentTasks, currentFilter);

  renderTaskList(elements.list, visibleTasks);
  renderSummary(elements.summary, currentTasks, visibleTasks.length);
  renderEmptyState(elements.empty, currentTasks.length, visibleTasks.length);

  elements.filters.querySelectorAll("button[data-filter]").forEach((btn) => {
    const isActive = btn.dataset.filter === currentFilter;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });
}

/* ------------------------------------------------------------------ */
/*  handleTaskListClick                                                */
/* ------------------------------------------------------------------ */

function handleTaskListClick(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const button = target.closest("button[data-action]");
  if (!button) return;
  if (!elements.list.contains(button)) return;

  const action = button.dataset.action;
  if (action !== "toggle" && action !== "delete") return;

  const card = button.closest("li[data-task-id]");
  if (!card) return;

  const id = parseTaskId(card.dataset.taskId);
  if (id === null) {
    showMessage("Некорректный идентификатор задачи.");
    return;
  }

  const task = findTaskById(currentTasks, id);
  if (!task) {
    showMessage(`Задача с идентификатором ${id} не найдена.`);
    return;
  }

  let result;
  if (action === "toggle") {
    result = setTaskCompleted(currentTasks, id, !task.completed);
  } else {
    result = removeTask(currentTasks, id);
  }

  if (!result || !result.ok) {
    const reason = (result && result.error) || "не удалось изменить данные";
    showMessage(`Не удалось выполнить действие: ${reason}.`);
    return;
  }

  currentTasks = result.tasks;
  clearMessage();
  renderApp();
  restoreTaskFocus(id, action);
}

/* ------------------------------------------------------------------ */
/*  handleFilterClick                                                  */
/* ------------------------------------------------------------------ */

function handleFilterClick(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const button = target.closest("button[data-filter]");
  if (!button) return;
  if (!elements.filters.contains(button)) return;

  const filter = button.dataset.filter;
  if (filter !== "all" && filter !== "pending" && filter !== "completed") {
    return;
  }

  currentFilter = filter;
  clearMessage();
  renderApp();
}

/* ------------------------------------------------------------------ */
/*  Фокус и подписки                                                   */
/* ------------------------------------------------------------------ */

function restoreTaskFocus(id, action) {
  const actionButton = elements.list.querySelector(
    `[data-task-id="${id}"] button[data-action="${action}"]`,
  );
  const filterButton = elements.filters.querySelector(
    `[data-filter="${currentFilter}"]`,
  );
  (actionButton ?? filterButton)?.focus();
}

elements.list.addEventListener("click", handleTaskListClick);
elements.filters.addEventListener("click", handleFilterClick);

try {
  renderApp();
} catch (error) {
  elements.message.textContent = `Ошибка запуска: ${error.message}`;
  console.error(error);
}
