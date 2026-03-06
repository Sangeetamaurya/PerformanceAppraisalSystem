const { Appraisal } = require('../models/Appraisal');

const getMyLatestAppraisal = async (employeeId) => {
  const appraisal = await Appraisal.findOne({ employee: employeeId })
    .sort({ createdAt: -1 })
    .populate('employee')
    .populate('manager');

  if (!appraisal) {
    const error = new Error('No appraisal found for this employee');
    error.statusCode = 404;
    throw error;
  }

  return appraisal;
};

module.exports = {
  getMyLatestAppraisal,
};

