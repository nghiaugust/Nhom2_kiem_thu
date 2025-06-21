const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } = require('docx');

const filePath = path.join(__dirname, 'login.spec.js');
const fileContent = fs.readFileSync(filePath, 'utf-8');

// Regex để lấy các test case
const testRegex = /test\(['"`]([^'"`]+)['"`],\s*async \(\{ page.*?\}\) => \{([\s\S]*?)\}\);/g;

const tests = [];
let match;
while ((match = testRegex.exec(fileContent)) !== null) {
  const idMatch = match[1].match(/^(ĐN_?\d+[a-zA-Z]?)/);
  const id = idMatch ? idMatch[1] : '';
  const description = match[1].replace(/^ĐN_?\d+[a-zA-Z]?[:\-]?\s*/, '');
  const body = match[2].trim();

  // Tách test steps và test data đơn giản
  const stepLines = body.split('\n').map(l => l.trim()).filter(l => l);
  const testSteps = stepLines.filter(l => l.startsWith('await')).join('\n');
  const testData = stepLines.filter(l => l.includes('fill(')).map(l => {
    const m = l.match(/fill\(([^,]+),\s*['"](.*?)['"]\)/);
    if (m) return `${m[1]}: ${m[2]}`;
    return '';
  }).filter(Boolean).join('; ');

  // Expected result: lấy dòng expect hoặc comment có từ khóa mong đợi
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
        new Paragraph({ text: 'Login Test Cases', heading: 'Heading1' }),
        new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(path.join(__dirname, 'login_tests.docx'), buffer);
  console.log('Đã xuất file login_tests.docx thành công!');
});
