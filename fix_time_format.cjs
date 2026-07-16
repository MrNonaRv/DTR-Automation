const fs = require('fs');
let content = fs.readFileSync('src/components/DTREditor.tsx', 'utf8');

const oldFormatTime = /const formatTime = \([\s\S]*?return time;\n  \};/;

const newFormatTime = `const formatTime = (time: string, isAMField: boolean) => {
    if (!time.trim()) return '';
    const clean = time.trim().toUpperCase();
    
    if (/[A-Z]/i.test(clean) && !/\\d/.test(clean)) {
      return clean;
    }
    
    const hasExplicitAM = clean.includes('AM');
    const hasExplicitPM = clean.includes('PM');
    
    const digitsOnly = clean.replace(/\\D/g, '');
    let hours = 0;
    let minutes = 0;
    
    if (digitsOnly.length > 0) {
      if (digitsOnly.length <= 2) {
        hours = parseInt(digitsOnly, 10);
        minutes = 0;
      } else if (digitsOnly.length === 3) {
        hours = parseInt(digitsOnly.substring(0, 1), 10);
        minutes = parseInt(digitsOnly.substring(1, 3), 10);
      } else if (digitsOnly.length >= 4) {
        hours = parseInt(digitsOnly.substring(0, 2), 10);
        minutes = parseInt(digitsOnly.substring(2, 4), 10);
      }
      
      let ampm = isAMField ? 'AM' : 'PM';
      
      if (hasExplicitAM) {
        ampm = 'AM';
      } else if (hasExplicitPM) {
        ampm = 'PM';
      } else {
        if (hours === 12) {
          ampm = 'PM'; // 12 noon is PM
        } else if (hours > 12 && hours < 24) {
          ampm = 'PM';
        } else if (hours === 0 || hours === 24) {
          ampm = 'AM';
        }
      }
      
      if (hours > 12 && hours < 24) hours -= 12;
      if (hours === 0 || hours === 24) hours = 12;
      if (minutes > 59) minutes = 59;
      
      return \`\${hours}:\${minutes.toString().padStart(2, '0')} \${ampm}\`;
    }
    
    return time;
  };`;

content = content.replace(oldFormatTime, newFormatTime);

fs.writeFileSync('src/components/DTREditor.tsx', content);
