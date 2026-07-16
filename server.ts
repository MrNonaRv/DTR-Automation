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

  // API Route for uploading and parsing attendance logs
  app.post("/api/upload-attendance", upload.single("file"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Parse the uploaded Excel file
      const parsedData = parseBiometricLogs(req.file.buffer);
      
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
      const { employeeName, period, records } = req.body;
      if (!employeeName || !records) {
        return res.status(400).json({ error: "Missing employeeName or records in request body" });
      }

      const pdfBuffer = await generateDTR(employeeName, period || "", records);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="DTR_${employeeName.replace(/\s+/g, '_')}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ error: "Failed to generate PDF.", details: error.message });
    }
  });

  // API Route for generating all DTR PDFs
  app.post("/api/generate-all-dtrs", async (req, res) => {
    try {
      const { period, employees } = req.body;
      if (!employees || !Array.isArray(employees) || employees.length === 0) {
        return res.status(400).json({ error: "Missing or invalid employees array in request body" });
      }

      const { generateAllDTRs } = await import("./src/utils/pdfGenerator.js");
      const pdfBuffer = await generateAllDTRs(period || "", employees);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="All_DTRs.pdf"`);
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
