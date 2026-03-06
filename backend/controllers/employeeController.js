const { getMyLatestAppraisal } = require('../services/employeeService');

const getMyReportController = async (req, res, next) => {
  try {
    if (!req.user || !req.user.employeeId) {
      return res.status(400).json({ message: 'Employee profile not linked to this user' });
    }

    const appraisal = await getMyLatestAppraisal(req.user.employeeId);

    return res.json({
      employee: {
        id: appraisal.employee._id,
        employeeId: appraisal.employee.employeeId,
        name: appraisal.employee.name,
        email: appraisal.employee.email,
        department: appraisal.employee.department,
      },
      kpiScore: appraisal.kpiScore,
      attendancePercentage: appraisal.attendancePercentage,
      managerRating: appraisal.managerRating,
      managerFeedback: appraisal.managerFeedback,
      sentimentCategory: appraisal.sentimentCategory,
      sentimentScore: appraisal.sentimentScore,
      finalScore: appraisal.finalScore,
      performanceCategory: appraisal.performanceCategory,
      biasFlag: appraisal.biasFlag,
      manager: appraisal.manager
        ? {
            id: appraisal.manager._id,
            name: appraisal.manager.name,
            email: appraisal.manager.email,
          }
        : null,
      createdAt: appraisal.createdAt,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getMyReportController,
};

