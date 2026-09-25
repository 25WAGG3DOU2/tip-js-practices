"use strict";

let a1 = "8" + 2; //строка + число получится строка
let a2 = "8" - 2; // строка 8 минус число 2 получится 6, то есть число
let a3 = Number("8") + 2; // будет 10, то есть число
let a4 = "12" > "3"; //False, т.к код первой цифры второго элемента больше
let a5 = 12 === "12"; //False, строгое равенство
let a6 = Number(""); //0
let a7 = Number("text"); //NaN
let a8 = Boolean("false"); //true
let a9 = typeof null; // null
let a10 = typeof NaN; // number

console.log(typeof a1);
console.log(typeof a2);
console.log(typeof a3);
console.log(typeof a4);
console.log(typeof a5);
console.log(typeof a6);
console.log(typeof a7);
console.log(typeof a8);
console.log(typeof a9);
console.log(typeof a10);
