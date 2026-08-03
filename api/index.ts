import { generateDTR, generateAllDTRs } from '../src/utils/pdfGenerator';
import express from 'express';

import { parseBiometricLogs } from '../src/utils/excelParser';



const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get("/api/check-update", (req, res) => {
  res.json({ updateAvailable: false, message: "Updates handled by Vercel" });
});

app.post("/api/do-update", (req, res) => {
  res.status(400).json({ success: false, message: "Updates handled by Vercel" });
});

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

app.post("/api/generate-all-dtrs", async (req, res) => {
  try {
    const { period, employees, printRange } = req.body;
    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ error: "Missing or invalid employees array in request body" });
    }
    
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


app.use((err: any, req: any, res: any, next: any) => {
  console.error("Global Error Handler:", err);

  res.status(500).json({ error: "Internal Server Error", details: err.message || String(err) });
});

export default app;






export const config = {
  api: {
    bodyParser: false,
  },
};
