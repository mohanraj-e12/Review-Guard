import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Link, Loader2, Star, ShieldCheck, Sparkles } from "lucide-react";
import { analyzeReview, type ReviewInput, type DetectionResult } from "@/lib/reviewDetector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface AnalysisFormProps {
  onResult: (result: DetectionResult) => void;
}

export function AnalysisForm({ onResult }: AnalysisFormProps) {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewerId, setReviewerId] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("text");
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleAnalyze = async () => {
    if (activeTab === "text" && !reviewText.trim()) return;
    if (activeTab === "url" && !productUrl.trim()) return;

    setIsAnalyzing(true);

    if (activeTab === "url") {
      try {
        const { data, error } = await supabase.functions.invoke('analyze-url', {
          body: { url: productUrl.trim() },
        });

        if (error) throw new Error(error.message);
        if (!data?.success) throw new Error(data?.error || 'Analysis failed');

        const aiResult = data.data;

        const result: DetectionResult = {
          verdict: aiResult.verdict,
          confidence: aiResult.confidence,
          riskFactors: aiResult.riskFactors || [],
          sentimentScore: aiResult.details?.averageSentiment === 'positive' ? 0.7 : aiResult.details?.averageSentiment === 'negative' ? -0.7 : 0,
          textQualityScore: aiResult.verdict === 'genuine' ? 0.8 : aiResult.verdict === 'fake' ? 0.3 : 0.5,
          reviewsSummary: aiResult.reviewsSummary,
          product: aiResult.product,
          reviews: aiResult.reviews,
          details: {
            wordCount: aiResult.totalReviewsFound || 0,
            uniqueWordRatio: 0,
            sentimentIntensity: 0,
            capsRatio: 0,
            exclamationCount: 0,
            repetitionScore: 0,
            ratingDistribution: aiResult.details?.ratingDistribution,
            reviewPatterns: aiResult.details?.reviewPatterns,
            suspiciousIndicators: aiResult.details?.suspiciousIndicators,
            genuineIndicators: aiResult.details?.genuineIndicators,
            timePatterns: aiResult.details?.timePatterns,
            languageQuality: aiResult.details?.languageQuality,
          },
        };

        onResult(result);
      } catch (err: any) {
        console.error('URL analysis error:', err);
        toast({
          title: t('analysis.analysisFailed'),
          description: err.message || t('analysis.analysisFailedDesc'),
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }

    await new Promise((r) => setTimeout(r, 1500));

    const input: ReviewInput = {
      text: reviewText,
      rating,
      reviewerId: reviewerId || undefined,
    };

    const result = analyzeReview(input);
    onResult(result);
    setIsAnalyzing(false);
  };

  return (
    <section id="analyze" className="py-24 px-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/3 blur-[150px] rounded-full" />

      <motion.div
        className="container max-w-3xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "backOut" }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-6 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="text-xs font-display text-primary tracking-wide">{t('analysis.badge')}</span>
          </motion.div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            {t('analysis.title')} <span className="text-gradient-cyan">{t('analysis.titleHighlight')}</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t('analysis.subtitle')}
          </p>
        </div>

        <motion.div
          className="card-glass rounded-2xl border border-border/50 p-6 md:p-8 border-gradient"
          whileHover={{ boxShadow: "0 8px 40px hsl(222 47% 2% / 0.6), 0 0 20px hsl(160 84% 39% / 0.08)" }}
          transition={{ duration: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/80 p-1 rounded-xl h-12">
              <TabsTrigger
                value="text"
                className="font-display rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_15px_hsl(160_84%_39%/0.2)] transition-all duration-300"
              >
                <FileText className="w-4 h-4 mr-2" />
                {t('analysis.reviewText')}
              </TabsTrigger>
              <TabsTrigger
                value="url"
                className="font-display rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_15px_hsl(160_84%_39%/0.2)] transition-all duration-300"
              >
                <Link className="w-4 h-4 mr-2" />
                {t('analysis.productUrl')}
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === "text" ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="review" className="text-sm font-medium mb-2 block text-muted-foreground">
                        {t('analysis.reviewText')}
                      </Label>
                      <Textarea
                        id="review"
                        placeholder={t('analysis.reviewPlaceholder')}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="min-h-[120px] bg-secondary/50 border-border/50 focus:border-primary/50 focus:shadow-[0_0_15px_hsl(160_84%_39%/0.1)] resize-none transition-all duration-300 rounded-xl"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="url" className="text-sm font-medium mb-2 block text-muted-foreground">
                        {t('analysis.productUrl')}
                      </Label>
                      <Input
                        id="url"
                        placeholder={t('analysis.urlPlaceholder')}
                        value={productUrl}
                        onChange={(e) => setProductUrl(e.target.value)}
                        className="bg-secondary/50 border-border/50 focus:border-primary/50 focus:shadow-[0_0_15px_hsl(160_84%_39%/0.1)] transition-all duration-300 h-12 rounded-xl"
                      />
                      <div className="flex flex-wrap gap-2 mt-3">
                        {["Amazon", "Flipkart", "Meesho", "Myntra", "Play Store", "App Store"].map((platform, i) => (
                          <motion.span
                            key={platform}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.06, duration: 0.3 }}
                            className="text-[10px] font-display text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-full border border-border/50 hover:border-primary/30 hover:text-primary transition-colors duration-200 cursor-default"
                          >
                            {platform}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Only show rating & reviewer ID for text tab */}
            <AnimatePresence>
              {activeTab === "text" && (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <Label className="text-sm font-medium mb-2 block text-muted-foreground">{t('analysis.rating')}</Label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          whileHover={{ scale: 1.3 }}
                          whileTap={{ scale: 0.85, rotate: -15 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        >
                          <Star
                            className={`w-8 h-8 transition-colors duration-200 ${
                              star <= rating
                                ? "text-warning fill-warning drop-shadow-[0_0_6px_hsl(38_92%_50%/0.4)]"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reviewer" className="text-sm font-medium mb-2 block text-muted-foreground">
                      {t('analysis.reviewerId')}
                    </Label>
                    <Input
                      id="reviewer"
                      placeholder={t('analysis.reviewerPlaceholder')}
                      value={reviewerId}
                      onChange={(e) => setReviewerId(e.target.value)}
                      className="bg-secondary/50 border-border/50 focus:border-primary/50 transition-all duration-300 rounded-xl"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || (activeTab === "text" ? !reviewText.trim() : !productUrl.trim())}
                className="w-full mt-6 h-14 font-display font-semibold text-base bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_hsl(160_84%_39%/0.3)] relative overflow-hidden group disabled:opacity-50"
              >
                <AnimatePresence mode="wait">
                  {isAnalyzing ? (
                    <motion.span
                      key="loading"
                      className="relative flex items-center gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary via-cyan to-primary animate-gradient-shift opacity-80" />
                      <span className="relative flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {activeTab === "url" ? t('analysis.analyzingUrl') : t('analysis.analyzingText')}
                      </span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <ShieldCheck className="w-5 h-5 mr-2" />
                      {activeTab === "url" ? t('analysis.analyzeProduct') : t('analysis.detectReview')}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </Tabs>
        </motion.div>
      </motion.div>
    </section>
  );
}
