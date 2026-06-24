import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { AnalysisForm } from "@/components/AnalysisForm";
import { ResultDisplay } from "@/components/ResultDisplay";
import type { DetectionResult } from "@/lib/reviewDetector";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Shield } from "lucide-react";

const Dashboard = () => {
  const [result, setResult] = useState<DetectionResult | null>(null);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />

      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <ResultDisplay result={result} onReset={() => setResult(null)} />
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnalysisForm onResult={setResult} />
          </motion.div>
        )}
      </AnimatePresence>

      <TestimonialsSection />

      {/* Footer */}
      <motion.footer
        className="border-t border-border/30 py-10 px-4 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-primary/2 to-transparent" />
        <div className="container max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <span className="font-display font-bold text-sm">
                Review<span className="text-gradient-cyan">Guard</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground/60 font-display text-center">
              © 2026 <span className="text-muted-foreground">ReviewGuard</span> — {t("hero.badge")}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a href="#analyze" className="hover:text-primary transition-colors">Analyze</a>
              <a href="#features" className="hover:text-primary transition-colors">Features</a>
              <a href="#testimonials" className="hover:text-primary transition-colors">Reviews</a>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Dashboard;
