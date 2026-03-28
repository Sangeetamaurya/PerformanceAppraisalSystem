const { uploadEmployeesFromExcel, listAllEmployees, resetEmployeePassword } = require("../services/hrService");
const { generatePerformanceReport } = require("../services/reportService");

const uploadExcelController = async (req, res, next) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "Excel file is required (use form field name: file)" });
    }
    const summary = await uploadEmployeesFromExcel(req.file.path);
    return res.json(summary);
  } catch (err) {
    return next(err);
  }
};

const listEmployeesController = async (req, res, next) => {
  try {
    const employees = await listAllEmployees();
    return res.json({ employees });
  } catch (err) {
    return next(err);
  }
};

const resetEmployeePasswordController = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    if (!employeeId) {
      return res.status(400).json({ message: 'employeeId param is required' });
    }
    const result = await resetEmployeePassword(employeeId);
    return res.json({
      message: 'Password reset successfully. Share the temporary password with the employee.',
      temporaryPassword: result.temporaryPassword,
    });
  } catch (err) {
    return next(err);
  }
};

const downloadReportController = async (req, res, next) => {
  try {
    const pdfBuffer = await generatePerformanceReport();
    const filename = `appraisal_report_${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.end(pdfBuffer);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  uploadExcelController,
  listEmployeesController,
  resetEmployeePasswordController,
  downloadReportController,
};
