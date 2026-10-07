// practice-02/checks.js
// Общий контрольный набор задач (ПР2–ПР3).
export const demoTasks = [
  { id: 1,  title: "Изучить функции",           completed: true,  priority: "medium" },
  { id: 4,  title: "Подготовить модель задач",  completed: false, priority: "high"   },
  { id: 7,  title: "Проверить методы массивов", completed: false, priority: "low"    },
  { id: 10, title: "Оформить README",           completed: true,  priority: "medium" },
];

// Отбор невыполненных задач с сохранением порядка.
export function getPendingTasks(tasks) {
  return tasks.filter((task) => task.completed === false);
}