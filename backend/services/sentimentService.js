const Sentiment = require('sentiment');

const sentiment = new Sentiment();

const analyzeSentiment = (text) => {
  if (!text || typeof text !== 'string') {
    return {
      sentimentScore: 0,
      sentimentCategory: 'Neutral',
    };
  }

  const result = sentiment.analyze(text);
  const rawScore = result.score || 0;

  // Heuristic normalization
  const normalized = Math.max(-1, Math.min(1, rawScore / 10));

  let sentimentCategory = 'Neutral';
  if (normalized > 0.2) {
    sentimentCategory = 'Positive';
  } else if (normalized < -0.2) {
    sentimentCategory = 'Negative';
  }

  return {
    sentimentScore: normalized,
    sentimentCategory,
  };
};

module.exports = {
  analyzeSentiment,
};

