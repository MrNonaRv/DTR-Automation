const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  const oldParseDatText = `  const parseDatText = (text: string) => {
    const lines = text.split(/\\r?\\n/).filter(l => l.trim().length > 0);
    const records = [];
    for (const line of lines) {
      const parts = line.split('\\t');
      if (parts.length < 2) continue;
      const userId = parseInt(parts[0], 10);
      const dt = parseDateTimeString(parts[1].trim());
      if (!isNaN(userId) && dt) records.push({ userId, dt });
    }
    return records;
  };`;
  
  const oldParseDatTextJS = `  function parseDatText(text){
    const lines = text.split(/\\r?\\n/).filter(l => l.trim().length > 0);
    const records = [];
    for(const line of lines){
      const parts = line.split('\\t');
      if(parts.length < 2) continue;
      const userId = parseInt(parts[0], 10);
      const dt = parseDateTimeString(parts[1].trim());
      if(!isNaN(userId) && dt) records.push({ userId, dt });
    }
    return records;
  }`;

  const newParseDatText = `  const parseDatText = (text: string) => {
    const lines = text.split(/\\r?\\n/).filter(l => l.trim().length > 0);
    const records = [];
    for (const line of lines) {
      const parts = line.trim().split(/\\s+/);
      if (parts.length < 3) continue;
      const userId = parseInt(parts[0], 10);
      const dt = parseDateTimeString(parts[1] + ' ' + parts[2]);
      if (!isNaN(userId) && dt) records.push({ userId, dt });
    }
    return records;
  };`;

  const newParseDatTextJS = `  function parseDatText(text){
    const lines = text.split(/\\r?\\n/).filter(l => l.trim().length > 0);
    const records = [];
    for(const line of lines){
      const parts = line.trim().split(/\\s+/);
      if(parts.length < 3) continue;
      const userId = parseInt(parts[0], 10);
      const dt = parseDateTimeString(parts[1] + ' ' + parts[2]);
      if(!isNaN(userId) && dt) records.push({ userId, dt });
    }
    return records;
  }`;

  if (content.includes("split('\\t')")) {
      if (filePath.endsWith('.tsx')) {
         content = content.replace(oldParseDatText, newParseDatText);
      } else {
         content = content.replace(oldParseDatTextJS, newParseDatTextJS);
      }
      fs.writeFileSync(filePath, content);
      console.log('Fixed', filePath);
  }
}

fixFile('src/components/ScannerTool.tsx');
fixFile('public/scanner.html');
