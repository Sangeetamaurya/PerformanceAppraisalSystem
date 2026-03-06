const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const normalizeRatingToPercentage = (rating, maxRating = 5) => {
  if (!rating) return 0;
  return clamp((Number(rating) / maxRating) * 100, 0, 100);
};

const calculateFinalScore = ({ kpiScore, attendancePercentage, managerRating, peerRating }) => {
  const kpi = clamp(Number(kpiScore) || 0, 0, 100);
  const attendance = clamp(Number(attendancePercentage) || 0, 0, 100);
  const managerPct = normalizeRatingToPercentage(managerRating);
  const peerPct = normalizeRatingToPercentage(peerRating);

  const finalScore = Number(
    (0.4 * kpi + 0.3 * attendance + 0.2 * managerPct + 0.1 * peerPct).toFixed(2)
  );

  let performanceCategory = 'Needs Improvement';

  if (finalScore >= 85) {
    performanceCategory = 'Excellent';
  } else if (finalScore >= 70) {
    performanceCategory = 'Good';
  } else if (finalScore >= 50) {
    performanceCategory = 'Average';
  }

  return { finalScore, performanceCategory };
};

module.exports = {
  calculateFinalScore,
};

