import express from "express";
import path from "path";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { parseBiometricLogs } from "./src/utils/excelParser";
import { generateDTR } from "./src/utils/pdfGenerator";

// Setup Multer for in-memory file uploads
const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Route for checking for system updates (assuming git repository)
  app.get("/api/check-update", async (req, res) => {
    try {
      const { exec } = await import("child_process");
      const { promisify } = await import("util");
      const execAsync = promisify(exec);
      
      // Attempt to fetch from remote
      await execAsync("git fetch").catch(() => {});
      
      // Check if we are behind origin/main or origin/master
      try {
        const { stdout } = await execAsync("git status -uno");
        if (stdout.includes("Your branch is behind")) {
          return res.json({ updateAvailable: true });
        }
      } catch (e) {}

      res.json({ updateAvailable: false });
    } catch (error) {
      res.json({ updateAvailable: false, error: String(error) });
    }
  });

  // API Route for performing the update
  app.post("/api/do-update", async (req, res) => {
    try {
      const { exec } = await import("child_process");
      const { promisify } = await import("util");
      const execAsync = promisify(exec);

      // We respond first before restarting
      res.json({ success: true, message: "Updating system. The server will restart shortly..." });
      
      // Execute update in background
      setTimeout(async () => {
        try {
          console.log("[Update] Pulling latest changes...");
          await execAsync("git pull");
          console.log("[Update] Installing dependencies...");
          await execAsync("npm install");
          console.log("[Update] Building application...");
          await execAsync("npm run build");
          console.log("[Update] Update complete! Restarting server...");
          process.exit(0); // If using a process manager like PM2, or a script that loops, this will restart it.
        } catch (err) {
          console.error("[Update] Failed to update:", err);
        }
      }, 1000);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // API Route for uploading and parsing attendance logs
  app.post("/api/upload-attendance", (req, res) => {
    try {
      const { fileData } = req.body;
      if (!fileData) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const buffer = Buffer.from(fileData, 'base64');
      const parsedData = parseBiometricLogs(buffer);
      
      res.json({
        success: true,
        message: "Attendance logs parsed successfully.",
        data: parsedData,
      });
    } catch (error: any) {
      console.error("Error parsing file:", error);
      res.status(500).json({ error: "Failed to parse attendance file.", details: error.message });
    }
  });

  // API Route for generating DTR PDF
  app.post("/api/generate-dtr", async (req, res) => {
    try {
      const { employeeName, period, records, printRange } = req.body;
      if (!employeeName || !records) {
        return res.status(400).json({ error: "Missing employeeName or records in request body" });
      }

      const pdfBuffer = await generateDTR(employeeName, period || "", records, printRange);

      const formattedPeriod = period ? `_${period.replace(/\s+/g, '_')}` : "";
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="DTR_${employeeName.replace(/\s+/g, '_')}${formattedPeriod}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ error: "Failed to generate PDF.", details: error.message });
    }
  });

  // API Route for generating all DTR PDFs
  app.post("/api/generate-all-dtrs", async (req, res) => {
    try {
      const { period, employees, printRange } = req.body;
      if (!employees || !Array.isArray(employees) || employees.length === 0) {
        return res.status(400).json({ error: "Missing or invalid employees array in request body" });
      }

      const { generateAllDTRs } = await import("./src/utils/pdfGenerator");
      const pdfBuffer = await generateAllDTRs(period || "", employees, printRange);

      const formattedPeriodAll = period ? `_${period.replace(/\s+/g, '_')}` : "";
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="All_DTRs${formattedPeriodAll}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error("Error generating all PDFs:", error);
      res.status(500).json({ error: "Failed to generate PDFs.", details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }


  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Global Error Handler:", err);
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: "File upload error", details: err.message });
    }
    res.status(500).json({ error: "Internal Server Error", details: err.message || String(err) });
  });

  app.listen(PORT, "0.0.0.0", () => {

    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
