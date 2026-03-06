const express = require('express');
const {
  getDepartmentPerformanceController,
  getTopPerformersController,
  getBiasCasesController,
  getAverageSentimentController,
} = require('../controllers/analyticsController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware, authorizeRoles('HR'));

router.get('/department-performance', getDepartmentPerformanceController);

router.get('/top-performers', getTopPerformersController);

router.get('/bias-cases', getBiasCasesController);

router.get('/average-sentiment', getAverageSentimentController);

module.exports = router;

