import { useState } from "react";
import { ShieldCheck, Zap, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SettingsSheet } from "@/components/SettingsSheet";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

function ThemeToggle() {
  const [isDark, setIsDark] = useState(
    () => !document.documentElement.classList.contains("light")
  );

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    }
    toast.info(next ? "Dark theme active" : "Light theme active");
  };

  return (
    <motion.button
      onClick={toggle}
      className="p-2 rounded-xl border border-border/40 bg-secondary/30 hover:bg-secondary/60 hover:border-primary/30 transition-all duration-200"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
            <Sun className="w-4 h-4 text-warning" />
          </motion.span>
        ) : (
          <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
            <Moon className="w-4 h-4 text-primary" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <motion.nav
      className="border-b border-border/50 bg-background/60 backdrop-blur-xl sticky top-0 z-50"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
    >
      <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <motion.a
          href="#"
          className="flex items-center gap-2.5 group"
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <div className="relative w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:shadow-[0_0_20px_hsl(160_84%_39%/0.2)]">
            <ShieldCheck className="w-5 h-5 text-primary transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 rounded-xl animate-pulse-ring border border-primary/20 opacity-0 group-hover:opacity-100" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-display font-bold text-lg tracking-tight">Review</span>
            <span className="font-display font-bold text-lg text-gradient-cyan tracking-tight">Guard</span>
          </div>
        </motion.a>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Analyze link */}
          <motion.a
            href="#analyze"
            className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-primary/5"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            <Zap className="w-3.5 h-3.5" />
            {t("nav.analyze")}
          </motion.a>

          {/* Theme toggle */}
          <ThemeToggle />

          {user && (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              {/* User pill */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/40 border border-border/40">
                <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <span className="text-[9px] font-display font-bold text-primary">
                    {displayName.slice(0, 1).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs font-display text-muted-foreground max-w-[100px] truncate">
                  {displayName}
                </span>
              </div>

              {/* Sign out button */}
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="h-8 px-3 font-display text-xs border-border/50 hover:border-fake/40 hover:text-fake hover:bg-fake/5 transition-all duration-200 gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </motion.div>

              {/* Settings */}
              <SettingsSheet />
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
