const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

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

// Xuất ra file Excel
const workbook = new ExcelJS.Workbook();
const sheet = workbook.addWorksheet('Login Tests');
sheet.columns = [
  { header: 'ID', key: 'ID', width: 12 },
  { header: 'Description of test', key: 'Description', width: 40 },
  { header: 'Test steps', key: 'Test steps', width: 50 },
  { header: 'Test Data', key: 'Test Data', width: 30 },
  { header: 'Expected Results', key: 'Expected Results', width: 40 },
  { header: 'Actual Results', key: 'Actual Results', width: 30 },
];

tests.forEach(row => sheet.addRow(row));

workbook.xlsx.writeFile(path.join(__dirname, 'login_tests.xlsx'))
  .then(() => console.log('Đã xuất file login_tests.xlsx thành công!'))
  .catch(err => console.error('Lỗi khi xuất file:', err));
