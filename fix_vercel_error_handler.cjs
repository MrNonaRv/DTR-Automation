const fs = require('fs');
let content = fs.readFileSync('api/index.ts', 'utf8');

if (!content.includes('Global Error Handler')) {
  const handler = `
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Global Error Handler:", err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: "File upload error", details: err.message });
  }
  res.status(500).json({ error: "Internal Server Error", details: err.message || String(err) });
});
`;
  content = content.replace("export default app;", handler + "\nexport default app;");
  fs.writeFileSync('api/index.ts', content);
  console.log('Added global error handler to api/index.ts');
}
