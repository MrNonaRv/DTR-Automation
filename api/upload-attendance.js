import { parseBiometricLogs } from "../src/utils/excelParser";
function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const { fileData } = req.body || {};
    if (!fileData) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const buffer = Buffer.from(fileData, "base64");
    const parsedData = parseBiometricLogs(buffer);
    res.status(200).json({
      success: true,
      message: "Attendance logs parsed successfully.",
      data: parsedData
    });
  } catch (error) {
    console.error("Error parsing file:", error);
    res.status(500).json({ error: "Failed to parse attendance file.", details: error.message });
  }
}
const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb"
    }
  }
};
export {
  config,
  handler as default
};
