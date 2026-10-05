// main.js
import { demoTasks } from "./data.js";
import {
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
  getPendingTasks,
  getTaskTitles,
  getTaskStats,
} from "./task-service.js";

// Вспомогательная функция: применяет успешный результат, иначе сообщает об ошибке.
function applyResult(currentTasks, result, actionLabel) {
  if (result.ok) {
    console.log(`[OK] ${actionLabel}`);
    return result.tasks;
  }
  console.error(`[ОШИБКА] ${actionLabel}: ${result.error}`);
  return currentTasks;
}

function printState(label, tasks) {
  console.log(`\n=== ${label} ===`);
  console.log("Задачи:", tasks);
  console.log("Названия:", getTaskTitles(tasks));
  console.log("Невыполненные:", getPendingTasks(tasks));

  const { total, completed, pending, progress } = getTaskStats(tasks);
  console.log(`Всего: ${total}; выполнено: ${completed}; осталось: ${pending}`);
  if (total === 0) {
    console.log("Задач пока нет");
  } else {
    console.log(`Прогресс: ${progress.toFixed(1)}%`);
  }
}

// Сохраняем снимок исходных данных для проверки отсутствия мутации.
const originalSnapshot = JSON.stringify(demoTasks);

let currentTasks = demoTasks;

// 1. Исходное состояние
printState("Исходный набор", currentTasks);

// 2. Добавить задачу id = 20
currentTasks = applyResult(
  currentTasks,
  addTask(currentTasks, 20, "Добавить проверку", "high"),
  "addTask(id=20)"
);
printState("После добавления id = 20", currentTasks);

// 3. Установить completed = true для id = 4
currentTasks = applyResult(
  currentTasks,
  setTaskCompleted(currentTasks, 4, true),
  "setTaskCompleted(id=4, true)"
);
printState("После выполнения id = 4", currentTasks);

// 4. Переименовать id = 10
currentTasks = applyResult(
  currentTasks,
  renameTask(currentTasks, 10, "Подготовить инструкцию запуска"),
  "renameTask(id=10)"
);
printState("После переименования id = 10", currentTasks);

// 5. Удалить id = 7
currentTasks = applyResult(
  currentTasks,
  removeTask(currentTasks, 7),
  "removeTask(id=7)"
);
printState("После удаления id = 7", currentTasks);

// 6. Демонстрация отказа — повторяющийся id
const duplicateResult = addTask(currentTasks, 4, "Дубликат");
console.log("\n=== Проверка отказа: повторяющийся id ===");
if (!duplicateResult.ok) {
  console.error(`Ошибка: ${duplicateResult.error}`);
}

// 6b. Демонстрация отказа — неверный тип статуса
const badStatusResult = setTaskCompleted(currentTasks, 4, "true");
console.log("\n=== Проверка отказа: неверный тип статуса ===");
if (!badStatusResult.ok) {
  console.error(`Ошибка: ${badStatusResult.error}`);
}

// 6c. Демонстрация отказа — отсутствующая задача
const missingResult = removeTask(currentTasks, 999);
console.log("\n=== Проверка отказа: отсутствующая задача ===");
if (!missingResult.ok) {
  console.error(`Ошибка: ${missingResult.error}`);
}

// 7. Проверка, что исходный demoTasks не изменился
console.log("\n=== Проверка отсутствия мутации demoTasks ===");
const afterSnapshot = JSON.stringify(demoTasks);
console.log("Исходный набор не изменён:", originalSnapshot === afterSnapshot);
if (originalSnapshot !== afterSnapshot) {
  console.error("ВНИМАНИЕ: demoTasks был изменён!");
}

// 8. Финальная сводка
printState("Итоговое состояние", currentTasks);
const finalIds = currentTasks.map((task) => task.id);
console.log("\nИдентификаторы итогового массива:", finalIds);