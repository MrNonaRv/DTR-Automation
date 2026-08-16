const fs = require('fs');
let code = fs.readFileSync('src/utils/pdfGenerator.ts', 'utf8');

// Revert the bad await in generateAllDTRs
code = code.replace(
  `const logoPath = path.join(process.cwd(), "Systemlogo.jpg");
      const hasLogo = fs.existsSync(logoPath);
      
      for (let i = 0; i < employees.length; i += 2) {
        await new Promise(resolve => setImmediate(resolve));`,
  `const logoPath = path.join(process.cwd(), "Systemlogo.jpg");
      const hasLogo = fs.existsSync(logoPath);
      
      const processNext = async () => {
        for (let i = 0; i < employees.length; i += 2) {
          await new Promise(resolve => setImmediate(resolve));`
);

// We need to wrap the whole loop and doc.end() inside processNext() and call it
code = code.replace(
  `      }
      
      doc.end();
    } catch (error) {`,
  `      }
      
      doc.end();
      };
      
      processNext().catch(reject);
    } catch (error) {`
);

// Need to also fix the hasLogo issue inside generateDTR
code = code.replace(
  `        if (hasLogo) {
          doc.image(logoPath, startX + 15, y + 10, { width: 45 });
        }`,
  `        const logoPath = path.join(process.cwd(), "Systemlogo.jpg");
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, startX + 15, y + 10, { width: 45 });
        }`
);
code = code.replace(
  `        const logoPath = path.join(process.cwd(), "Systemlogo.jpg");
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, startX + 15, y + 10, { width: 45 });
        }`,
  `        if (hasLogo) {
          doc.image(logoPath, startX + 15, y + 10, { width: 45 });
        }` // second replace replaces the one inside generateAllDTRs back to using hasLogo
); // Oh wait, generateDTR is entirely separate from generateAllDTRs. The first replace will replace the first occurrence (which is inside generateDTR), and then we want it to be hasLogo for generateAllDTRs. Let's just do it cleanly with sed.

fs.writeFileSync('src/utils/pdfGenerator.ts', code);
