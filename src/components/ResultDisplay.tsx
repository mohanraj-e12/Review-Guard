import { ShieldCheck, ShieldAlert, AlertTriangle, TrendingUp, Type, Hash, Zap, Star, Package, User, Calendar, ThumbsUp, CheckCircle, ArrowLeft, Sparkles, Brain, Cpu } from "lucide-react";
import type { DetectionResult, RiskFactor } from "@/lib/reviewDetector";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface ResultDisplayProps {
  result: DetectionResult;
  onReset: () => void;
}

const severityConfig: Record<RiskFactor['severity'], { color: string; bg: string; border: string }> = {
  low: { color: 'text-warning', bg: 'bg-warning/5', border: 'border-warning/20' },
  medium: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' },
  high: { color: 'text-fake', bg: 'bg-fake/10', border: 'border-fake/30' },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

export function ResultDisplay({ result, onReset }: ResultDisplayProps) {
  const { t } = useTranslation();
  const isGenuine = result.verdict === 'genuine';
  const isFake = result.verdict === 'fake';
  const hasProduct = result.product && result.product.name;
  const hasReviews = result.reviews && result.reviews.length > 0;

  const verdictGradient = isGenuine
    ? 'from-genuine/10 via-transparent to-transparent'
    : isFake
    ? 'from-fake/10 via-transparent to-transparent'
    : 'from-warning/10 via-transparent to-transparent';

  return (
    <section className="py-20 px-4">
      <motion.div
        className="container max-w-4xl mx-auto space-y-6"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Verdict Card */}
        <motion.div
          className={`relative rounded-2xl border overflow-hidden ${
            isGenuine ? 'border-genuine/30 glow-genuine' : isFake ? 'border-fake/30 glow-fake' : 'border-warning/30'
          }`}
          variants={fadeUp}
        >
          <div className={`absolute top-0 left-0 right-0 h-40 bg-gradient-to-b ${verdictGradient}`} />

          <div className="relative card-elevated p-8">
            <div className="text-center mb-8">
              <motion.div
                className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 ${
                  isGenuine ? 'bg-genuine/10 shadow-[0_0_40px_hsl(160_84%_39%/0.2)]' : isFake ? 'bg-fake/10 shadow-[0_0_40px_hsl(0_72%_51%/0.2)]' : 'bg-warning/10'
                }`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              >
                {isGenuine ? (
                  <ShieldCheck className="w-10 h-10 text-genuine" />
                ) : isFake ? (
                  <ShieldAlert className="w-10 h-10 text-fake" />
                ) : (
                  <AlertTriangle className="w-10 h-10 text-warning" />
                )}
              </motion.div>
              <motion.h2
                className={`font-display text-3xl font-bold mb-3 ${
                  isGenuine ? 'text-gradient-genuine' : isFake ? 'text-gradient-fake' : 'text-warning'
                }`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                {result.verdict === 'genuine' ? t('result.genuineReviews') : result.verdict === 'fake' ? t('result.fakeDetected') : t('result.suspiciousReviews')}
              </motion.h2>
              <motion.p
                className="text-muted-foreground max-w-xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {result.reviewsSummary || (isGenuine
                  ? t('result.genuineDesc')
                  : isFake
                  ? t('result.fakeDesc')
                  : t('result.suspiciousDesc'))}
              </motion.p>
            </div>

            {/* Confidence Score */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-muted-foreground">{t('result.confidenceScore')}</span>
                <motion.span
                  className={`font-display font-bold text-3xl ${
                    isGenuine ? 'text-genuine' : isFake ? 'text-fake' : 'text-warning'
                  }`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                >
                  {result.confidence}%
                </motion.span>
              </div>
              <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    isGenuine ? 'bg-gradient-to-r from-genuine to-cyan' : isFake ? 'bg-gradient-to-r from-fake to-warning' : 'bg-gradient-to-r from-warning to-primary'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${result.confidence}%` }}
                  transition={{ delay: 0.6, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.7 } } }}
              initial="hidden"
              animate="visible"
            >
              {[
                { icon: <Type className="w-4 h-4" />, label: t('result.reviewsFound'), value: result.details.wordCount.toString() },
                { icon: <TrendingUp className="w-4 h-4" />, label: t('result.sentiment'), value: result.sentimentScore > 0 ? t('result.positive') : result.sentimentScore < 0 ? t('result.negative') : t('result.mixed') },
                { icon: <Zap className="w-4 h-4" />, label: t('result.quality'), value: `${Math.round(result.textQualityScore * 100)}%` },
                { icon: <Hash className="w-4 h-4" />, label: t('result.riskFactors'), value: result.riskFactors.length.toString() },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  className="rounded-xl bg-secondary/50 border border-border/50 p-3.5 text-center hover:border-primary/20 hover:bg-secondary/80 transition-all duration-300"
                  variants={{
                    hidden: { opacity: 0, y: 15, scale: 0.9 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "backOut" as const } },
                  }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                >
                  <div className="flex items-center justify-center mb-1.5 text-muted-foreground">{stat.icon}</div>
                  <div className="font-display font-bold text-sm">{stat.value}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Risk Factors */}
            {result.riskFactors.length > 0 && (
              <div className="mb-8">
                <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  {t('result.riskFactors')}
                </h3>
                <motion.div
                  className="space-y-3"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.9 } } }}
                  initial="hidden"
                  animate="visible"
                >
                  {result.riskFactors.map((factor, i) => {
                    const config = severityConfig[factor.severity];
                    return (
                      <motion.div
                        key={i}
                        className={`rounded-xl border p-4 ${config.bg} ${config.border} transition-all duration-300`}
                        variants={slideInLeft}
                        whileHover={{ scale: 1.01, x: 4 }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`font-medium text-sm ${config.color}`}>{factor.label}</span>
                          <span className={`text-[10px] uppercase font-display tracking-widest px-2 py-0.5 rounded-full ${config.bg} ${config.color} border ${config.border}`}>
                            {factor.severity}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{factor.description}</p>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            )}

            {result.riskFactors.length === 0 && (
              <motion.div
                className="mb-8 rounded-xl border border-genuine/20 bg-genuine/5 p-5 text-center flex items-center justify-center gap-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                <CheckCircle className="w-4 h-4 text-genuine" />
                <p className="text-genuine text-sm font-medium">{t('result.noRiskFactors')}</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ML Algorithms Insights */}
        {result.mlScores && (
          <motion.div
            className="card-glass rounded-2xl border border-border/50 p-6 border-gradient"
            variants={fadeUp}
          >
            <h3 className="font-display text-lg font-semibold mb-1 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              ML Algorithm Analysis
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Ensemble of 4 machine-learning classifiers</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <MLCard
                name="Naive Bayes"
                description="Probabilistic word-frequency classifier"
                fakeProb={result.mlScores.naiveBayes.fakeProb}
                label={result.mlScores.naiveBayes.label}
              />
              <MLCard
                name="Logistic Regression"
                description="Weighted linear model on engineered features"
                fakeProb={result.mlScores.logisticRegression.fakeProb}
                label={result.mlScores.logisticRegression.label}
              />
              <MLCard
                name="TF-IDF Similarity"
                description="Cosine similarity vs known fake-review templates"
                fakeProb={result.mlScores.tfidfSimilarity.maxSimilarity}
                label={result.mlScores.tfidfSimilarity.templated ? 'fake' : 'genuine'}
              />
              <MLCard
                name="K-Nearest Neighbors"
                description={`Top-3 vote · ${result.mlScores.knnVote.fakeVotes} fake / ${result.mlScores.knnVote.genuineVotes} genuine`}
                fakeProb={result.mlScores.knnVote.fakeVotes / Math.max(1, result.mlScores.knnVote.fakeVotes + result.mlScores.knnVote.genuineVotes)}
                label={result.mlScores.knnVote.label}
              />
            </div>

            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-display font-semibold uppercase tracking-widest text-primary flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" /> Ensemble Fake Probability
                </span>
                <span className="font-display font-bold text-lg text-primary">
                  {Math.round(result.mlScores.ensembleFakeProb * 100)}%
                </span>
              </div>
              <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-genuine via-warning to-fake"
                  initial={{ width: 0 }}
                  animate={{ width: `${result.mlScores.ensembleFakeProb * 100}%` }}
                  transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Product Info Card */}

        {hasProduct && (
          <motion.div
            className="card-glass rounded-2xl border border-border/50 p-6 border-gradient"
            variants={fadeUp}
          >
            <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-cyan" />
              {t('result.productInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InfoRow label={t('result.product')} value={result.product!.name} highlight />
              {result.product!.price && <InfoRow label={t('result.price')} value={result.product!.price} />}
              {result.product!.overallRating && <InfoRow label={t('result.sentiment')} value={result.product!.overallRating} />}
              {result.product!.totalRatings && <InfoRow label={t('result.totalRatings')} value={result.product!.totalRatings} />}
              {result.product!.seller && <InfoRow label={t('result.seller')} value={result.product!.seller} />}
              {result.product!.platform && <InfoRow label={t('result.platform')} value={result.product!.platform} />}
              {result.product!.category && <InfoRow label={t('result.category')} value={result.product!.category} />}
            </div>
          </motion.div>
        )}

        {/* Analysis Details */}
        {(result.details.ratingDistribution || result.details.reviewPatterns || result.details.genuineIndicators || result.details.suspiciousIndicators) && (
          <motion.div
            className="card-glass rounded-2xl border border-border/50 p-6 border-gradient"
            variants={fadeUp}
          >
            <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {t('result.detailedAnalysis')}
            </h3>
            <div className="space-y-3">
              {result.details.ratingDistribution && <DetailRow label={t('result.ratingDistribution')} value={result.details.ratingDistribution} />}
              {result.details.reviewPatterns && <DetailRow label={t('result.reviewPatterns')} value={result.details.reviewPatterns} />}
              {result.details.genuineIndicators && <DetailRow label={t('result.genuineIndicators')} value={result.details.genuineIndicators} type="genuine" />}
              {result.details.suspiciousIndicators && <DetailRow label={t('result.suspiciousIndicators')} value={result.details.suspiciousIndicators} type="suspicious" />}
              {result.details.timePatterns && <DetailRow label={t('result.timePatterns')} value={result.details.timePatterns} />}
              {result.details.languageQuality && <DetailRow label={t('result.languageQuality')} value={result.details.languageQuality} />}
            </div>
          </motion.div>
        )}

        {/* Extracted Reviews */}
        {hasReviews && (
          <motion.div
            className="card-glass rounded-2xl border border-border/50 p-6 border-gradient"
            variants={fadeUp}
          >
            <h3 className="font-display text-lg font-semibold mb-4">
              {t('result.extractedReviews')} ({result.reviews!.length})
            </h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
              {result.reviews!.map((review, i) => (
                <motion.div
                  key={i}
                  className="rounded-xl bg-secondary/30 border border-border/40 p-4 hover:border-border/60 hover:bg-secondary/50 transition-all duration-300"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="font-medium text-sm">{review.reviewer || t('result.anonymous')}</span>
                      {review.verified && (
                        <span className="text-[10px] text-genuine flex items-center gap-0.5 bg-genuine/10 px-1.5 py-0.5 rounded-full">
                          <CheckCircle className="w-2.5 h-2.5" /> {t('result.verified')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {review.rating != null && (
                        <span className="flex items-center gap-1 bg-warning/10 text-warning px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3 fill-warning" />
                          {review.rating}/5
                        </span>
                      )}
                      {review.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {review.date}
                        </span>
                      )}
                      {review.helpful_votes != null && review.helpful_votes > 0 && (
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {review.helpful_votes}
                        </span>
                      )}
                    </div>
                  </div>
                  {review.title && <p className="font-medium text-sm mb-1">{review.title}</p>}
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reset Button */}
        <motion.button
          onClick={onReset}
          className="w-full h-14 rounded-xl border border-border/50 bg-secondary/50 text-secondary-foreground font-display font-semibold hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-300 flex items-center justify-center gap-2 group"
          variants={fadeUp}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
          {t('result.analyzeAnother')}
        </motion.button>
      </motion.div>
    </section>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2.5 px-3 rounded-lg hover:bg-secondary/30 transition-colors duration-200 border-b border-border/30 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium text-right max-w-[60%] ${highlight ? 'text-foreground' : ''}`}>{value}</span>
    </div>
  );
}

function MLCard({ name, description, fakeProb, label }: { name: string; description: string; fakeProb: number; label: 'fake' | 'genuine' }) {
  const pct = Math.round(fakeProb * 100);
  const isFake = label === 'fake';
  return (
    <motion.div
      className={`rounded-xl border p-3.5 transition-all duration-300 ${isFake ? 'border-fake/30 bg-fake/5' : 'border-genuine/30 bg-genuine/5'}`}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-display text-sm font-semibold">{name}</span>
        <span className={`text-[10px] uppercase font-display tracking-widest px-2 py-0.5 rounded-full border ${isFake ? 'text-fake border-fake/30 bg-fake/10' : 'text-genuine border-genuine/30 bg-genuine/10'}`}>
          {label}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground mb-2 leading-snug">{description}</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${isFake ? 'bg-fake' : 'bg-genuine'}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <span className={`text-xs font-display font-bold ${isFake ? 'text-fake' : 'text-genuine'}`}>{pct}%</span>
      </div>
    </motion.div>
  );
}


function DetailRow({ label, value, type }: { label: string; value: string; type?: 'genuine' | 'suspicious' }) {
  const borderColor = type === 'genuine' ? 'border-l-genuine' : type === 'suspicious' ? 'border-l-warning' : 'border-l-primary/30';
  return (
    <div className={`rounded-xl bg-secondary/20 p-4 border-l-2 ${borderColor} hover:bg-secondary/30 transition-colors duration-200`}>
      <span className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-widest">{label}</span>
      <p className="text-sm mt-1.5 leading-relaxed">{value}</p>
    </div>
  );
}
