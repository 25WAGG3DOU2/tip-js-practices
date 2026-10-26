// task-selectors.js — отбор видимых задач по фильтру ПР3.
// Возвращает новый массив, порядок и объекты сохраняются.
export function getVisibleTasks(tasks, filter = "all") {
  switch (filter) {
    case "pending":
      return tasks.filter((task) => task.completed === false);
    case "completed":
      return tasks.filter((task) => task.completed === true);
    case "all":
    default:
      return tasks.slice();
  }
}
