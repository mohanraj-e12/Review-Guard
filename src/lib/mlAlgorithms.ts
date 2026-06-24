// Lightweight ML algorithms for fake review detection
// Implements: Naive Bayes, TF-IDF cosine similarity, Logistic Regression ensemble, K-NN templated-review check

export interface MLScores {
  naiveBayes: { fakeProb: number; genuineProb: number; label: 'fake' | 'genuine' };
  logisticRegression: { fakeProb: number; label: 'fake' | 'genuine' };
  tfidfSimilarity: { maxSimilarity: number; templated: boolean };
  knnVote: { fakeVotes: number; genuineVotes: number; label: 'fake' | 'genuine' };
  ensembleFakeProb: number; // 0..1
  ensembleConfidence: number; // 0..100
}

// --- Training corpus (tiny labeled sample for demo NB / KNN) ---
const FAKE_SAMPLES = [
  'amazing product best ever buy now five stars perfect',
  'love it works perfectly highly recommended must buy',
  'great product good quality fast delivery happy purchase',
  'changed my life exceeded expectations no complaints',
  'best ever five stars perfect product nothing wrong',
  'awesome amazing brilliant perfect flawless unbelievable',
];

const GENUINE_SAMPLES = [
  'battery lasts about six hours screen is bright but speakers are weak',
  'arrived in two days packaging was damaged but item works fine so far',
  'good for the price however the strap broke after a month of daily use',
  'compared to my previous model this one is lighter but the camera is similar',
  'works as advertised but setup took longer than expected manual is confusing',
  'decent build quality the fabric feels cheap near the seams overall okay',
];

function tokenize(t: string): string[] {
  return t.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 1);
}

// ---------- Naive Bayes (Multinomial, Laplace smoothing) ----------
function buildNB() {
  const classes = { fake: FAKE_SAMPLES, genuine: GENUINE_SAMPLES };
  const vocab = new Set<string>();
  const counts: Record<'fake' | 'genuine', Record<string, number>> = { fake: {}, genuine: {} };
  const totals: Record<'fake' | 'genuine', number> = { fake: 0, genuine: 0 };
  (Object.keys(classes) as Array<'fake' | 'genuine'>).forEach((c) => {
    for (const doc of classes[c]) {
      for (const w of tokenize(doc)) {
        vocab.add(w);
        counts[c][w] = (counts[c][w] || 0) + 1;
        totals[c]++;
      }
    }
  });
  return { vocab, counts, totals };
}
const NB = buildNB();

function naiveBayes(text: string): MLScores['naiveBayes'] {
  const tokens = tokenize(text);
  const V = NB.vocab.size;
  const logP: Record<'fake' | 'genuine', number> = { fake: Math.log(0.5), genuine: Math.log(0.5) };
  (['fake', 'genuine'] as const).forEach((c) => {
    for (const w of tokens) {
      const cnt = NB.counts[c][w] || 0;
      logP[c] += Math.log((cnt + 1) / (NB.totals[c] + V));
    }
  });
  // Normalize via softmax
  const m = Math.max(logP.fake, logP.genuine);
  const ef = Math.exp(logP.fake - m);
  const eg = Math.exp(logP.genuine - m);
  const fakeProb = ef / (ef + eg);
  return {
    fakeProb,
    genuineProb: 1 - fakeProb,
    label: fakeProb >= 0.5 ? 'fake' : 'genuine',
  };
}

// ---------- TF-IDF + Cosine Similarity (vs fake samples) ----------
function termFreq(tokens: string[]): Record<string, number> {
  const tf: Record<string, number> = {};
  for (const w of tokens) tf[w] = (tf[w] || 0) + 1;
  const n = tokens.length || 1;
  Object.keys(tf).forEach((k) => (tf[k] = tf[k] / n));
  return tf;
}

function cosine(a: Record<string, number>, b: Record<string, number>): number {
  let dot = 0, na = 0, nb = 0;
  for (const k in a) { na += a[k] * a[k]; if (b[k]) dot += a[k] * b[k]; }
  for (const k in b) nb += b[k] * b[k];
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function tfidfSimilarity(text: string): MLScores['tfidfSimilarity'] {
  const target = termFreq(tokenize(text));
  let max = 0;
  for (const sample of FAKE_SAMPLES) {
    const sim = cosine(target, termFreq(tokenize(sample)));
    if (sim > max) max = sim;
  }
  return { maxSimilarity: max, templated: max > 0.35 };
}

// ---------- Logistic Regression (hand-tuned weights) ----------
// Features: [sentimentIntensity, capsRatio, exclamation/10, repetition, 1-uniqueRatio, shortFlag, spamHits/3]
const LR_WEIGHTS = [1.4, 1.1, 0.8, 1.6, 1.3, 1.0, 1.5];
const LR_BIAS = -2.2;

export interface LRFeatures {
  sentimentIntensity: number;
  capsRatio: number;
  exclamationCount: number;
  repetition: number;
  uniqueRatio: number;
  wordCount: number;
  spamHits: number;
}

function sigmoid(z: number) { return 1 / (1 + Math.exp(-z)); }

function logisticRegression(f: LRFeatures): MLScores['logisticRegression'] {
  const x = [
    f.sentimentIntensity,
    f.capsRatio,
    Math.min(f.exclamationCount / 10, 1),
    f.repetition,
    1 - f.uniqueRatio,
    f.wordCount < 10 ? 1 : 0,
    Math.min(f.spamHits / 3, 1),
  ];
  let z = LR_BIAS;
  for (let i = 0; i < x.length; i++) z += x[i] * LR_WEIGHTS[i];
  const p = sigmoid(z);
  return { fakeProb: p, label: p >= 0.5 ? 'fake' : 'genuine' };
}

// ---------- K-Nearest Neighbors (k=3) using cosine similarity ----------
function knn(text: string, k = 3): MLScores['knnVote'] {
  const target = termFreq(tokenize(text));
  const scored: { label: 'fake' | 'genuine'; sim: number }[] = [];
  for (const s of FAKE_SAMPLES) scored.push({ label: 'fake', sim: cosine(target, termFreq(tokenize(s))) });
  for (const s of GENUINE_SAMPLES) scored.push({ label: 'genuine', sim: cosine(target, termFreq(tokenize(s))) });
  scored.sort((a, b) => b.sim - a.sim);
  const top = scored.slice(0, k);
  let f = 0, g = 0;
  for (const t of top) (t.label === 'fake' ? f++ : g++);
  return { fakeVotes: f, genuineVotes: g, label: f >= g ? 'fake' : 'genuine' };
}

// ---------- Ensemble ----------
export function runMLAnalysis(text: string, features: LRFeatures): MLScores {
  const nb = naiveBayes(text);
  const lr = logisticRegression(features);
  const tf = tfidfSimilarity(text);
  const kn = knn(text);

  // Weighted ensemble
  const ensembleFakeProb =
    nb.fakeProb * 0.3 +
    lr.fakeProb * 0.4 +
    Math.min(tf.maxSimilarity * 1.2, 1) * 0.15 +
    (kn.fakeVotes / (kn.fakeVotes + kn.genuineVotes)) * 0.15;

  // Confidence = distance from 0.5 mapped to 0..100
  const ensembleConfidence = Math.round(50 + Math.abs(ensembleFakeProb - 0.5) * 100);

  return {
    naiveBayes: nb,
    logisticRegression: lr,
    tfidfSimilarity: tf,
    knnVote: kn,
    ensembleFakeProb,
    ensembleConfidence,
  };
}
