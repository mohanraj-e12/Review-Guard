import { Button } from "@/components/ui/button";
import { ScanSearch, Sparkles, Shield, Eye, Zap, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

function AnimatedCounter({ target, suffix = "" }: { target: string; suffix?: string }) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const numericPart = parseFloat(target.replace(/[^0-9.]/g, ""));
    const hasDecimal = target.includes(".");
    const duration = 1500;
    const steps = 30;
    const stepDuration = duration / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numericPart * eased;
      setDisplay(hasDecimal ? current.toFixed(1) : Math.round(current).toString());
      if (step >= steps) {
        setDisplay(target);
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [target]);

  return <span>{display}{suffix}</span>;
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "backOut" as const } },
};

/* Floating 3-D card preview shown in large screens */
function AnalysisMockCard() {
  return (
    <motion.div
      className="hidden lg:block absolute right-[-60px] top-1/2 -translate-y-1/2 w-[260px]"
      initial={{ opacity: 0, x: 80, rotateY: -20 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 800 }}
    >
      <motion.div
        className="rounded-2xl border border-border/50 card-glass-premium p-5"
        animate={{ y: [0, -8, 4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.03, rotateY: 4 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs font-display text-muted-foreground">Analysis Result</span>
          <span className="ml-auto text-[10px] font-display text-primary animate-pulse">● Live</span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Confidence</span>
            <span className="text-primary font-display font-semibold">94.7%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-cyan"
              initial={{ width: 0 }} animate={{ width: "94.7%" }}
              transition={{ duration: 1.2, delay: 1, ease: "easeOut" }} />
          </div>
        </div>

        <div className="space-y-1.5">
          {[
            { label: "Text Quality", score: "82%", ok: true },
            { label: "Sentiment", score: "Authentic", ok: true },
            { label: "Bot Pattern", score: "None", ok: true },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
              <span className="text-muted-foreground flex-1">{row.label}</span>
              <span className="font-display text-foreground">{row.score}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 py-2 px-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
          <span className="text-xs font-display font-semibold text-primary">✓ Genuine Review</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative py-28 md:py-40 px-4 overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-[0.025]">
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(hsl(160 84% 39% / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(185 80% 50% / 0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
      </div>

      {/* Floating orbs */}
      <motion.div
        className="absolute top-20 left-[10%] w-80 h-80 rounded-full bg-primary/5 blur-[120px]"
        animate={{ y: [0, -20, 10, 0], x: [0, 10, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-10 right-[15%] w-64 h-64 rounded-full bg-cyan/5 blur-[100px]"
        animate={{ y: [0, 15, -10, 0], x: [0, -15, 5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-[150px]"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-10 right-[30%] w-40 h-40 rounded-full bg-fake/[0.03] blur-[80px]"
        animate={{ y: [0, -25, 15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Floating decorative icons */}
      <motion.div
        className="absolute top-32 right-[12%] opacity-[0.06] hidden md:block"
        animate={{ y: [0, -15, 5, 0], rotate: [0, 2, -2, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Shield className="w-20 h-20 text-primary" />
      </motion.div>
      <motion.div
        className="absolute bottom-32 left-[8%] opacity-[0.06] hidden md:block"
        animate={{ y: [0, -15, 5, 0], rotate: [0, 2, -2, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      >
        <Eye className="w-16 h-16 text-cyan" />
      </motion.div>

      <motion.div
        className="container max-w-4xl mx-auto text-center relative z-10"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={scaleIn}>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-8 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 cursor-default">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="text-xs font-display text-primary tracking-wide">{t("hero.badge")}</span>
          </div>
        </motion.div>

        <motion.h1
          className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          variants={fadeUp}
        >
          <span className="text-foreground">{t("hero.detect")} </span>
          <motion.span
            className="relative inline-block"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-gradient-fake">{t("hero.fake")}</span>
            <motion.span
              className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-fake/50 to-fake/0"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
              style={{ originX: 0 }}
            />
          </motion.span>
          <br />
          <span className="text-foreground">{t("hero.product")} </span>
          <span className="text-gradient-cyan">{t("hero.reviews")}</span>
        </motion.h1>

        <motion.p
          className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-12 font-body leading-relaxed"
          variants={fadeUp}
        >
          {t("hero.description")
            .replace("<1>", "").replace("</1>", "")
            .replace("<2>", "").replace("</2>", "")
            .replace("<3>", "").replace("</3>", "")}
        </motion.p>

        <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={fadeUp}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Button
              asChild
              className="h-14 px-10 font-display font-semibold text-base btn-gradient text-primary-foreground rounded-xl transition-all duration-300 relative overflow-hidden group"
            >
              <a href="#analyze">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <ScanSearch className="w-5 h-5 mr-2" />
                {t("hero.startAnalyzing")}
              </a>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button
              variant="outline"
              className="h-14 px-8 font-display font-medium text-base border-border/50 hover:border-primary/30 hover:bg-primary/5 rounded-xl"
              asChild
            >
              <a href="#features">
                <Zap className="w-4 h-4 mr-2" />
                How it works
              </a>
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          className="mt-20 grid grid-cols-3 gap-6 max-w-lg mx-auto"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12, delayChildren: 0.6 } },
          }}
        >
          {[
            { value: "99.2", suffix: "%", label: t("hero.accuracy") },
            { value: "50K", suffix: "+", label: t("hero.reviewsScanned") },
            { value: "<2", suffix: "s", label: t("hero.analysisTime") },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="text-center group cursor-default"
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.9 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "backOut" as const } },
              }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="font-display font-bold text-2xl text-primary group-hover:text-cyan transition-colors duration-300">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs text-muted-foreground mt-1 tracking-wide">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
