const fs = require('fs');
const XLSX = require('xlsx');
const { Employee } = require('../models/Employee');
const { User, USER_ROLES } = require('../models/User');
const { generateRandomPassword } = require('../utils/passwordGenerator');

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

// Normalize header for matching: lowercase, no spaces/underscores
const toCanonical = (s) =>
  String(s)
    .trim()
    .toLowerCase()
    .replace(/[\s_\-]+/g, '');

// Common Excel header variants -> our canonical key
const HEADER_ALIASES = {
  employeeid: 'employeeId',
  name: 'name',
  email: 'email',
  department: 'department',
  attendance: 'attendancePercentage',
  attendancepercentage: 'attendancePercentage',
  kpi: 'kpiScore',
  kpiscore: 'kpiScore',
  sales: 'salesAchievementPercentage',
  salesachievement: 'salesAchievementPercentage',
  salesachievementpercentage: 'salesAchievementPercentage',
  peer: 'peerRating',
  peerrating: 'peerRating',
};

const parseExcelFile = (filePath) => {
  let workbook;
  try {
    workbook = XLSX.readFile(filePath);
  } catch (err) {
    const error = new Error(`Invalid or unreadable Excel file: ${err.message}`);
    error.statusCode = 400;
    throw error;
  }
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return json;
};

// Build map: raw Excel header -> our column key. Validate all required columns present.
const buildHeaderMap = (firstRow) => {
  const rawHeaders = Object.keys(firstRow);
  const headerMap = {};
  for (const raw of rawHeaders) {
    const canonical = toCanonical(raw);
    const ourKey = HEADER_ALIASES[canonical] || (REQUIRED_COLUMNS.includes(canonical) ? canonical : null);
    if (ourKey) headerMap[raw] = ourKey;
  }
  const mappedKeys = [...new Set(Object.values(headerMap))];
  const missing = REQUIRED_COLUMNS.filter((col) => !mappedKeys.includes(col));
  if (missing.length > 0) {
    const error = new Error(`Missing required columns: ${missing.join(', ')}. Found: ${rawHeaders.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }
  return headerMap;
};

// Convert a raw row to an object keyed by REQUIRED_COLUMNS
const mapRow = (row, headerMap) => {
  const data = {};
  for (const [excelHeader, ourKey] of Object.entries(headerMap)) {
    data[ourKey] = row[excelHeader];
  }
  return data;
};

const validateColumns = (rows) => {
  if (!rows || rows.length === 0) {
    const error = new Error('Excel file is empty');
    error.statusCode = 400;
    throw error;
  }
};

const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

const uploadEmployeesFromExcel = async (filePath) => {
  const rows = parseExcelFile(filePath);
  validateColumns(rows);

  const headerMap = buildHeaderMap(rows[0]);

  const summary = {
    processed: rows.length,
    success: 0,
    failed: 0,
    errors: [],
  };

  const seenEmployeeIds = new Set();
  const generatedAccounts = [];

  for (const [index, row] of rows.entries()) {
    const rowNumber = index + 2;
    try {
      const data = mapRow(row, headerMap);

      const rawId = data.employeeId;
      const employeeId = rawId != null ? String(rawId).trim() : '';
      if (!employeeId) {
        throw new Error('employeeId is required');
      }

      if (seenEmployeeIds.has(employeeId)) {
        throw new Error(`Duplicate employeeId in file: ${employeeId}`);
      }
      seenEmployeeIds.add(employeeId);

      const existingEmployee = await Employee.findOne({ employeeId });
      if (existingEmployee) {
        throw new Error(`Duplicate employeeId in database: ${employeeId}`);
      }

      const attendancePercentage = clamp(Number(data.attendancePercentage) || 0, 0, 100);
      const kpiScore = clamp(Number(data.kpiScore) || 0, 0, 100);
      const salesAchievementPercentage = clamp(Number(data.salesAchievementPercentage) || 0, 0, 100);
      const peerRating = clamp(Number(data.peerRating) || 3, 1, 5);

      const employee = await Employee.create({
        employeeId,
        name: String(data.name || '').trim() || 'Unknown',
        email: String(data.email || '').trim().toLowerCase() || 'unknown@example.com',
        department: String(data.department || '').trim() || 'General',
        attendancePercentage,
        kpiScore,
        salesAchievementPercentage,
        peerRating,
      });

      const existingUser = await User.findOne({ email: employee.email });
      if (!existingUser) {
        const generatedPassword = generateRandomPassword(10);
        await User.create({
          name: employee.name,
          email: employee.email,
          password: generatedPassword,
          role: USER_ROLES[2],
          employee: employee._id,
          isFirstLogin: true,
        });
        generatedAccounts.push({
          name: employee.name,
          email: employee.email,
          generatedPassword,
        });
      }

      summary.success += 1;
    } catch (err) {
      summary.failed += 1;
      summary.errors.push({
        row: rowNumber,
        message: err.message,
      });
    }
  }

  // Cleanup uploaded file
  try {
    fs.unlinkSync(filePath);
  } catch (e) {
    // ignore delete errors
  }

  // In development mode, include generatedAccounts in the response
  if (process.env.NODE_ENV !== 'production') {
    return {
      ...summary,
      generatedAccounts,
    };
  }

  return summary;
};

const listAllEmployees = async () => {
  const employees = await Employee.find().sort({ createdAt: -1 });
  return employees;
};

const resetEmployeePassword = async (employeeId) => {
  // employeeId here is the MongoDB ObjectId of the Employee document
  const user = await User.findOne({ employee: employeeId });
  if (!user) {
    const error = new Error('No user account found for this employee');
    error.statusCode = 404;
    throw error;
  }

  const temporaryPassword = generateRandomPassword(12);

  // Assign plain text — the pre-save hook on User will hash it automatically
  user.password = temporaryPassword;
  user.isFirstLogin = true;
  await user.save();

  return { temporaryPassword };
};

module.exports = {
  uploadEmployeesFromExcel,
  listAllEmployees,
  resetEmployeePassword,
};

