const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /if \(data\.activeIndex !== undefined && data\.activeIndex !== currentIndex\) \{\s*console\.log\("Auto-syncing to globally active index:", data\.activeIndex\);\s*setCurrentIndex\(data\.activeIndex\);\s*\}/,
  `if (data.activeIndex !== undefined) {
          setCurrentIndex(prev => {
            if (prev !== data.activeIndex) {
              console.log("Auto-syncing to globally active index:", data.activeIndex);
              return data.activeIndex;
            }
            return prev;
          });
        }`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed closure scope issue.");
