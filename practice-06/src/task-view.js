const PRIORITY_LABELS = Object.freeze({
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
});

export function createTaskElement(task, category) {
  const li = document.createElement("li");
  li.className = "task-card";
  if (task.completed) li.classList.add("is-completed");
  li.dataset.taskId = String(task.id);

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;
  li.append(title);

  const meta = document.createElement("div");
  meta.className = "task-meta";

  const status = document.createElement("span");
  status.className = "task-status";
  status.textContent = task.completed ? "Выполнена" : "В работе";

  const priority = document.createElement("span");
  priority.className = "task-priority";
  priority.textContent = PRIORITY_LABELS[task.priority] ?? "";

  const categoryNode = document.createElement("span");
  categoryNode.className = "task-category";
  categoryNode.textContent = category?.name ?? "Без категории";

  meta.append(status, priority, categoryNode);
  li.append(meta);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.dataset.action = "toggle";
  toggleBtn.setAttribute("aria-pressed", String(Boolean(task.completed)));
  const toggleLabel = document.createElement("span");
  toggleLabel.className = "action-label";
  toggleLabel.textContent = task.completed ? "Вернуть в работу" : "Выполнена";
  toggleBtn.append(toggleLabel);

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.dataset.action = "edit";
  const editLabel = document.createElement("span");
  editLabel.className = "action-label";
  editLabel.textContent = "Изменить";
  editBtn.append(editLabel);

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.dataset.action = "delete";
  const deleteLabel = document.createElement("span");
  deleteLabel.className = "action-label";
  deleteLabel.textContent = "Удалить";
  deleteBtn.append(deleteLabel);

  actions.append(toggleBtn, editBtn, deleteBtn);
  li.append(actions);
  return li;
}

export function renderTaskList(list, tasks, categories) {
  const byId = new Map((categories ?? []).map((category) => [category.id, category]));
  list.replaceChildren(
    ...tasks.map((task) => createTaskElement(task, byId.get(task.categoryId))),
  );
}