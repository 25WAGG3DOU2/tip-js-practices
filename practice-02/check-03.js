// practice-02/check-03.js — самодостаточный, ПР2 не затрагивает
const demoTasks = [
  { id: 1, title: "Изучить функции", completed: true, priority: "medium" },
  {
    id: 4,
    title: "Подготовить модель задач",
    completed: false,
    priority: "high",
  },
  {
    id: 7,
    title: "Проверить методы массивов",
    completed: false,
    priority: "low",
  },
  { id: 10, title: "Оформить README", completed: true, priority: "medium" },
];

function isValidId(id) {
  return typeof id === "number" && Number.isSafeInteger(id) && id > 0;
}

function setTaskCompleted(tasks, id, completed) {
  if (!isValidId(id))
    return { ok: false, error: "Некорректный идентификатор задачи." };
  if (typeof completed !== "boolean")
    return { ok: false, error: "Статус должен быть логическим значением." };
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return { ok: false, error: "Задача не найдена." };
  const next = tasks.slice();
  next[index] = { ...next[index], completed };
  return { ok: true, tasks: next };
}

const ok = setTaskCompleted(demoTasks, 4, true);
console.log("ok:", ok.ok);
console.log("исходный id=4:", demoTasks.find((t) => t.id === 4).completed);
console.log("новый   id=4:", ok.tasks.find((t) => t.id === 4).completed);

const fail = setTaskCompleted(demoTasks, 777, true);
console.log("отказ:", fail);
console.log(
  "исходный id=4 не изменился:",
  demoTasks.find((t) => t.id === 4).completed,
);
