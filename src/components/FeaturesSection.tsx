import { Shield, Search, Globe, BarChart3, Cpu, Lock, Zap, Globe2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, rotateX: 10 },
  visible: {
    opacity: 1, y: 0, rotateX: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Search,
      titleKey: "features.textAnalysis",
      descKey: "features.textAnalysisDesc",
      gradient: "from-primary/20 to-cyan/10",
      iconColor: "text-primary",
      tag: "NLP",
    },
    {
      icon: Globe,
      titleKey: "features.urlAnalysis",
      descKey: "features.urlAnalysisDesc",
      gradient: "from-cyan/20 to-primary/10",
      iconColor: "text-cyan",
      tag: "AI Cloud",
    },
    {
      icon: Shield,
      titleKey: "features.behaviorDetection",
      descKey: "features.behaviorDetectionDesc",
      gradient: "from-warning/15 to-primary/10",
      iconColor: "text-warning",
      tag: "Behavioral ML",
    },
    {
      icon: BarChart3,
      titleKey: "features.confidenceScoring",
      descKey: "features.confidenceScoringDesc",
      gradient: "from-primary/15 to-cyan/15",
      iconColor: "text-primary",
      tag: "Explainable AI",
    },
  ];

  const extraFeatures = [
    { icon: Lock, title: "Secure & Private", desc: "Your data is never stored or shared. Ephemeral analysis only.", color: "text-cyan" },
    { icon: Zap, title: "Real-time Results", desc: "Average analysis completes in under 2 seconds. No waiting.", color: "text-warning" },
    { icon: Globe2, title: "Multi-language", desc: "Supports 6 languages: English, Spanish, French, German, Hindi, Tamil.", color: "text-primary" },
  ];

  return (
    <section id="features" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent" />

      <div className="container max-w-6xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 mb-6">
            <Cpu className="w-3.5 h-3.5 text-cyan" />
            <span className="text-xs font-display text-muted-foreground tracking-wide">{t("features.badge")}</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            {t("features.title")} <span className="text-gradient-cyan">{t("features.titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t("features.subtitle")}
          </p>
        </motion.div>

        {/* Main feature cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.titleKey}
              className="group relative rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 transition-all duration-500 hover:border-primary/30 overflow-hidden spotlight"
              variants={cardVariants}
              whileHover={{
                y: -8,
                boxShadow: "0 20px 60px -20px hsl(160 84% 39% / 0.18)",
                transition: { duration: 0.3, ease: "easeOut" },
              }}
            >
              {/* Gradient bg overlay */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative z-10">
                {/* Tag */}
                <div className="inline-flex items-center rounded-md bg-secondary/70 border border-border/40 px-2 py-0.5 mb-4">
                  <span className="text-[10px] font-display text-muted-foreground tracking-wide">{feature.tag}</span>
                </div>

                <motion.div
                  className="w-12 h-12 rounded-xl bg-secondary border border-border/50 flex items-center justify-center mb-5 group-hover:border-primary/30 transition-all duration-300 group-hover:neu"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <feature.icon className={`w-5 h-5 ${feature.iconColor} transition-all duration-300`} />
                </motion.div>
                <h3 className="font-display text-base font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t(feature.descKey)}
                </p>
              </div>

              <div className="absolute top-4 right-4 text-xs font-display text-muted-foreground/25 font-bold group-hover:text-primary/20 transition-colors duration-300">
                0{i + 1}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Extra features strip */}
        <motion.div
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {extraFeatures.map((ef) => (
            <motion.div
              key={ef.title}
              className="flex items-start gap-4 rounded-xl border border-border/40 bg-secondary/20 p-4 hover:border-primary/20 hover:bg-secondary/40 transition-all duration-300 group"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
              whileHover={{ y: -2 }}
            >
              <div className="w-9 h-9 rounded-lg bg-card border border-border/50 flex items-center justify-center flex-shrink-0 group-hover:border-primary/25 transition-colors">
                <ef.icon className={`w-4 h-4 ${ef.color}`} />
              </div>
              <div>
                <h4 className="font-display text-sm font-semibold mb-1 group-hover:text-primary transition-colors">{ef.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{ef.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
