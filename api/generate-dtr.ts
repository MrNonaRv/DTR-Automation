import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { employeeName, period, records, printRange } = req.body || {};
    if (!employeeName || !records) {
      return res.status(400).json({ error: 'Missing employeeName or records in request body' });
    }
    const { generateDTR } = await import('../src/utils/pdfGenerator.js');
    const pdfBuffer = await generateDTR(employeeName, period || "", records, printRange);
    const formattedPeriod = period ? `_${period.replace(/\s+/g, '_')}` : "";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="DTR_${employeeName.replace(/\s+/g, '_')}${formattedPeriod}.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF.", details: error.message });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
