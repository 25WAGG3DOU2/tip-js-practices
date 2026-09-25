"use strict";

const totalTasks = 12;
const completedTasks = 5;

if (
  typeof totalTasks !== "number" ||
  typeof completedTasks !== "number" ||
  Number.isNaN(totalTasks) ||
  Number.isNaN(completedTasks)
) {
  console.log("Ошибка: вместо числа передана строка или недопустимое числовое значение.");
} else if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks)) {
  console.log("Ошибка: количество задач должно быть целым числом.");
} else if (totalTasks < 0 || completedTasks < 0) {
  console.log("Ошибка: отрицательное количество.");
} else if (totalTasks > 1000) {
  console.log("Ошибка: превышена верхняя граница.");
} else if (completedTasks > totalTasks) {
  console.log("Ошибка: выполнено больше, чем существует.");
} else if (totalTasks === 0 && completedTasks === 0) {
  console.log("Задач пока нет");
} else {
  const remaining = totalTasks - completedTasks;
  const percent = (completedTasks / totalTasks) * 100;

  let status;
  if (completedTasks === 0) {
    status = "Не начато";
  } else if (completedTasks === totalTasks) {
    status = "Завершено";
  } else {
    status = "В работе";
  }

  console.log("Всего задач:", totalTasks);
  console.log("Выполнено:", completedTasks);
  console.log("Осталось:", remaining);
  console.log("Прогресс:", percent.toFixed(1) + "%");
  console.log("Статус:", status);
}