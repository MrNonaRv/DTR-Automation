const fs = require('fs');
const files = ['api/index.ts', 'server.ts'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace standard express.json() with one that checks for existing body
  const replacement = `
app.use((req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    next();
  } else {
    express.json({ limit: '50mb' })(req, res, next);
  }
});
app.use((req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    next();
  } else {
    express.urlencoded({ limit: '50mb', extended: true })(req, res, next);
  }
});
`;

  content = content.replace("app.use(express.json({ limit: '50mb' }));", "");
  content = content.replace("app.use(express.urlencoded({ limit: '50mb', extended: true }));", replacement);
  
  // Remove the export const config entirely
  content = content.replace(/export const config = [\s\S]*?;\n/g, "");

  fs.writeFileSync(file, content);
}
console.log('Fixed body parsing for Vercel');
