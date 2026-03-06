const mongoose = require('mongoose');

const appraisalSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    managerRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    managerFeedback: {
      type: String,
      required: true,
      trim: true,
    },
    sentimentScore: {
      type: Number,
      default: 0,
    },
    sentimentCategory: {
      type: String,
      enum: ['Positive', 'Neutral', 'Negative'],
      default: 'Neutral',
    },
    biasFlag: {
      type: Boolean,
      default: false,
    },
    kpiScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    attendancePercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    peerRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    salesAchievementPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    finalScore: {
      type: Number,
      required: true,
    },
    performanceCategory: {
      type: String,
      enum: ['Excellent', 'Good', 'Average', 'Needs Improvement'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Appraisal = mongoose.model('Appraisal', appraisalSchema);

module.exports = { Appraisal };

