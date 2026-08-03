const fs = require('fs');

// 1. Update src/App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(
  "const formData = new FormData();\n    formData.append('file', file);\n\n    try {\n      const response = await fetch('/api/upload-attendance', {\n        method: 'POST',\n        body: formData,\n      });",
  `try {\n      const reader = new FileReader();\n      const fileBase64 = await new Promise((resolve, reject) => {\n        reader.onload = () => resolve(reader.result.split(',')[1]);\n        reader.onerror = reject;\n        reader.readAsDataURL(file);\n      });\n\n      const response = await fetch('/api/upload-attendance', {\n        method: 'POST',\n        headers: {\n          'Content-Type': 'application/json',\n        },\n        body: JSON.stringify({\n          fileName: file.name,\n          fileData: fileBase64\n        }),\n      });`
);
fs.writeFileSync('src/App.tsx', appContent);

// 2. Update api/index.ts
let apiContent = fs.readFileSync('api/index.ts', 'utf8');
apiContent = apiContent.replace(
  "app.post(\"/api/upload-attendance\", upload.single(\"file\"), (req, res) => {\n  try {\n    if (!req.file) {\n      return res.status(400).json({ error: \"No file uploaded\" });\n    }\n    const parsedData = parseBiometricLogs(req.file.buffer);",
  "app.post(\"/api/upload-attendance\", (req, res) => {\n  try {\n    const { fileData } = req.body;\n    if (!fileData) {\n      return res.status(400).json({ error: \"No file uploaded\" });\n    }\n    const buffer = Buffer.from(fileData, 'base64');\n    const parsedData = parseBiometricLogs(buffer);"
);
apiContent = apiContent.replace(
  "export const config = {\n  api: {\n    bodyParser: false,\n  },\n};",
  ""
);
fs.writeFileSync('api/index.ts', apiContent);

// 3. Update server.ts
let serverContent = fs.readFileSync('server.ts', 'utf8');
serverContent = serverContent.replace(
  "app.post(\"/api/upload-attendance\", upload.single(\"file\"), (req, res) => {\n    try {\n      if (!req.file) {\n        return res.status(400).json({ error: \"No file uploaded\" });\n      }\n      // Parse the uploaded Excel file\n      const parsedData = parseBiometricLogs(req.file.buffer);",
  "app.post(\"/api/upload-attendance\", (req, res) => {\n    try {\n      const { fileData } = req.body;\n      if (!fileData) {\n        return res.status(400).json({ error: \"No file uploaded\" });\n      }\n      // Parse the uploaded Excel file\n      const buffer = Buffer.from(fileData, 'base64');\n      const parsedData = parseBiometricLogs(buffer);"
);
fs.writeFileSync('server.ts', serverContent);

console.log('Fixed upload to use base64 instead of multipart/form-data');
