const express = require('express');
const { uploadExcelController, listEmployeesController, resetEmployeePasswordController, downloadReportController } = require('../controllers/hrController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      const statusCode = err.code === 'LIMIT_FILE_SIZE' ? 400 : 400;
      err.statusCode = statusCode;
      return next(err);
    }
    next();
  });
};

router.post(
  '/upload-excel',
  authMiddleware,
  authorizeRoles('HR'),
  handleUpload,
  uploadExcelController
);

// HR: view all employees
router.get('/employees', authMiddleware, authorizeRoles('HR'), listEmployeesController);

// HR: reset an employee's password
router.post(
  '/reset-employee-password/:employeeId',
  authMiddleware,
  authorizeRoles('HR'),
  resetEmployeePasswordController
);

// HR: download full performance appraisal PDF report
router.get('/download-report', authMiddleware, authorizeRoles('HR'), downloadReportController);

module.exports = router;

