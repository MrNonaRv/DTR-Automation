const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `      if (!response.ok) {
        throw new Error('Failed to generate DTR');
      }`;

const rep1 = `      if (!response.ok) {
        const text = await response.text();
        throw new Error('Failed to generate DTR: ' + text.substring(0, 100));
      }
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
         const errJson = await response.json();
         throw new Error(errJson.error || 'Failed to generate DTR');
      }
      if (!contentType || !contentType.includes("application/pdf")) {
         throw new Error('Expected PDF but got: ' + contentType);
      }`;

content = content.replace(target1, rep1);

const target2 = `      if (!response.ok) {
        throw new Error('Failed to generate DTRs');
      }`;

const rep2 = `      if (!response.ok) {
        const text = await response.text();
        throw new Error('Failed to generate DTRs: ' + text.substring(0, 100));
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
         const errJson = await response.json();
         throw new Error(errJson.error || 'Failed to generate DTRs');
      }
      if (!contentType || !contentType.includes("application/pdf")) {
         throw new Error('Expected PDF but got: ' + contentType);
      }`;

content = content.replace(target2, rep2);

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed downloads');
