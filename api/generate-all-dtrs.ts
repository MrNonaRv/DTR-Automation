import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { period, employees, printRange } = req.body || {};
    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid employees array in request body' });
    }
    const { generateAllDTRs } = await import('../src/utils/pdfGenerator.js');
    const pdfBuffer = await generateAllDTRs(period || "", employees, printRange);
    const formattedPeriodAll = period ? `_${period.replace(/\s+/g, '_')}` : "";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="All_DTRs${formattedPeriodAll}.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error("Error generating all PDFs:", error);
    res.status(500).json({ error: "Failed to generate PDFs.", details: error.message });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
