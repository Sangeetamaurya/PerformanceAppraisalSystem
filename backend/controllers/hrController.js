const { uploadEmployeesFromExcel, listAllEmployees } = require("../services/hrService");

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

module.exports = {
  uploadExcelController,
  listEmployeesController,
};
