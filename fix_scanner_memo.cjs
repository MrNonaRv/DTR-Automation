const fs = require('fs');
let content = fs.readFileSync('src/components/ScannerTool.tsx', 'utf8');

content = content.replace(
  "export function ScannerTool({ onClose }: { onClose: () => void }) {",
  "import { memo } from 'react';\n\nexport const ScannerTool = memo(function ScannerTool({ onClose }: { onClose: () => void }) {"
);

content = content.replace(
  "import React, { useState, useEffect, useRef } from 'react';",
  "import React, { useState, useEffect, useRef } from 'react';"
);

// We should also replace the closing brace of ScannerTool
content = content.replace(
  "      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}\n    </div>\n  );\n}",
  "      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}\n    </div>\n  );\n});"
);

fs.writeFileSync('src/components/ScannerTool.tsx', content);
console.log('Memoized ScannerTool');
