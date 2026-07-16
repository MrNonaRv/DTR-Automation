import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { AttendanceRecord } from "./excelParser";



export async function generateDTR(
  employeeName: string,
  period: string,
  records: AttendanceRecord[],
  printRange: 'full' | '1-15' | '16-31' = 'full'
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 20 });
            const buffers: Buffer[] = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      function drawDTR(startX: number, startY: number, width: number) {
        let y = startY;
        const leftX = startX;
        const rightX = startX + width;

        const logoPath = path.join(process.cwd(), "Systemlogo.jpg");
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, startX + 15, y + 10, { width: 45 });
        }

        // Top header box
        doc.fontSize(8).font("Helvetica");
        
        // Draw text centered
        doc.text("REPUBLIC OF THE PHILIPPINES", startX, y + 15, { width: width, align: "center" });
        doc.text("PROVINCE OF CAPIZ", startX, y + 25, { width: width, align: "center" });
        doc.text("MUNICIPALITY OF MAMBUSAO", startX, y + 35, { width: width, align: "center" });
        
        // Faded style for "DAILY TIME RECORD" using gray color
        doc.fontSize(10).font("Helvetica-Bold").fillColor("#888888");
        doc.text("DAILY TIME RECORD", startX, y + 48, { width: width, align: "center" });
        doc.fillColor("black");

        y += 70;
        
        // Line above NAME
        doc.moveTo(leftX, y).lineTo(rightX, y).stroke();
        
        // NAME
        doc.fontSize(10).font("Helvetica-Bold");
        doc.text("NAME:", leftX + 4, y + 6);
        doc.font("Helvetica").text(employeeName, leftX + 45, y + 6);
        
        y += 22;
        // Line above period
        doc.moveTo(leftX, y).lineTo(rightX, y).stroke();
        
        // Period
        doc.fontSize(9).font("Helvetica-Oblique").font("Helvetica-BoldOblique");
        doc.text("For the period of:", leftX + 4, y + 5);
        doc.font("Helvetica").text(period, leftX + 90, y + 5);
        
        y += 18;
        // Line above table
        doc.moveTo(leftX, y).lineTo(rightX, y).stroke();

        // Table Columns
        // DAYS | ARRIVAL | DEPARTURE | ARRIVAL | DEPARTURE | UNDER/OVERTIME
        const colW = [25, 45, 48, 45, 48, 54]; // Total width = 265
        let cx = leftX;
        const cols: number[] = [];
        for (let w of colW) {
          cols.push(cx);
          cx += w;
        }
        cols.push(rightX); // End of last col

        const tableStartY = y;
        
        // Draw table header
        const headerHeight = 25;
        doc.font("Helvetica-Bold").fontSize(7);
        doc.text("DAYS", cols[0], y + 10, { width: colW[0], align: "center" });
        doc.text("ARRIVAL", cols[1], y + 10, { width: colW[1], align: "center" });
        doc.text("DEPARTURE", cols[2], y + 10, { width: colW[2], align: "center" });
        doc.text("ARRIVAL", cols[3], y + 10, { width: colW[3], align: "center" });
        doc.text("DEPARTURE", cols[4], y + 10, { width: colW[4], align: "center" });
        
        doc.text("UNDER/", cols[5], y + 5, { width: colW[5], align: "center" });
        doc.text("OVERTIME", cols[5], y + 15, { width: colW[5], align: "center" });

        y += headerHeight;
        doc.moveTo(leftX, y).lineTo(rightX, y).stroke();

        // Determine rows based on print range
        let dataStartDay = 1;
        let dataEndDay = 31;
        if (printRange === '1-15') {
          dataEndDay = 15;
        } else if (printRange === '16-31') {
          dataStartDay = 16;
        }

        // Draw rows
        const rowHeight = 15;
        doc.font("Helvetica").fontSize(8);
        for (let i = 1; i <= 31; i++) {
          doc.text(i.toString(), cols[0], y + 4, { width: colW[0], align: "center" });
          
          
          let targetMonth = -1;
          let targetYear = -1;
          // In generateDTR and generateAllDTRs, period is available in the closure
          const parsedDate = new Date(period);
          if (!isNaN(parsedDate.getTime())) {
            targetMonth = parsedDate.getMonth() + 1;
            targetYear = parsedDate.getFullYear();
          } else if (records.length > 0) {
            const parts = records[0].date.split("-");
            if (parts.length >= 2) {
              targetYear = parseInt(parts[0], 10);
              targetMonth = parseInt(parts[1], 10);
            }
          }
          
          const record = records.find(r => {
            const parts = r.date.split("-");
            if (parts.length < 3) return false;
            const rYear = parseInt(parts[0], 10);
            const rMonth = parseInt(parts[1], 10);
            const rDay = parseInt(parts[2], 10);
            
            if (targetYear !== -1 && targetMonth !== -1) {
              return rYear === targetYear && rMonth === targetMonth && rDay === i;
            }
            return rDay === i;
          });

          const isDateInRange = i >= dataStartDay && i <= dataEndDay;
          const amInVal = (record && isDateInRange && record.amIn) ? record.amIn : "";
          const amOutVal = (record && isDateInRange && record.amOut) ? record.amOut : "";
          const pmInVal = (record && isDateInRange && record.pmIn) ? record.pmIn : "";
          const pmOutVal = (record && isDateInRange && record.pmOut) ? record.pmOut : "";

          const safeEmpName = employeeName.replace(/[^a-zA-Z0-9]/g, '_');
          const fieldPrefix = `${safeEmpName}_${startX}_day_${i}`;

          if (isDateInRange) {
            doc.text(amInVal, cols[1], y + 4, { width: colW[1], align: "center" });
            doc.text(amOutVal, cols[2], y + 4, { width: colW[2], align: "center" });
            doc.text(pmInVal, cols[3], y + 4, { width: colW[3], align: "center" });
            doc.text(pmOutVal, cols[4], y + 4, { width: colW[4], align: "center" });
          }

          y += rowHeight;
          doc.moveTo(leftX, y).lineTo(rightX, y).stroke();
        }

        // Draw vertical lines for the table
        for (let c of cols) {
          doc.moveTo(c, tableStartY).lineTo(c, y).stroke();
        }

        // Certification text
        doc.font("Helvetica-Oblique").fontSize(7);
        const cert = "I hereby certify in my honor that the above is true and correct report of the hours\nof work performed, record of which waas made daily at the time of arrival and\ndeparture from the office.";
        doc.text(cert, leftX + 2, y + 4, { width: width - 4, align: "left", lineGap: 1.5 });
        
        y += 35;
        doc.moveTo(leftX, y).lineTo(rightX, y).stroke();

        // Signature
        y += 20;
        doc.font("Helvetica-Bold").fontSize(8);
        doc.text("SIGNATURE OF EMPLOYEE", leftX, y, { width: width, align: "center" });
        
        y += 12;
        doc.moveTo(leftX, y).lineTo(rightX, y).stroke();

        // Admin section
        y += 20;
        doc.save();
        doc.dash(3, { space: 3 });
        // The dotted line in the image
        doc.moveTo(leftX + 25, y).lineTo(rightX - 25, y).stroke();
        doc.moveTo(leftX + 80, y + 15).lineTo(rightX - 80, y + 15).stroke();
        doc.restore();

        y += 35;
        doc.font("Helvetica-Bold").fontSize(10);
        doc.text("DESAM D. MONTORIO", leftX, y, { width: width, align: "center" });
        doc.font("Helvetica").fontSize(8);
        doc.text("Municipal Administrator Designate/HRMO V", leftX, y + 12, { width: width, align: "center" });

        y += 30; // Final bottom padding
        
        // Outer border
        doc.rect(startX, startY, width, y - startY).stroke();
      }

      // Draw left DTR
      drawDTR(25, 20, 265);
      
      // Draw right DTR
      drawDTR(305, 20, 265);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export async function generateAllDTRs(
  period: string,
  employees: { employeeName: string, records: AttendanceRecord[] }[],
  printRange: 'full' | '1-15' | '16-31' = 'full'
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 20 });
            const buffers: Buffer[] = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      function drawDTR(startX: number, startY: number, width: number, employeeName: string, records: AttendanceRecord[]) {
        let y = startY;
        const leftX = startX;
        const rightX = startX + width;

        const logoPath = path.join(process.cwd(), "Systemlogo.jpg");
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, startX + 15, y + 10, { width: 45 });
        }

        // Top header box
        doc.fontSize(8).font("Helvetica");
        
        // Draw text centered
        doc.text("REPUBLIC OF THE PHILIPPINES", startX, y + 15, { width: width, align: "center" });
        doc.text("PROVINCE OF CAPIZ", startX, y + 25, { width: width, align: "center" });
        doc.text("MUNICIPALITY OF MAMBUSAO", startX, y + 35, { width: width, align: "center" });
        
        // Faded style for "DAILY TIME RECORD" using gray color
        doc.fontSize(10).font("Helvetica-Bold").fillColor("#888888");
        doc.text("DAILY TIME RECORD", startX, y + 48, { width: width, align: "center" });
        doc.fillColor("black");

        y += 70;
        
        // Line above NAME
        doc.moveTo(leftX, y).lineTo(rightX, y).stroke();
        
        // NAME
        doc.fontSize(10).font("Helvetica-Bold");
        doc.text("NAME:", leftX + 4, y + 6);
        doc.font("Helvetica").text(employeeName, leftX + 45, y + 6);
        
        y += 22;
        // Line above period
        doc.moveTo(leftX, y).lineTo(rightX, y).stroke();
        
        // Period
        doc.fontSize(9).font("Helvetica-Oblique").font("Helvetica-BoldOblique");
        doc.text("For the period of:", leftX + 4, y + 5);
        doc.font("Helvetica").text(period, leftX + 90, y + 5);
        
        y += 18;
        // Line above table
        doc.moveTo(leftX, y).lineTo(rightX, y).stroke();

        // Table Columns
        const colW = [25, 45, 48, 45, 48, 54]; // Total width = 265
        let cx = leftX;
        const cols: number[] = [];
        for (let w of colW) {
          cols.push(cx);
          cx += w;
        }
        cols.push(rightX); // End of last col

        const tableStartY = y;
        
        // Draw table header
        const headerHeight = 25;
        doc.font("Helvetica-Bold").fontSize(7);
        doc.text("DAYS", cols[0], y + 10, { width: colW[0], align: "center" });
        doc.text("ARRIVAL", cols[1], y + 10, { width: colW[1], align: "center" });
        doc.text("DEPARTURE", cols[2], y + 10, { width: colW[2], align: "center" });
        doc.text("ARRIVAL", cols[3], y + 10, { width: colW[3], align: "center" });
        doc.text("DEPARTURE", cols[4], y + 10, { width: colW[4], align: "center" });
        
        doc.text("UNDER/", cols[5], y + 5, { width: colW[5], align: "center" });
        doc.text("OVERTIME", cols[5], y + 15, { width: colW[5], align: "center" });

        y += headerHeight;
        doc.moveTo(leftX, y).lineTo(rightX, y).stroke();

        // Determine rows based on print range
        let dataStartDay = 1;
        let dataEndDay = 31;
        if (printRange === '1-15') {
          dataEndDay = 15;
        } else if (printRange === '16-31') {
          dataStartDay = 16;
        }

        // Draw rows
        const rowHeight = 15;
        doc.font("Helvetica").fontSize(8);
        for (let i = 1; i <= 31; i++) {
          doc.text(i.toString(), cols[0], y + 4, { width: colW[0], align: "center" });
          
          
          let targetMonth = -1;
          let targetYear = -1;
          // In generateDTR and generateAllDTRs, period is available in the closure
          const parsedDate = new Date(period);
          if (!isNaN(parsedDate.getTime())) {
            targetMonth = parsedDate.getMonth() + 1;
            targetYear = parsedDate.getFullYear();
          } else if (records.length > 0) {
            const parts = records[0].date.split("-");
            if (parts.length >= 2) {
              targetYear = parseInt(parts[0], 10);
              targetMonth = parseInt(parts[1], 10);
            }
          }
          
          const record = records.find(r => {
            const parts = r.date.split("-");
            if (parts.length < 3) return false;
            const rYear = parseInt(parts[0], 10);
            const rMonth = parseInt(parts[1], 10);
            const rDay = parseInt(parts[2], 10);
            
            if (targetYear !== -1 && targetMonth !== -1) {
              return rYear === targetYear && rMonth === targetMonth && rDay === i;
            }
            return rDay === i;
          });

          const isDateInRange = i >= dataStartDay && i <= dataEndDay;
          const amInVal = (record && isDateInRange && record.amIn) ? record.amIn : "";
          const amOutVal = (record && isDateInRange && record.amOut) ? record.amOut : "";
          const pmInVal = (record && isDateInRange && record.pmIn) ? record.pmIn : "";
          const pmOutVal = (record && isDateInRange && record.pmOut) ? record.pmOut : "";

          const safeEmpName = employeeName.replace(/[^a-zA-Z0-9]/g, '_');
          const fieldPrefix = `${safeEmpName}_${startX}_day_${i}`;

          if (isDateInRange) {
            doc.text(amInVal, cols[1], y + 4, { width: colW[1], align: "center" });
            doc.text(amOutVal, cols[2], y + 4, { width: colW[2], align: "center" });
            doc.text(pmInVal, cols[3], y + 4, { width: colW[3], align: "center" });
            doc.text(pmOutVal, cols[4], y + 4, { width: colW[4], align: "center" });
          }

          y += rowHeight;
          doc.moveTo(leftX, y).lineTo(rightX, y).stroke();
        }

        // Draw vertical lines for the table
        for (let c of cols) {
          doc.moveTo(c, tableStartY).lineTo(c, y).stroke();
        }

        // Certification text
        doc.font("Helvetica-Oblique").fontSize(7);
        const cert = "I hereby certify in my honor that the above is true and correct report of the hours\nof work performed, record of which waas made daily at the time of arrival and\ndeparture from the office.";
        doc.text(cert, leftX + 2, y + 4, { width: width - 4, align: "left", lineGap: 1.5 });
        
        y += 35;
        doc.moveTo(leftX, y).lineTo(rightX, y).stroke();

        // Signature
        y += 20;
        doc.font("Helvetica-Bold").fontSize(8);
        doc.text("SIGNATURE OF EMPLOYEE", leftX, y, { width: width, align: "center" });
        
        y += 12;
        doc.moveTo(leftX, y).lineTo(rightX, y).stroke();

        // Admin section
        y += 20;
        doc.save();
        doc.dash(3, { space: 3 });
        // The dotted line in the image
        doc.moveTo(leftX + 25, y).lineTo(rightX - 25, y).stroke();
        doc.moveTo(leftX + 80, y + 15).lineTo(rightX - 80, y + 15).stroke();
        doc.restore();

        y += 35;
        doc.font("Helvetica-Bold").fontSize(10);
        doc.text("DESAM D. MONTORIO", leftX, y, { width: width, align: "center" });
        doc.font("Helvetica").fontSize(8);
        doc.text("Municipal Administrator Designate/HRMO V", leftX, y + 12, { width: width, align: "center" });

        y += 30; // Final bottom padding
        
        // Outer border
        doc.rect(startX, startY, width, y - startY).stroke();
      }

      for (let i = 0; i < employees.length; i += 2) {
        if (i > 0) {
          doc.addPage();
        }
        
        const leftEmp = employees[i];
        const rightEmp = employees[i + 1];
        
        // Draw left DTR
        drawDTR(25, 20, 265, leftEmp.employeeName, leftEmp.records);
        
        // Draw right DTR
        if (rightEmp) {
          drawDTR(305, 20, 265, rightEmp.employeeName, rightEmp.records);
        }
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
