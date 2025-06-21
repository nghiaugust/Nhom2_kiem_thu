const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } = require('docx');

function exportSpecToWord(specFile, outputFile, title) {
  const filePath = path.join(__dirname, specFile);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const testRegex = /test\(['"`]([^'"`]+)['"`],\s*async \(\{ page.*?\}\) => \{([\s\S]*?)\}\);/g;
  const tests = [];
  let match;
  while ((match = testRegex.exec(fileContent)) !== null) {
    const idMatch = match[1].match(/^(\w+_?\d+[a-zA-Z]?)/);
    const id = idMatch ? idMatch[1] : '';
    const description = match[1].replace(/^\w+_?\d+[a-zA-Z]?[:\-]?\s*/, '');
    const body = match[2].trim();
    const stepLines = body.split('\n').map(l => l.trim()).filter(l => l);
    const testSteps = stepLines.filter(l => l.startsWith('await')).join('\n');
    const testData = stepLines.filter(l => l.includes('fill(')).map(l => {
      const m = l.match(/fill\(([^,]+),\s*['"](.*?)['"]\)/);
      if (m) return `${m[1]}: ${m[2]}`;
      return '';
    }).filter(Boolean).join('; ');
    let expected = '';
    const expectLine = stepLines.find(l => l.startsWith('expect') || l.includes('mong đợi') || l.includes('mong doi'));
    if (expectLine) expected = expectLine;
    else expected = stepLines.filter(l => l.includes('expect')).join('\n');
    tests.push({
      ID: id,
      Description: description,
      'Test steps': testSteps,
      'Test Data': testData,
      'Expected Results': expected,
      'Actual Results': ''
    });
  }
  const tableRows = [
    new TableRow({
      children: [
        'ID',
        'Description of test',
        'Test steps',
        'Test Data',
        'Expected Results',
        'Actual Results',
      ].map(text => new TableCell({
        width: { size: 20, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
      })),
    }),
    ...tests.map(row => new TableRow({
      children: [
        row.ID,
        row.Description,
        row['Test steps'],
        row['Test Data'],
        row['Expected Results'],
        row['Actual Results'],
      ].map(text => new TableCell({
        width: { size: 20, type: WidthType.PERCENTAGE },
        children: [new Paragraph(String(text || ''))],
      })),
    })),
  ];
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: title, heading: 'Heading1' }),
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      },
    ],
  });
  Packer.toBuffer(doc).then(buffer => {
    fs.writeFileSync(path.join(__dirname, outputFile), buffer);
    console.log(`Đã xuất file ${outputFile} thành công!`);
  });
}

// Xuất cho các file changePass và getPassword
exportSpecToWord('ChangePass.spec.js', 'changePass_tests.docx', 'ChangePass Test Cases');
exportSpecToWord('getPassword.spec.js', 'getPassword_tests.docx', 'GetPassword Test Cases');
