const {
  getDepartmentWiseAveragePerformance,
  getTopPerformers,
  getBiasCases,
  getOverallAverageSentiment,
} = require('../services/analyticsService');

const getDepartmentPerformanceController = async (req, res, next) => {
  try {
    const data = await getDepartmentWiseAveragePerformance();
    return res.json({ departments: data });
  } catch (err) {
    return next(err);
  }
};

const getTopPerformersController = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const performers = await getTopPerformers(limit);
    return res.json({ topPerformers: performers });
  } catch (err) {
    return next(err);
  }
};

const getBiasCasesController = async (req, res, next) => {
  try {
    const biasCases = await getBiasCases();
    return res.json({ biasCases });
  } catch (err) {
    return next(err);
  }
};

const getAverageSentimentController = async (req, res, next) => {
  try {
    const stats = await getOverallAverageSentiment();
    return res.json(stats);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getDepartmentPerformanceController,
  getTopPerformersController,
  getBiasCasesController,
  getAverageSentimentController,
};

