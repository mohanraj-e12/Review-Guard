import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ScanSearch, ArrowRight, Sparkles, Shield, Search, Globe, BarChart3, Cpu, Star, Zap, CheckCircle } from "lucide-react";
import { LandingNavbar } from "@/components/LandingNavbar";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ParticlesBackground } from "@/components/ParticlesBackground";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/* ── Animated number counter ── */
function Counter({ target, suffix = "" }: { target: string; suffix?: string }) {
  const [display, setDisplay] = useState("0");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    const numeric = parseFloat(target.replace(/[^0-9.]/g, ""));
    const hasDecimal = target.includes(".");
    const steps = 32;
    const duration = 1400;
    let step = 0;
    const id = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numeric * eased;
      setDisplay(hasDecimal ? current.toFixed(1) : Math.round(current).toString());
      if (step >= steps) { setDisplay(target); clearInterval(id); }
    }, duration / steps);
    return () => clearInterval(id);
  }, [started, target]);

  return (
    <motion.span
      onViewportEnter={() => setStarted(true)}
      viewport={{ once: true }}
    >
      {display}{suffix}
    </motion.span>
  );
}

/* ── Feature card ── */
const features = [
  {
    icon: Search,
    title: "Text Analysis",
    desc: "Advanced NLP algorithms detect unnatural language patterns, generic phrasing, and emotional manipulation typical of fake reviews.",
    gradient: "from-primary/20 to-cyan/10",
    iconColor: "text-primary",
    tag: "NLP Engine",
  },
  {
    icon: Globe,
    title: "URL Analysis",
    desc: "Paste any product URL and we'll fetch and analyze all reviews automatically using our AI-powered cloud function.",
    gradient: "from-cyan/20 to-primary/10",
    iconColor: "text-cyan",
    tag: "AI-Powered",
  },
  {
    icon: Shield,
    title: "Behavior Detection",
    desc: "Identifies suspicious reviewer behavior: posting frequency, account age, review velocity, and cross-product spam patterns.",
    gradient: "from-warning/15 to-primary/10",
    iconColor: "text-warning",
    tag: "Behavioral ML",
  },
  {
    icon: BarChart3,
    title: "Confidence Scoring",
    desc: "Every analysis includes a calibrated confidence score broken down by detection category — no black box.",
    gradient: "from-primary/15 to-cyan/15",
    iconColor: "text-primary",
    tag: "Explainable AI",
  },
];

const stats = [
  { value: "99.2", suffix: "%", label: "Detection Accuracy" },
  { value: "50", suffix: "K+", label: "Reviews Analyzed" },
  { value: "2", suffix: "s", label: "Analysis Time" },
  { value: "4.9", suffix: "★", label: "User Rating" },
];

const benefits = [
  "Zero technical knowledge required",
  "Results in under 2 seconds",
  "Text & URL analysis modes",
  "Multi-language support",
  "Explainable AI scoring",
  "Free to get started",
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <LandingNavbar />

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="relative py-28 md:py-44 px-4 overflow-hidden">
        {/* Grid bg */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(hsl(160 84% 39% / 0.6) 1px, transparent 1px), linear-gradient(90deg, hsl(185 80% 50% / 0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
        </div>

        {/* Particles */}
        <ParticlesBackground count={24} />

        {/* Glowing orbs */}
        <motion.div className="absolute top-20 left-[8%] w-96 h-96 rounded-full bg-primary/5 blur-[130px] pointer-events-none"
          animate={{ y: [0, -20, 10, 0], x: [0, 10, -5, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-16 right-[10%] w-72 h-72 rounded-full bg-cyan/5 blur-[110px] pointer-events-none"
          animate={{ y: [0, 15, -10, 0], x: [0, -15, 5, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[160px] pointer-events-none"
          animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />

        <motion.div className="container max-w-4xl mx-auto text-center relative z-10"
          variants={stagger} initial="hidden" animate="visible">

          {/* Badge */}
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 mb-8 backdrop-blur-sm hover:bg-primary/12 hover:border-primary/35 transition-all duration-300 cursor-default">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-xs font-display text-primary tracking-wide">ML-Powered Fake Review Detection</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1]" variants={fadeUp}>
            <span className="text-foreground">Stop trusting </span>
            <motion.span className="relative inline-block"
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 300 }}>
              <span className="text-gradient-fake">fake</span>
              <motion.span className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-fake/50 to-fake/0"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                style={{ originX: 0 }} />
            </motion.span>
            <br />
            <span className="text-foreground">software </span>
            <span className="text-gradient-cyan">reviews</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" variants={fadeUp}>
            ReviewGuard uses advanced ML algorithms to detect manipulated, paid, and bot-generated reviews — so you can make decisions based on{" "}
            <span className="text-primary font-medium">real user feedback</span>.
          </motion.p>

          {/* CTA buttons */}
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center mb-16" variants={fadeUp}>
            <Link to="/auth">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button className="h-14 px-10 font-display font-semibold text-base btn-gradient text-primary-foreground rounded-xl relative overflow-hidden group">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <ScanSearch className="w-5 h-5 mr-2" />
                  Start Analyzing Free
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </motion.div>
            </Link>
            <a href="#features">
              <Button variant="outline" className="h-14 px-8 font-display font-medium text-base border-border/50 hover:border-primary/30 hover:bg-primary/5 rounded-xl transition-all duration-300">
                See How It Works
              </Button>
            </a>
          </motion.div>

          {/* Benefits list */}
          <motion.div className="flex flex-wrap justify-center gap-x-6 gap-y-2" variants={fadeUp}>
            {benefits.map((b) => (
              <span key={b} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                {b}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>

      {/* ══ FEATURES / HOW IT WORKS ══════════════════════════ */}
      <section id="features" className="py-24 px-4 relative">
        {/* Anchor for "How It Works" nav link */}
        <span id="how-it-works" className="absolute -top-16" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/15 to-transparent" />

        <div className="container max-w-6xl mx-auto relative z-10">
          <motion.div className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 mb-6">
              <Cpu className="w-3.5 h-3.5 text-cyan" />
              <span className="text-xs font-display text-muted-foreground tracking-wide">Four detection engines</span>
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              How ReviewGuard <span className="text-gradient-cyan">detects fakes</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Our multi-layer analysis combines NLP, behavioral signals, and statistical patterns to catch even the most sophisticated fake reviews.
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}>
            {features.map((f, i) => (
              <motion.div key={f.title}
                className="group relative rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 transition-all duration-500 hover:border-primary/30 spotlight overflow-hidden"
                variants={{ hidden: { opacity: 0, y: 40, rotateX: 8 }, visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } } }}
                whileHover={{ y: -8, boxShadow: "0 20px 60px -20px hsl(160 84% 39% / 0.18)" }}
                transition={{ duration: 0.3 }}>

                {/* Gradient overlay */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10">
                  {/* Tag */}
                  <div className="inline-flex items-center gap-1 rounded-md bg-secondary/80 border border-border/40 px-2 py-0.5 mb-4">
                    <span className="text-[10px] font-display text-muted-foreground tracking-wide">{f.tag}</span>
                  </div>

                  <motion.div
                    className="w-12 h-12 rounded-xl bg-secondary border border-border/50 flex items-center justify-center mb-4 group-hover:border-primary/30 transition-all duration-300"
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                    <f.icon className={`w-5 h-5 ${f.iconColor} transition-all duration-300`} />
                  </motion.div>

                  <h3 className="font-display text-base font-semibold mb-2 group-hover:text-primary transition-colors duration-300">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </div>

                <div className="absolute top-4 right-4 text-xs font-display text-muted-foreground/20 font-bold group-hover:text-primary/20 transition-colors duration-300">
                  0{i + 1}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ STATS ════════════════════════════════════════════ */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 section-glow-top" />
        <div className="absolute inset-0 section-glow-bottom" />

        <div className="container max-w-4xl mx-auto relative z-10">
          <motion.div className="rounded-2xl border border-border/50 card-glass-premium p-8 md:p-12 border-gradient"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 mb-4">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-display text-primary tracking-wide">Proven performance</span>
              </div>
              <h2 className="font-display text-2xl md:text-4xl font-bold">
                Numbers that <span className="text-gradient-cyan">speak for themselves</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((s) => (
                <motion.div key={s.label} className="text-center group cursor-default"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: "backOut" }}
                  whileHover={{ y: -4 }}>
                  <div className="font-display font-bold text-3xl md:text-4xl text-gradient-cyan mb-1">
                    <Counter target={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-xs text-muted-foreground tracking-wide">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ════════════════════════════════════ */}
      <TestimonialsSection />

      {/* ══ CTA ════════════════════════════════════════════ */}
      <section className="py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 section-glow-top" />
        <ParticlesBackground count={12} />

        <div className="container max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 mb-8">
              <Star className="w-3.5 h-3.5 text-warning fill-warning" />
              <span className="text-xs font-display text-primary tracking-wide">Join 50K+ users</span>
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
              Ready to detect <span className="text-gradient-fake">fake</span> reviews?
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              Create a free account and start analyzing reviews in 30 seconds. No credit card required.
            </p>
            <Link to="/auth">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
                <Button className="h-14 px-12 font-display font-semibold text-base btn-gradient text-primary-foreground rounded-xl relative overflow-hidden group glow-primary">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <ScanSearch className="w-5 h-5 mr-2" />
                  Start for Free
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════ */}
      <footer className="border-t border-border/30 py-10 px-4 relative overflow-hidden">
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
            <p className="text-xs text-muted-foreground/60 font-display">
              © 2026 ReviewGuard — ML-Powered Fake Review Detection
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link to="/auth" className="hover:text-primary transition-colors">Sign In</Link>
              <a href="#features" className="hover:text-primary transition-colors">Features</a>
              <a href="#testimonials" className="hover:text-primary transition-colors">Reviews</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
