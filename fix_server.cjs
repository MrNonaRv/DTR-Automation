const fs = require('fs');

let serverContent = fs.readFileSync('server.ts', 'utf8');
serverContent = serverContent.replace(
  "app.post(\"/api/upload-attendance\", upload.single(\"file\"), (req, res) => {\n    try {\n      if (!req.file) {\n        return res.status(400).json({ error: \"No file uploaded\" });\n      }\n      // Parse the uploaded Excel file\n      const parsedData = parseBiometricLogs(req.file.buffer);",
  "app.post(\"/api/upload-attendance\", (req, res) => {\n    try {\n      const { fileData } = req.body;\n      if (!fileData) {\n        return res.status(400).json({ error: \"No file uploaded\" });\n      }\n      // Parse the uploaded Excel file\n      const buffer = Buffer.from(fileData, 'base64');\n      const parsedData = parseBiometricLogs(buffer);"
);
fs.writeFileSync('server.ts', serverContent);

console.log('Fixed server.ts');
