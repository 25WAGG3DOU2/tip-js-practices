// practice-02/check-02.js
import { demoTasks, getPendingTasks } from "./checks.js";

console.log(
  "pending ids:",
  getPendingTasks(demoTasks).map((t) => t.id),
); // [4, 7]
console.log("empty:", getPendingTasks([])); // []
console.log(
  "исходный массив:",
  demoTasks.map((t) => t.id),
); // [1, 4, 7, 10]
