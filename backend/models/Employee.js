const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    attendancePercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    kpiScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    salesAchievementPercentage: {
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
  },
  {
    timestamps: true,
  }
);

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = { Employee };

