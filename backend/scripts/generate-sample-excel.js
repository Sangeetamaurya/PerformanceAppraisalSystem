/**
 * Generates a sample Excel file with the exact columns required for HR upload.
 * Run: node scripts/generate-sample-excel.js
 * Output: sample_employees_upload.xlsx (project root)
 */

const path = require('path');
const XLSX = require('xlsx');

const REQUIRED_COLUMNS = [
  'employeeId',
  'name',
  'email',
  'department',
  'attendancePercentage',
  'kpiScore',
  'salesAchievementPercentage',
  'peerRating',
];

const sampleRows = [
  {
    employeeId: 'EMP001',
    name: 'John Smith',
    email: 'john.smith@company.com',
    department: 'Engineering',
    attendancePercentage: 95,
    kpiScore: 82,
    salesAchievementPercentage: 0,
    peerRating: 4,
  },
  {
    employeeId: 'EMP002',
    name: 'Jane Doe',
    email: 'jane.doe@company.com',
    department: 'Sales',
    attendancePercentage: 88,
    kpiScore: 90,
    salesAchievementPercentage: 105,
    peerRating: 5,
  },
  {
    employeeId: 'EMP003',
    name: 'Bob Wilson',
    email: 'bob.wilson@company.com',
    department: 'Marketing',
    attendancePercentage: 92,
    kpiScore: 75,
    salesAchievementPercentage: 80,
    peerRating: 3,
  },
  {
    employeeId: 'EMP004',
    name: 'Alice Brown',
    email: 'alice.brown@company.com',
    department: 'Engineering',
    attendancePercentage: 98,
    kpiScore: 88,
    salesAchievementPercentage: 0,
    peerRating: 5,
  },
  {
    employeeId: 'EMP005',
    name: 'Charlie Davis',
    email: 'charlie.davis@company.com',
    department: 'HR',
    attendancePercentage: 100,
    kpiScore: 70,
    salesAchievementPercentage: 0,
    peerRating: 4,
  },
];

const workbook = XLSX.utils.book_new();
const sheet = XLSX.utils.json_to_sheet(sampleRows, { header: REQUIRED_COLUMNS });
XLSX.utils.book_append_sheet(workbook, sheet, 'Employees');

const outPath = path.join(__dirname, '..', 'sample_employees_upload.xlsx');
XLSX.writeFile(workbook, outPath);

console.log('Sample Excel created:', outPath);
console.log('Columns:', REQUIRED_COLUMNS.join(', '));
console.log('Use this file with POST /api/hr/upload-excel (form field: file)');
