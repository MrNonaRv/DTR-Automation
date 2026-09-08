const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `  const [isDragging, setIsDragging] = useState(false);`;
const replace = `  useEffect(() => {
    if (showEditor && !parsedData) {
      setShowEditor(false);
    }
  }, [showEditor, parsedData]);

  const [isDragging, setIsDragging] = useState(false);`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched editor safety.");
} else {
  console.log("Not found.");
}
