const express = require('express');
const { getMyReportController } = require('../controllers/employeeController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get(
  '/my-report',
  authMiddleware,
  authorizeRoles('Employee'),
  getMyReportController
);

module.exports = router;

