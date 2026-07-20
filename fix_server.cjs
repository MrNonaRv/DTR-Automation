const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

if (!content.includes('app.use((err: any, req: any, res: any, next: any)')) {
    const errorHandler = `
  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Global Error Handler:", err);
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: "File upload error", details: err.message });
    }
    res.status(500).json({ error: "Internal Server Error", details: err.message || String(err) });
  });

  app.listen(PORT, "0.0.0.0", () => {
`;
    content = content.replace('  app.listen(PORT, "0.0.0.0", () => {', errorHandler);
    fs.writeFileSync('server.ts', content);
    console.log('Added global error handler');
}
