"use strict";

const r1 = "8" + 2;
console.log("1) Результат:", r1);
console.log("   Тип:", typeof r1);

const r2 = "8" - 2;
console.log("2) Результат:", r2);
console.log("   Тип:", typeof r2);

const r3 = Number("8") + 2;
console.log("3) Результат:", r3);
console.log("   Тип:", typeof r3);

const r4 = "12" > "3";
console.log("4) Результат:", r4);
console.log("   Тип:", typeof r4);

const r5 = 12 === "12";
console.log("5) Результат:", r5);
console.log("   Тип:", typeof r5);

const r6 = Number("");
console.log("6) Результат:", r6);
console.log("   Тип:", typeof r6);

const r7 = Number("text");
console.log("7) Результат:", r7);
console.log("   Тип:", typeof r7);

const r8 = Boolean("false");
console.log("8) Результат:", r8);
console.log("   Тип:", typeof r8);

const r9 = typeof null;
console.log("9) Результат:", r9);
console.log("   Тип результата:", typeof r9);

const r10 = typeof NaN;
console.log("10) Результат:", r10);
console.log("    Тип результата:", typeof r10);
