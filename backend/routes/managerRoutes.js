const express = require('express');
const {
  getEmployeesForManagerController,
  createAppraisalController,
} = require('../controllers/managerController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get(
  '/employees',
  authMiddleware,
  authorizeRoles('Manager'),
  getEmployeesForManagerController
);

router.post(
  '/appraisals',
  authMiddleware,
  authorizeRoles('Manager'),
  createAppraisalController
);

module.exports = router;

