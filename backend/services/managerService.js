const { Employee } = require('../models/Employee');
const { Appraisal } = require('../models/Appraisal');
const { analyzeSentiment } = require('./sentimentService');
const { calculateFinalScore } = require('../utils/scoreCalculator');

const listEmployeesForManager = async () => {
  const employees = await Employee.find().sort({ name: 1 });
  return employees;
};

const createAppraisal = async ({ managerId, employeeId, managerRating, managerFeedback }) => {
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    const error = new Error('Employee not found');
    error.statusCode = 404;
    throw error;
  }

  const numericRating = Number(managerRating);
  if (!numericRating || numericRating < 1 || numericRating > 5) {
    const error = new Error('managerRating must be between 1 and 5');
    error.statusCode = 400;
    throw error;
  }

  const { sentimentScore, sentimentCategory } = analyzeSentiment(managerFeedback);

  let biasFlag = false;

  if (
    (numericRating <= 2 && sentimentCategory === 'Positive') ||
    (numericRating >= 4 && sentimentCategory === 'Negative')
  ) {
    biasFlag = true;
  }

  const metricsHigh =
    employee.kpiScore >= 85 &&
    employee.attendancePercentage >= 90 &&
    employee.peerRating >= 4;

  const metricsLow =
    employee.kpiScore < 50 &&
    employee.attendancePercentage < 70 &&
    employee.peerRating <= 2;

  if (metricsHigh && numericRating <= 2) {
    biasFlag = true;
  }

  if (metricsLow && numericRating >= 4) {
    biasFlag = true;
  }

  const { finalScore, performanceCategory } = calculateFinalScore({
    kpiScore: employee.kpiScore,
    attendancePercentage: employee.attendancePercentage,
    managerRating: numericRating,
    peerRating: employee.peerRating,
  });

  const appraisal = await Appraisal.create({
    employee: employee._id,
    manager: managerId,
    managerRating: numericRating,
    managerFeedback,
    sentimentScore,
    sentimentCategory,
    biasFlag,
    kpiScore: employee.kpiScore,
    attendancePercentage: employee.attendancePercentage,
    peerRating: employee.peerRating,
    salesAchievementPercentage: employee.salesAchievementPercentage,
    finalScore,
    performanceCategory,
  });

  return appraisal;
};

module.exports = {
  listEmployeesForManager,
  createAppraisal,
};

