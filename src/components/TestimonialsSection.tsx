import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager",
    company: "TechVault Inc.",
    avatar: "SC",
    rating: 5,
    text: "ReviewGuard saved us from a disastrous partnership. We detected that 40% of our competitor's reviews were fake within minutes. The ML analysis is incredibly accurate.",
    highlight: "40% fake reviews detected",
  },
  {
    name: "Marcus Rodriguez",
    role: "E-commerce Director",
    company: "ShopSphere",
    avatar: "MR",
    rating: 5,
    text: "We integrated ReviewGuard into our vetting process. The confidence scoring and behavioral analysis helped us catch review farms before they damaged our platform's trust.",
    highlight: "Trusted by 500+ businesses",
  },
  {
    name: "Priya Nair",
    role: "Independent Researcher",
    company: "Digital Integrity Lab",
    avatar: "PN",
    rating: 5,
    text: "The text quality scoring and sentiment analysis are state-of-the-art. I use ReviewGuard for academic research on online deception — it's by far the most reliable tool available.",
    highlight: "99.2% detection accuracy",
  },
  {
    name: "James O'Brien",
    role: "CTO",
    company: "CloudBase Solutions",
    avatar: "JO",
    rating: 5,
    text: "Incredibly fast — results in under 2 seconds. The URL analysis feature is a game changer. We now scan all software listings before featuring them in our marketplace.",
    highlight: "Results in < 2 seconds",
  },
  {
    name: "Yuki Tanaka",
    role: "Consumer Advocate",
    company: "TrustWatch Foundation",
    avatar: "YT",
    rating: 5,
    text: "ReviewGuard empowers everyday consumers to make informed decisions. The interface is beautiful and the explanations are clear — no ML expertise required to understand results.",
    highlight: "Zero ML knowledge needed",
  },
  {
    name: "Amara Osei",
    role: "App Store Analyst",
    company: "Nexus Digital",
    avatar: "AO",
    rating: 4,
    text: "The reviewer behavior analysis is remarkably sophisticated. We caught a coordinated review campaign that had slipped through our previous tools. An essential part of our workflow.",
    highlight: "Catches coordinated campaigns",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? "text-warning fill-warning" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

function AvatarBubble({ initials, index }: { initials: string; index: number }) {
  const colors = [
    "from-primary/30 to-cyan/20",
    "from-cyan/30 to-primary/20",
    "from-warning/25 to-primary/15",
    "from-primary/25 to-cyan/30",
    "from-cyan/20 to-warning/20",
    "from-primary/35 to-cyan/15",
  ];
  return (
    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[index % colors.length]} border border-primary/20 flex items-center justify-center text-xs font-display font-bold text-primary`}>
      {initials}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/10 to-transparent" />
      <div className="absolute inset-0 section-glow-top" />

      <div className="container max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 mb-6">
            <Star className="w-3.5 h-3.5 text-warning fill-warning" />
            <span className="text-xs font-display text-muted-foreground tracking-wide">Trusted by thousands</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            What our users <span className="text-gradient-cyan">say</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From product managers to researchers — ReviewGuard helps people make better decisions every day.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="testimonial-card rounded-2xl p-6 relative overflow-hidden group"
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
            >
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/8 group-hover:text-primary/15 transition-colors duration-300" />

              {/* Highlight badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-display text-primary tracking-wide">{t.highlight}</span>
              </div>

              {/* Text */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-4">
                "{t.text}"
              </p>

              {/* Footer */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                <AvatarBubble initials={t.avatar} index={i} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-display font-semibold text-foreground truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.role} · {t.company}</p>
                </div>
                <StarRating rating={t.rating} />
              </div>

              {/* Hover shimmer */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent rounded-2xl" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom stat strip */}
        <motion.div
          className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {[
            { value: "50K+", label: "Reviews Analyzed" },
            { value: "99.2%", label: "Detection Accuracy" },
            { value: "< 2s", label: "Average Analysis Time" },
            { value: "4.9★", label: "User Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-2xl font-bold text-gradient-cyan">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
