const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('output.pdf'));

doc.initForm();
doc.formText('testField', 100, 100, 200, 20, { value: 'Editable Text', align: 'center' });
doc.end();
