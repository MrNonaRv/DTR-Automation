const fs = require('fs');
let code = fs.readFileSync('src/utils/pdfGenerator.ts', 'utf8');

// Inside generateAllDTRs:
// We can change the for loop to be async

code = code.replace(
  `for (let i = 0; i < employees.length; i += 2) {`,
  `const logoPath = path.join(process.cwd(), "Systemlogo.jpg");
      const hasLogo = fs.existsSync(logoPath);
      
      for (let i = 0; i < employees.length; i += 2) {
        await new Promise(resolve => setImmediate(resolve));`
);

code = code.replace(
  `        const logoPath = path.join(process.cwd(), "Systemlogo.jpg");
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, startX + 15, y + 10, { width: 45 });
        }`,
  `        if (hasLogo) {
          doc.image(logoPath, startX + 15, y + 10, { width: 45 });
        }`
);

// We need to also do the same for generateDTR
code = code.replace(
  `const logoPath = path.join(process.cwd(), "Systemlogo.jpg");
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, startX + 15, y + 10, { width: 45 });
        }`,
  `const logoPath = path.join(process.cwd(), "Systemlogo.jpg");
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, startX + 15, y + 10, { width: 45 });
        }` // actually it's fine since it only runs twice
);

// Because generateAllDTRs is an async function that returns a Promise, wait, the `return new Promise((resolve, reject) => {` inside `generateAllDTRs` makes it tricky to use `await` inside the executor. Let's rewrite it.

fs.writeFileSync('src/utils/pdfGenerator.ts', code);
