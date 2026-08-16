const fs = require('fs');
let code = fs.readFileSync('src/utils/pdfGenerator.ts', 'utf8');

code = code.replace(
  `        if (hasLogo) {
          doc.image(logoPath, startX + 15, y + 10, { width: 45 });
        }`,
  `        const logoPath = path.join(process.cwd(), "Systemlogo.jpg");
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, startX + 15, y + 10, { width: 45 });
        }`
);

fs.writeFileSync('src/utils/pdfGenerator.ts', code);
