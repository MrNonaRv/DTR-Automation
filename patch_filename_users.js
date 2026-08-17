const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const origFilenameLogic = `          downloadFileName = \`All_DTR_\${monthName}_\${dateRangeStr}_\${y}.pdf\`;
        } catch(e) {
          downloadFileName = \`All_DTR_\${period}_\${printRange}.pdf\`;
        }
      }
      link.setAttribute('download', downloadFileName);`;

const newFilenameLogic = `          downloadFileName = \`All_DTR_\${monthName}_\${dateRangeStr}_\${y}\${userRange.trim() ? \`_Users_\${userRange.trim()}\` : ''}.pdf\`;
        } catch(e) {
          downloadFileName = \`All_DTR_\${period}_\${printRange}\${userRange.trim() ? \`_Users_\${userRange.trim()}\` : ''}.pdf\`;
        }
      } else if (userRange.trim()) {
         downloadFileName = \`All_DTR_Users_\${userRange.trim()}.pdf\`;
      }
      link.setAttribute('download', downloadFileName);`;

code = code.replace(origFilenameLogic, newFilenameLogic);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched filename logic for user ranges!");
