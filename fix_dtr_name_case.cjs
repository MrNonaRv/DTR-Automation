const fs = require('fs');
let content = fs.readFileSync('src/components/DTREditor.tsx', 'utf8');

const titleCaseFunc = `
const toTitleCase = (str: string) => {
  if (!str) return str;
  return str.replace(/\\w\\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
`;

if (!content.includes('toTitleCase')) {
  content = content.replace('export const DTREditor = memo(function DTREditor(', titleCaseFunc + '\\nexport const DTREditor = memo(function DTREditor(');
}

content = content.replace(
  'const newName = e.target.value;',
  'const newName = toTitleCase(e.target.value);'
);

fs.writeFileSync('src/components/DTREditor.tsx', content);
