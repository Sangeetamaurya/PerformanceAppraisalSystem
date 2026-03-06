const { listEmployeesForManager, createAppraisal } = require('../services/managerService');

const getEmployeesForManagerController = async (req, res, next) => {
  try {
    const employees = await listEmployeesForManager();
    return res.json({ employees });
  } catch (err) {
    return next(err);
  }
};

const createAppraisalController = async (req, res, next) => {
  try {
    const { employeeId, managerRating, managerFeedback } = req.body;
    if (!employeeId || !managerRating || !managerFeedback) {
      return res
        .status(400)
        .json({ message: 'employeeId, managerRating, and managerFeedback are required' });
    }

    const appraisal = await createAppraisal({
      managerId: req.user.id,
      employeeId,
      managerRating,
      managerFeedback,
    });

    return res.status(201).json({ appraisal });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getEmployeesForManagerController,
  createAppraisalController,
};

