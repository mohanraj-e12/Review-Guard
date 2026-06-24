// Fake Review Detection Engine
// Uses heuristic analysis + ML algorithms (Naive Bayes, Logistic Regression, TF-IDF, K-NN)

import { runMLAnalysis, MLScores } from "./mlAlgorithms";



interface ReviewInput {
  text: string;
  rating: number;
  reviewerId?: string;
  productUrl?: string;
}

interface RiskFactor {
  label: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  score: number; // 0-1 contribution to fakeness
}

interface ProductInfo {
  name: string;
  price: string;
  overallRating: string;
  totalRatings: string;
  category: string;
  seller: string;
  platform: string;
}

interface ExtractedReview {
  reviewer: string;
  rating: number | null;
  date: string;
  title: string;
  text: string;
  verified: boolean | null;
  helpful_votes: number | null;
}

interface DetectionResult {
  verdict: 'genuine' | 'fake' | 'suspicious';
  confidence: number; // 0-100
  riskFactors: RiskFactor[];
  sentimentScore: number; // -1 to 1
  textQualityScore: number; // 0-1
  reviewsSummary?: string;
  product?: ProductInfo;
  reviews?: ExtractedReview[];
  mlScores?: MLScores;
  details: {
    wordCount: number;
    uniqueWordRatio: number;
    sentimentIntensity: number;
    capsRatio: number;
    exclamationCount: number;
    repetitionScore: number;
    ratingDistribution?: string;
    reviewPatterns?: string;
    suspiciousIndicators?: string;
    genuineIndicators?: string;
    timePatterns?: string;
    languageQuality?: string;
  };
}


// Positive sentiment words (excessive use = suspicious)
const POSITIVE_WORDS = new Set([
  'amazing', 'awesome', 'best', 'brilliant', 'excellent', 'fantastic', 'great',
  'incredible', 'love', 'magnificent', 'marvelous', 'outstanding', 'perfect',
  'phenomenal', 'superb', 'terrific', 'wonderful', 'extraordinary', 'flawless',
  'unbelievable', 'remarkable', 'exceptional', 'stunning', 'fabulous'
]);

const NEGATIVE_WORDS = new Set([
  'awful', 'bad', 'broken', 'disappointing', 'dreadful', 'garbage', 'hate',
  'horrible', 'mediocre', 'pathetic', 'poor', 'rubbish', 'terrible', 'trash',
  'useless', 'waste', 'worst', 'defective', 'frustrating', 'annoying'
]);

// Spam/fake indicators
const SPAM_PHRASES = [
  'buy now', 'click here', 'best ever', 'must buy', 'changed my life',
  'you won\'t regret', 'highly recommended', 'five stars', '5 stars',
  'perfect product', 'no complaints', 'nothing wrong', 'works perfectly',
  'exceeded expectations', 'game changer', 'life changing'
];

const GENERIC_PHRASES = [
  'great product', 'good quality', 'fast delivery', 'nice product',
  'good value', 'worth the money', 'happy with purchase', 'as described',
  'very satisfied', 'will buy again', 'recommended'
];

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0);
}

function calculateSentiment(words: string[]): number {
  let positive = 0;
  let negative = 0;
  for (const word of words) {
    if (POSITIVE_WORDS.has(word)) positive++;
    if (NEGATIVE_WORDS.has(word)) negative++;
  }
  const total = positive + negative;
  if (total === 0) return 0;
  return (positive - negative) / total;
}

function calculateRepetition(words: string[]): number {
  if (words.length < 3) return 0;
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]} ${words[i + 1]}`);
  }
  const uniqueBigrams = new Set(bigrams);
  return 1 - (uniqueBigrams.size / bigrams.length);
}

function checkSpamPhrases(text: string): number {
  const lower = text.toLowerCase();
  let count = 0;
  for (const phrase of SPAM_PHRASES) {
    if (lower.includes(phrase)) count++;
  }
  return Math.min(count / 3, 1);
}

function checkGenericPhrases(text: string): number {
  const lower = text.toLowerCase();
  let count = 0;
  for (const phrase of GENERIC_PHRASES) {
    if (lower.includes(phrase)) count++;
  }
  return Math.min(count / 3, 1);
}

function calculateTextQuality(text: string, words: string[]): number {
  if (words.length === 0) return 0;
  const uniqueWords = new Set(words);
  const uniqueRatio = uniqueWords.size / words.length;
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
  const hasSpecifics = /\d+/.test(text) || text.includes('because') || text.includes('however');
  
  let score = 0;
  score += uniqueRatio * 0.4;
  score += Math.min(avgWordLength / 8, 1) * 0.3;
  score += hasSpecifics ? 0.3 : 0;
  return score;
}

export function analyzeReview(input: ReviewInput): DetectionResult {
  const { text, rating } = input;
  const words = tokenize(text);
  const riskFactors: RiskFactor[] = [];
  let fakeScore = 0;

  // 1. Text length analysis
  if (words.length < 5) {
    riskFactors.push({
      label: 'Very Short Review',
      description: 'Review has fewer than 5 words, which is common in fake reviews',
      severity: 'medium',
      score: 0.15,
    });
    fakeScore += 0.15;
  } else if (words.length < 10) {
    riskFactors.push({
      label: 'Short Review',
      description: 'Brief reviews with little detail are often generic fakes',
      severity: 'low',
      score: 0.08,
    });
    fakeScore += 0.08;
  }

  // 2. Sentiment analysis
  const sentiment = calculateSentiment(words);
  const sentimentIntensity = Math.abs(sentiment);
  
  if (sentimentIntensity > 0.8 && rating === 5) {
    riskFactors.push({
      label: 'Excessive Positivity',
      description: 'Overwhelmingly positive language with perfect rating suggests artificial enthusiasm',
      severity: 'high',
      score: 0.2,
    });
    fakeScore += 0.2;
  } else if (sentimentIntensity > 0.6) {
    riskFactors.push({
      label: 'High Sentiment Intensity',
      description: 'Very strong emotional language can indicate manufactured reviews',
      severity: 'medium',
      score: 0.1,
    });
    fakeScore += 0.1;
  }

  // 3. Sentiment-rating mismatch
  if ((sentiment > 0.3 && rating <= 2) || (sentiment < -0.3 && rating >= 4)) {
    riskFactors.push({
      label: 'Sentiment-Rating Mismatch',
      description: 'The tone of the review doesn\'t match the given rating',
      severity: 'high',
      score: 0.25,
    });
    fakeScore += 0.25;
  }

  // 4. Repetition analysis
  const repetitionScore = calculateRepetition(words);
  if (repetitionScore > 0.5) {
    riskFactors.push({
      label: 'High Repetition',
      description: 'Review contains repetitive phrases, a common pattern in generated content',
      severity: 'high',
      score: 0.2,
    });
    fakeScore += 0.2;
  } else if (repetitionScore > 0.3) {
    riskFactors.push({
      label: 'Moderate Repetition',
      description: 'Some repetitive patterns detected in the text',
      severity: 'medium',
      score: 0.1,
    });
    fakeScore += 0.1;
  }

  // 5. Spam phrases
  const spamScore = checkSpamPhrases(text);
  if (spamScore > 0.5) {
    riskFactors.push({
      label: 'Spam Phrases Detected',
      description: 'Contains common phrases used in fake promotional reviews',
      severity: 'high',
      score: 0.2,
    });
    fakeScore += 0.2;
  } else if (spamScore > 0) {
    riskFactors.push({
      label: 'Promotional Language',
      description: 'Contains some marketing-style phrases',
      severity: 'low',
      score: 0.08,
    });
    fakeScore += 0.08;
  }

  // 6. Generic phrases
  const genericScore = checkGenericPhrases(text);
  if (genericScore > 0.5) {
    riskFactors.push({
      label: 'Generic Content',
      description: 'Review uses vague, non-specific language common in mass-produced reviews',
      severity: 'medium',
      score: 0.15,
    });
    fakeScore += 0.15;
  }

  // 7. Caps ratio
  const capsChars = text.replace(/[^A-Z]/g, '').length;
  const totalAlpha = text.replace(/[^a-zA-Z]/g, '').length;
  const capsRatio = totalAlpha > 0 ? capsChars / totalAlpha : 0;
  if (capsRatio > 0.5 && totalAlpha > 10) {
    riskFactors.push({
      label: 'Excessive Capitals',
      description: 'Heavy use of capital letters suggests emphasis manipulation',
      severity: 'medium',
      score: 0.1,
    });
    fakeScore += 0.1;
  }

  // 8. Exclamation marks
  const exclamationCount = (text.match(/!/g) || []).length;
  if (exclamationCount > 3) {
    riskFactors.push({
      label: 'Excessive Punctuation',
      description: 'Too many exclamation marks indicate artificial enthusiasm',
      severity: 'low',
      score: 0.08,
    });
    fakeScore += 0.08;
  }

  // 9. Text quality
  const textQuality = calculateTextQuality(text, words);

  // 10. Extreme rating with short review
  if ((rating === 5 || rating === 1) && words.length < 15) {
    riskFactors.push({
      label: 'Extreme Rating, Low Detail',
      description: 'Extreme ratings with minimal justification are suspicious',
      severity: 'medium',
      score: 0.12,
    });
    fakeScore += 0.12;
  }

  // ----- ML ensemble layer -----
  const uniqueWordsSet = new Set(words);
  const uniqueRatio = words.length > 0 ? uniqueWordsSet.size / words.length : 0;
  const mlScores = runMLAnalysis(text, {
    sentimentIntensity,
    capsRatio,
    exclamationCount,
    repetition: repetitionScore,
    uniqueRatio,
    wordCount: words.length,
    spamHits: spamScore * 3,
  });

  if (mlScores.ensembleFakeProb > 0.6) {
    riskFactors.push({
      label: 'ML Models Flagged as Fake',
      description: `Ensemble of Naive Bayes, Logistic Regression, TF-IDF and K-NN classifiers indicates a ${Math.round(mlScores.ensembleFakeProb * 100)}% probability of being fake`,
      severity: 'high',
      score: 0.2,
    });
  }
  if (mlScores.tfidfSimilarity.templated) {
    riskFactors.push({
      label: 'Templated Pattern (TF-IDF)',
      description: `Cosine similarity of ${(mlScores.tfidfSimilarity.maxSimilarity * 100).toFixed(0)}% with known fake-review templates`,
      severity: 'medium',
      score: 0.12,
    });
  }

  // Blend heuristic + ML for final fake score
  fakeScore = Math.min(1, fakeScore * 0.6 + mlScores.ensembleFakeProb * 0.4);
  const confidence = Math.round(Math.max(45, Math.min(98, fakeScore * 100 + 30 + Math.random() * 5)));

  let verdict: 'genuine' | 'fake' | 'suspicious';
  if (fakeScore > 0.45) {
    verdict = 'fake';
  } else if (fakeScore > 0.2) {
    verdict = 'suspicious';
  } else {
    verdict = 'genuine';
  }

  const displayConfidence = verdict === 'genuine'
    ? Math.round(100 - fakeScore * 100)
    : confidence;

  return {
    verdict,
    confidence: displayConfidence,
    riskFactors,
    sentimentScore: sentiment,
    textQualityScore: textQuality,
    mlScores,
    details: {
      wordCount: words.length,
      uniqueWordRatio: uniqueRatio,
      sentimentIntensity,
      capsRatio,
      exclamationCount,
      repetitionScore,
    },
  };
}


export type { ReviewInput, DetectionResult, RiskFactor, ProductInfo, ExtractedReview };
