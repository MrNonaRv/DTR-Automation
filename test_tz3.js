const valB = new Date("2023-01-01T08:30:00.000Z"); // what xlsx gives us for 8:30 AM face value
const localDate = new Date(valB.getUTCFullYear(), valB.getUTCMonth(), valB.getUTCDate(), valB.getUTCHours(), valB.getUTCMinutes(), valB.getUTCSeconds());
console.log(localDate.getHours()); // Should be 8 regardless of timezone!

const valB2 = 45100.354166666664; // 8:30 AM face value
const utcDate = new Date(Math.round((valB2 - 25569) * 86400 * 1000));
const localDate2 = new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate(), utcDate.getUTCHours(), utcDate.getUTCMinutes(), utcDate.getUTCSeconds());
console.log(localDate2.getHours()); // Should be 8 regardless of timezone!
