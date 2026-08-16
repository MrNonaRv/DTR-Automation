const fs = require('fs');

async function test() {
   // Let's emulate what we get from an Excel JS import of an empty row
   const mockValue = { richText: [{ text: "1" }] };
   const str = String(mockValue || '').trim();
   console.log("String of object:", str);
   console.log("parseInt:", parseInt(str, 10));
}
test();
