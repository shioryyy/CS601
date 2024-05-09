import { getToday } from './date_mod.js';

export function sayHiWithDate() {
    const today = getToday();
    return `Hello, Guest. Today's date is ${today.toDateString()}.`;
}
