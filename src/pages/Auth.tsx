import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Mail, Lock, User, Loader2, ArrowRight, Sparkles, KeyRound, ArrowLeft } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// Extend Window to expose the Google Client ID set in index.html
// ─────────────────────────────────────────────────────────────────────────────
declare global {
  interface Window {
    GOOGLE_CLIENT_ID?: string;
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (element: HTMLElement, config: object) => void;
        };
      };
    };
  }
}

type AuthMode = "login" | "signup" | "forgot" | "otp" | "newpass";

const Auth = () => {
  const location = useLocation();
  // Derive initial mode from route state OR from the pathname itself
  // e.g. /signup → "signup", /login → "login", /auth → "login"
  const pathnameMode: AuthMode =
    location.pathname === "/signup" ? "signup" : "login";
  const initialMode: AuthMode =
    (location.state as { mode?: AuthMode } | null)?.mode ?? pathnameMode;

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();

  // Ref for native Google Sign-In button container (GIS)
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // ── Redirect if already authenticated ──────────────────────────────────────
  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  // ── Render native Google Identity Services button ──────────────────────────
  // This runs when the GIS library loads and GOOGLE_CLIENT_ID is configured.
  // If the Client ID is still the placeholder, the GIS button will not appear
  // and the user falls back to the lovable OAuth button.
  useEffect(() => {
    const clientId = window.GOOGLE_CLIENT_ID;
    if (!clientId || clientId === "PASTE_CLIENT_ID_HERE") return;
    if (!googleBtnRef.current) return;

    const tryRender = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: () => {
          // When a real Client ID is configured the GIS flow handles the redirect.
          // The lovable button below handles the actual Supabase session.
        },
      });
      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "filled_black",
          size: "large",
          shape: "rectangular",
          width: "100%",
          text: "continue_with",
        });
      }
    };

    // GIS script may not be loaded yet — poll briefly
    if (window.google?.accounts?.id) {
      tryRender();
    } else {
      const id = setInterval(() => {
        if (window.google?.accounts?.id) { tryRender(); clearInterval(id); }
      }, 200);
      setTimeout(() => clearInterval(id), 5000);
    }
  }, [mode]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast({ title: t("auth.error"), description: String(error), variant: "destructive" });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/auth` },
      });
      if (error) throw error;
      toast({ title: "OTP sent", description: `A 6-digit code has been sent to ${normalizedEmail}` });
      setMode("otp");
    } catch (err: any) {
      toast({ title: t("auth.error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp,
        type: "email",
      });
      if (error) throw error;
      toast({ title: "Verified", description: "Enter your new password" });
      setMode("newpass");
    } catch (err: any) {
      toast({ title: "Invalid code", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: t("auth.error"), description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Password updated", description: "You can now sign in with your new password" });
      setNewPassword(""); setOtp(""); setPassword("");
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast({ title: t("auth.error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "forgot") return handleForgotPassword(e);

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    if (!normalizedEmail || !normalizedPassword) return;
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail, password: normalizedPassword,
        });
        if (error) {
          if (error.message.toLowerCase().includes("invalid login credentials")) {
            toast({ title: t("auth.invalidCredentials"), description: t("auth.invalidCredentialsDesc"), variant: "destructive" });
            return;
          }
          throw error;
        }
        navigate("/dashboard", { replace: true });
      } else {
        if (!displayName.trim()) {
          toast({ title: t("auth.error"), description: t("auth.enterName"), variant: "destructive" });
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail, password: normalizedPassword,
          options: { data: { display_name: displayName.trim() }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (data.session) { navigate("/dashboard", { replace: true }); return; }
        toast({ title: t("auth.accountCreated"), description: t("auth.accountCreatedDesc") });
        setMode("login");
      }
    } catch (err: any) {
      toast({ title: t("auth.error"), description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ── Labels ─────────────────────────────────────────────────────────────────
  const headingText =
    mode === "login" ? t("auth.signInSubtitle")
    : mode === "signup" ? t("auth.signUpSubtitle")
    : mode === "forgot" ? "Enter your email to receive an OTP"
    : mode === "otp" ? `Enter the 6-digit code sent to ${email}`
    : "Set your new password";

  const buttonText =
    mode === "login" ? t("auth.signIn")
    : mode === "signup" ? t("auth.createAccount")
    : mode === "forgot" ? "Send OTP"
    : mode === "otp" ? "Verify code"
    : "Update password";

  const showGoogleButton = mode === "login" || mode === "signup";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grid bg */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(hsl(160 84% 39% / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(185 80% 50% / 0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
      </div>

      {/* Floating orbs */}
      <motion.div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-[120px] pointer-events-none"
        animate={{ y: [0, -20, 10, 0], x: [0, 10, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-cyan/5 blur-[100px] pointer-events-none"
        animate={{ y: [0, 15, -10, 0], x: [0, -15, 5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
      <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-fake/[0.03] blur-[130px] pointer-events-none"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }} />

      <motion.div className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>

        {/* Back to home */}
        <motion.div className="mb-6" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div className="text-center mb-8"
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}>
          <motion.div className="inline-flex items-center gap-2 mb-5"
            whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
            <div className="relative w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group hover:bg-primary/20 transition-all duration-300 hover:shadow-[0_0_30px_hsl(160_84%_39%/0.2)]">
              <ShieldCheck className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
          </motion.div>
          <h1 className="font-display text-3xl font-bold mb-1">
            Review<span className="text-gradient-cyan">Guard</span>
          </h1>
          <AnimatePresence mode="wait">
            <motion.p key={mode} className="text-muted-foreground text-sm mt-2"
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
              {headingText}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Card */}
        <motion.div className="card-glass rounded-2xl border border-border/50 p-8 border-gradient"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}>

          {/* ── Google Sign-In Section ── */}
          {showGoogleButton && (
            <>
              {/* Native GIS button (visible only when real Client ID is configured) */}
              <div ref={googleBtnRef} className="mb-2" />

              {/* Lovable OAuth button (always visible fallback / primary) */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="button" variant="outline" onClick={handleGoogleSignIn}
                  className="w-full h-12 mb-4 font-medium border-border/50 hover:bg-secondary/80 hover:border-primary/20 transition-all duration-300 rounded-xl">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  {t("auth.continueGoogle")}
                </Button>
              </motion.div>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card/80 backdrop-blur-sm px-3 text-muted-foreground font-display tracking-wider">
                    {t("auth.or")}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* ── Form ── */}
          <form
            onSubmit={
              mode === "otp" ? handleVerifyOtp
              : mode === "newpass" ? handleSetNewPassword
              : mode === "forgot" ? handleForgotPassword
              : handleSubmit
            }
            className="space-y-5"
          >
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div key="name" className="space-y-2"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                  <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" /> {t("auth.displayName")}
                  </Label>
                  <Input id="name" type="text" placeholder={t("auth.namePlaceholder")}
                    value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                    className="h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:shadow-[0_0_15px_hsl(160_84%_39%/0.1)] transition-all duration-300 rounded-xl" />
                </motion.div>
              )}
            </AnimatePresence>

            {(mode === "login" || mode === "signup" || mode === "forgot") && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" /> {t("auth.email")}
                </Label>
                <Input id="email" type="email" placeholder={t("auth.emailPlaceholder")}
                  value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:shadow-[0_0_15px_hsl(160_84%_39%/0.1)] transition-all duration-300 rounded-xl" />
              </div>
            )}

            {(mode === "login" || mode === "signup") && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <Lock className="w-4 h-4" /> {t("auth.password")}
                </Label>
                <Input id="password" type="password" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                  className="h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:shadow-[0_0_15px_hsl(160_84%_39%/0.1)] transition-all duration-300 rounded-xl" />
              </div>
            )}

            {mode === "otp" && (
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <KeyRound className="w-4 h-4" /> Verification code
                </Label>
                <div className="flex justify-center py-2">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <button type="button"
                  onClick={() => handleForgotPassword(new Event("submit") as any)}
                  className="text-xs text-primary/70 hover:text-primary mx-auto block transition-colors">
                  Resend code
                </button>
              </div>
            )}

            {mode === "newpass" && (
              <div className="space-y-2">
                <Label htmlFor="newpass" className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <Lock className="w-4 h-4" /> New password
                </Label>
                <Input id="newpass" type="password" placeholder="••••••••"
                  value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6}
                  className="h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:shadow-[0_0_15px_hsl(160_84%_39%/0.1)] transition-all duration-300 rounded-xl" />
              </div>
            )}

            {mode === "login" && (
              <div className="text-right">
                <button type="button" onClick={() => setMode("forgot")}
                  className="text-xs text-primary/70 hover:text-primary transition-colors duration-200">
                  {t("auth.forgotPassword")}
                </button>
              </div>
            )}

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" disabled={loading}
                className="w-full h-12 font-display font-semibold btn-gradient text-primary-foreground transition-all duration-300 rounded-xl relative overflow-hidden group">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    {buttonText}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Switch modes */}
          <div className="mt-6 text-center">
            {(mode === "forgot" || mode === "otp" || mode === "newpass") ? (
              <button type="button"
                onClick={() => { setMode("login"); setOtp(""); setNewPassword(""); }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                {t("auth.backToSignIn")} <span className="text-primary font-medium">{t("auth.signIn")}</span>
              </button>
            ) : (
              <button type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                {mode === "login" ? t("auth.noAccount") : t("auth.haveAccount")}
                <span className="text-primary font-medium ml-1">
                  {mode === "login" ? t("auth.signUp") : t("auth.signIn")}
                </span>
              </button>
            )}
          </div>
        </motion.div>

        <motion.p className="text-center text-[10px] text-muted-foreground/50 mt-6 font-display"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          {t("auth.protectedBy")}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Auth;
