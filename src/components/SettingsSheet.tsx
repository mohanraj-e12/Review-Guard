import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Sun, Moon, User, Lock, Bell, BellOff, Globe, Trash2,
  Download, Info, LogOut, ChevronRight, X, Camera, Check, ArrowLeft,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

type SettingsView = "main" | "profile" | "password" | "language" | "about";

const languages = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
];

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const viewTransition = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.15 } },
};

export function SettingsSheet() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<SettingsView>("main");
  const [isDark, setIsDark] = useState(() => !document.documentElement.classList.contains("light"));
  const [notifications, setNotifications] = useState(true);
  const [selectedLang, setSelectedLang] = useState(() => localStorage.getItem('language') || 'en');

  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || user?.email?.split("@")[0] || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const userInitials = (user?.email || "U").slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate("/auth");
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { toast.error(t('settings.passwordMinLength')); return; }
    if (newPassword !== confirmPassword) { toast.error(t('settings.passwordMismatch')); return; }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) { toast.error(error.message); } else {
      toast.success(t('settings.passwordUpdated'));
      setNewPassword(""); setConfirmPassword(""); setView("main");
    }
  };

  const handleUpdateProfile = async () => {
    const { error } = await supabase.auth.updateUser({ data: { display_name: displayName, avatar_url: avatarUrl } });
    if (error) { toast.error(error.message); } else {
      if (user) {
        await supabase.from("profiles").update({ display_name: displayName, avatar_url: avatarUrl }).eq("user_id", user.id);
      }
      toast.success(t('settings.profileUpdated'));
      setView("main");
    }
  };

  const handleThemeToggle = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) { document.documentElement.classList.remove("light"); localStorage.setItem("theme", "dark"); }
    else { document.documentElement.classList.add("light"); localStorage.setItem("theme", "light"); }
    toast.info(newIsDark ? t('settings.darkThemeActive') : t('settings.lightThemeActive'));
  };

  const handleLanguageChange = (code: string, label: string) => {
    setSelectedLang(code);
    i18n.changeLanguage(code);
    localStorage.setItem('language', code);
    toast.success(`${t('settings.languageSet')} ${label}`);
    setView("main");
  };

  const renderSubHeader = (title: string) => (
    <div className="flex items-center gap-3 mb-6">
      <motion.button onClick={() => setView("main")} className="p-1.5 rounded-lg hover:bg-accent transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <ArrowLeft className="w-4 h-4 text-muted-foreground" />
      </motion.button>
      <h3 className="font-display font-bold text-foreground">{title}</h3>
    </div>
  );

  const renderMain = () => (
    <motion.div key="main" {...viewTransition}>
      <motion.div className="flex items-center gap-3 p-3 rounded-xl bg-accent/30 border border-border/50 mb-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Avatar className="h-11 w-11 border-2 border-primary/30">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="bg-primary/10 text-primary font-display text-sm">{userInitials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-sm text-foreground truncate">{displayName || "User"}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
      </motion.div>

      <div className="space-y-1">
        <SettingsItem index={0} icon={isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />} label={t('settings.theme')} detail={isDark ? t('settings.dark') : t('settings.light')} onClick={handleThemeToggle}
          trailing={<Switch checked={isDark} onCheckedChange={handleThemeToggle} className="data-[state=checked]:bg-primary" />} />
        <SettingsItem index={1} icon={<User className="w-4 h-4" />} label={t('settings.profile')} detail={t('settings.profileDetail')} onClick={() => setView("profile")} />
        <SettingsItem index={2} icon={<Lock className="w-4 h-4" />} label={t('settings.changePassword')} onClick={() => setView("password")} />
        <SettingsItem index={3} icon={notifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />} label={t('settings.notifications')} detail={notifications ? t('settings.on') : t('settings.off')}
          onClick={() => { setNotifications(!notifications); toast.info(notifications ? t('settings.notificationsDisabled') : t('settings.notificationsEnabled')); }}
          trailing={<Switch checked={notifications} onCheckedChange={(v) => { setNotifications(v); toast.info(v ? t('settings.notificationsEnabled') : t('settings.notificationsDisabled')); }} className="data-[state=checked]:bg-primary" />} />
        <SettingsItem index={4} icon={<Globe className="w-4 h-4" />} label={t('settings.language')} detail={languages.find((l) => l.code === selectedLang)?.label} onClick={() => setView("language")} />
        <Separator className="my-3 bg-border/30" />
        <SettingsItem index={5} icon={<Trash2 className="w-4 h-4" />} label={t('settings.clearHistory')} onClick={() => toast.success(t('settings.historyClearedMsg'))} variant="muted" />
        <SettingsItem index={6} icon={<Download className="w-4 h-4" />} label={t('settings.downloadReports')} onClick={() => toast.info(t('settings.noReportsMsg'))} variant="muted" />
        <SettingsItem index={7} icon={<Info className="w-4 h-4" />} label={t('settings.about')} onClick={() => setView("about")} variant="muted" />
        <Separator className="my-3 bg-border/30" />
        <SettingsItem index={8} icon={<LogOut className="w-4 h-4" />} label={t('settings.logout')} onClick={handleSignOut} variant="danger" />
      </div>
    </motion.div>
  );

  const renderProfile = () => (
    <motion.div key="profile" {...viewTransition}>
      {renderSubHeader(t('settings.profile'))}
      <div className="flex flex-col items-center mb-6">
        <div className="relative group">
          <Avatar className="h-20 w-20 border-2 border-primary/30">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-primary/10 text-primary font-display text-xl">{userInitials}</AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
            <Camera className="w-5 h-5 text-foreground" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground font-display mb-1.5 block">{t('settings.displayName')}</label>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-accent/30 border-border/50 focus:border-primary/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-display mb-1.5 block">{t('settings.emailLabel')}</label>
          <Input value={user?.email || ""} disabled className="bg-accent/20 border-border/30 text-muted-foreground" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-display mb-1.5 block">{t('settings.avatarUrl')}</label>
          <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder={t('settings.avatarPlaceholder')} className="bg-accent/30 border-border/50 focus:border-primary/50" />
        </div>
        <Button onClick={handleUpdateProfile} className="w-full mt-2 font-display">{t('settings.saveChanges')}</Button>
      </div>
    </motion.div>
  );

  const renderPassword = () => (
    <motion.div key="password" {...viewTransition}>
      {renderSubHeader(t('settings.changePassword'))}
      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground font-display mb-1.5 block">{t('settings.newPassword')}</label>
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="bg-accent/30 border-border/50 focus:border-primary/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-display mb-1.5 block">{t('settings.confirmPassword')}</label>
          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="bg-accent/30 border-border/50 focus:border-primary/50" />
        </div>
        <Button onClick={handleChangePassword} disabled={changingPassword} className="w-full mt-2 font-display">
          {changingPassword ? t('settings.updating') : t('settings.updatePassword')}
        </Button>
      </div>
    </motion.div>
  );

  const renderLanguage = () => (
    <motion.div key="language" {...viewTransition}>
      {renderSubHeader(t('settings.language'))}
      <div className="space-y-1">
        {languages.map((lang, i) => (
          <motion.button key={lang.code} onClick={() => handleLanguageChange(lang.code, lang.label)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
              selectedLang === lang.code ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-accent/50 text-foreground"
            }`}
            custom={i} variants={itemVariants} initial="hidden" animate="visible" whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
          >
            <span className="font-display">{lang.label}</span>
            {selectedLang === lang.code && <Check className="w-4 h-4 text-primary" />}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  const renderAbout = () => (
    <motion.div key="about" {...viewTransition}>
      {renderSubHeader(t('settings.about'))}
      <div className="space-y-4 text-center">
        <motion.div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"
          animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
          <Settings className="w-8 h-8 text-primary" />
        </motion.div>
        <div>
          <h4 className="font-display font-bold text-foreground text-lg">ReviewGuard</h4>
          <p className="text-xs text-muted-foreground mt-1">{t('settings.aboutVersion')}</p>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{t('settings.aboutDesc')}</p>
        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-accent/30">
            <span className="text-muted-foreground">{t('settings.developer')}</span>
            <span className="text-foreground font-display">Mohanraj</span>
          </div>
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-accent/30">
            <span className="text-muted-foreground">{t('settings.contact')}</span>
            <a href="mailto:mohanraje2024@gmail.com" className="text-primary font-display text-[10px] hover:underline">mohanraje2024@gmail.com</a>
          </div>
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-accent/30">
            <span className="text-muted-foreground">{t('settings.builtWith')}</span>
            <span className="text-foreground font-display">React + AI</span>
          </div>
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-accent/30">
            <span className="text-muted-foreground">{t('settings.engine')}</span>
            <span className="text-foreground font-display">Lovable Cloud</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) setView("main"); }}>
      <SheetTrigger asChild>
        <motion.button className="relative p-2 rounded-xl hover:bg-accent/50 transition-colors duration-200 group"
          whileHover={{ scale: 1.1, rotate: 45 }} whileTap={{ scale: 0.9 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
          <Settings className="w-[18px] h-[18px] text-muted-foreground group-hover:text-primary transition-colors duration-200" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </motion.button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[340px] sm:w-[380px] bg-card/95 backdrop-blur-xl border-border/30 p-0 overflow-hidden [&>button]:hidden">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-border/30">
          <motion.h2 className="font-display font-bold text-foreground text-base" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            {t('settings.title')}
          </motion.h2>
          <motion.button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-accent/50 transition-colors" whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
            <X className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        </div>
        <div className="px-5 py-4 overflow-y-auto max-h-[calc(100vh-80px)]">
          <AnimatePresence mode="wait">
            {view === "main" && renderMain()}
            {view === "profile" && renderProfile()}
            {view === "password" && renderPassword()}
            {view === "language" && renderLanguage()}
            {view === "about" && renderAbout()}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SettingsItem({ index, icon, label, detail, onClick, trailing, variant = "default" }: {
  index: number; icon: React.ReactNode; label: string; detail?: string; onClick?: () => void; trailing?: React.ReactNode; variant?: "default" | "muted" | "danger";
}) {
  const colorMap = { default: "text-foreground", muted: "text-muted-foreground", danger: "text-fake" };
  const iconColorMap = { default: "text-primary", muted: "text-muted-foreground", danger: "text-fake" };

  return (
    <motion.button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/40 transition-all duration-200 group"
      custom={index} variants={itemVariants} initial="hidden" animate="visible" whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
      <div className={`${iconColorMap[variant]} transition-colors`}>{icon}</div>
      <div className="flex-1 text-left">
        <span className={`text-sm font-medium ${colorMap[variant]}`}>{label}</span>
        {detail && <span className="text-xs text-muted-foreground ml-2">{detail}</span>}
      </div>
      {trailing || <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />}
    </motion.button>
  );
}
