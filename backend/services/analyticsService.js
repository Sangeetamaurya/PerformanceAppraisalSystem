const { Appraisal } = require('../models/Appraisal');
const { Employee } = require('../models/Employee');

const getDepartmentWiseAveragePerformance = async () => {
  const pipeline = [
    {
      $lookup: {
        from: Employee.collection.name,
        localField: 'employee',
        foreignField: '_id',
        as: 'employeeDoc',
      },
    },
    { $unwind: '$employeeDoc' },
    {
      $group: {
        _id: '$employeeDoc.department',
        averageFinalScore: { $avg: '$finalScore' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        department: '$_id',
        averageFinalScore: { $round: ['$averageFinalScore', 2] },
        count: 1,
      },
    },
    { $sort: { department: 1 } },
  ];

  const result = await Appraisal.aggregate(pipeline);
  return result;
};

const getTopPerformers = async (limit = 5) => {
  const top = await Appraisal.find()
    .sort({ finalScore: -1 })
    .limit(limit)
    .populate('employee')
    .populate('manager');
  return top;
};

const getBiasCases = async () => {
  const biasCases = await Appraisal.find({ biasFlag: true })
    .sort({ createdAt: -1 })
    .populate('employee')
    .populate('manager');
  return biasCases;
};

const getOverallAverageSentiment = async () => {
  const pipeline = [
    {
      $group: {
        _id: null,
        avgSentimentScore: { $avg: '$sentimentScore' },
        count: { $sum: 1 },
      },
    },
  ];

  const [result] = await Appraisal.aggregate(pipeline);

  if (!result) {
    return {
      averageSentimentScore: 0,
      count: 0,
    };
  }

  return {
    averageSentimentScore: Number(result.avgSentimentScore.toFixed(4)),
    count: result.count,
  };
};

module.exports = {
  getDepartmentWiseAveragePerformance,
  getTopPerformers,
  getBiasCases,
  getOverallAverageSentiment,
};

