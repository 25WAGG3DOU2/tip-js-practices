// Общий контрольный набор. Для своего варианта ниже предусмотрен отдельный массив.
// Идентификатор задачи не совпадает с её индексом в массиве.
export const demoTasks = [
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

// Индивидуальный вариант 4: шесть задач по разделу 7 методички ПР2/ПР3.
// Если в ПР3 у тебя были другие id/названия/статусы — подставь свои,
// структура и число задач должны остаться.
export const variantNumber = 4;
export const variantTasks = [
  { id: 7,  title: "Собрать требования",           completed: true,  priority: "medium" },
  { id: 23, title: "Спроектировать модель задачи", completed: false, priority: "high"   },
  { id: 31, title: "Реализовать сервисные функции", completed: true, priority: "medium" },
  { id: 37, title: "Проверить граничные случаи",   completed: false, priority: "high"   },
  { id: 52, title: "Подготовить отчёт",            completed: true,  priority: "low"    },
  { id: 64, title: "Провести ревью",               completed: false, priority: "medium" },
];