import { useState, type ReactNode, type ChangeEvent } from "react";
import { useLocation } from "wouter";
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  KeyRound,
  Eye,
  EyeOff,
  Zap,
  Map,
  Factory,
  Rocket,
  Trophy,
  ArrowRight,
  Loader2,
  Check,
} from "lucide-react";
import ParticleCanvas from "@/components/ParticleCanvas";
import CircuitBackground from "@/components/CircuitBackground";
import { useUserContext } from "@/lib/user";

/* ─── Chip Illustration ─── */
function ChipIllustration({ small = false }: { small?: boolean }) {
  const scale = small ? 0.75 : 1;
  return (
    <div className="relative flex items-center justify-center py-2">
      <div
        style={{
          animation: "floatChip 4s ease-in-out infinite",
          transform: `scale(${scale})`,
          transformOrigin: "center",
        }}
      >
        <svg width="220" height="180" viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a1a2e" />
              <stop offset="100%" stopColor="#0d0d1a" />
            </linearGradient>
            <filter id="gl">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {[40, 55, 70, 85, 100, 115, 130].map((y, i) => (
            <g key={`pl${i}`}>
              <line x1="10" y1={y} x2="50" y2={y} stroke="#00f5ff" strokeWidth="1.5" filter="url(#gl)" style={{ animation: `pulseLine ${1 + i * 0.2}s ease-in-out infinite alternate` }} />
              <circle cx="10" cy={y} r="2.5" fill="#00f5ff" filter="url(#gl)" />
            </g>
          ))}
          {[40, 55, 70, 85, 100, 115, 130].map((y, i) => (
            <g key={`pr${i}`}>
              <line x1="170" y1={y} x2="210" y2={y} stroke="#a855f7" strokeWidth="1.5" filter="url(#gl)" style={{ animation: `pulseLine ${1.2 + i * 0.15}s ease-in-out infinite alternate` }} />
              <circle cx="210" cy={y} r="2.5" fill="#a855f7" filter="url(#gl)" />
            </g>
          ))}
          <rect x="50" y="20" width="120" height="140" rx="8" fill="url(#cg)" stroke="#00f5ff" strokeWidth="1.5" filter="url(#gl)" />
          {[40, 55, 70, 85, 100, 115].map((y, i) => (
            <line key={i} x1="60" y1={y} x2="160" y2={y} stroke="#00f5ff" strokeWidth="0.3" opacity="0.3" />
          ))}
          {[70, 90, 110, 130, 150].map((x, i) => (
            <line key={i} x1={x} y1="30" x2={x} y2="150" stroke="#a855f7" strokeWidth="0.3" opacity="0.3" />
          ))}
          <rect x="68" y="38" width="35" height="25" rx="3" fill="#00f5ff" fillOpacity="0.12" stroke="#00f5ff" strokeWidth="0.8" />
          <rect x="117" y="38" width="35" height="25" rx="3" fill="#a855f7" fillOpacity="0.12" stroke="#a855f7" strokeWidth="0.8" />
          <rect x="68" y="78" width="84" height="35" rx="3" fill="#00f5ff" fillOpacity="0.08" stroke="#00f5ff" strokeWidth="1" />
          <text x="110" y="101" textAnchor="middle" fill="#00f5ff" fontSize="8" fontFamily="monospace" filter="url(#gl)">VLSI CORE</text>
          <rect x="68" y="125" width="35" height="22" rx="3" fill="#a855f7" fillOpacity="0.12" stroke="#a855f7" strokeWidth="0.8" />
          <rect x="117" y="125" width="35" height="22" rx="3" fill="#00f5ff" fillOpacity="0.12" stroke="#00f5ff" strokeWidth="0.8" />
          <circle cx="110" cy="90" r="5" fill="#00f5ff" opacity="0.9" filter="url(#gl)" style={{ animation: "pulseCore 2s ease-in-out infinite" }} />
        </svg>
      </div>
    </div>
  );
}

/* ─── Stat Counter ─── */
function StatCounter({ value, label }: { value: string; label: string }) {
  const [count, setCount] = useState(0);
  const numeric = parseInt(value.replace(/[^0-9]/g, ""), 10);
  useState(() => {
    let s = 0;
    const step = numeric / (1800 / 16);
    const t = setInterval(() => {
      s += step;
      if (s >= numeric) {
        setCount(numeric);
        clearInterval(t);
      } else setCount(Math.floor(s));
    }, 16);
    return () => clearInterval(t);
  });
  const display = value.includes("+") ? `${count.toLocaleString()}+` : count.toLocaleString();
  return (
    <div className="text-center">
      <div
        className="font-black"
        style={{
          fontFamily: "'Orbitron', monospace",
          color: "#00f5ff",
          textShadow: "0 0 14px rgba(0,245,255,0.5)",
          fontSize: "clamp(13px, 2.2vw, 21px)",
        }}
      >
        {display}
      </div>
      <div className="text-gray-400 uppercase tracking-widest mt-0.5" style={{ fontSize: "clamp(8px, 1vw, 10px)" }}>
        {label}
      </div>
    </div>
  );
}

/* ─── Glow Button ─── */
type GlowVariant = "cyan" | "solid" | "outline";
function GlowButton({
  children,
  onClick,
  variant = "cyan",
  loading = false,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: GlowVariant;
  loading?: boolean;
  type?: "button" | "submit";
}) {
  const styles: Record<GlowVariant, { bg: string; bd: string; col: string; sh: string }> = {
    cyan: {
      bg: "rgba(0,245,255,0.08)",
      bd: "1px solid rgba(0,245,255,0.35)",
      col: "#00f5ff",
      sh: "0 0 20px rgba(0,245,255,0.25)",
    },
    solid: {
      bg: "linear-gradient(135deg, #00f5ff, #0099ff)",
      bd: "none",
      col: "#000",
      sh: "0 0 26px rgba(0,245,255,0.42)",
    },
    outline: {
      bg: "transparent",
      bd: "1px solid rgba(255,255,255,0.12)",
      col: "#777",
      sh: "none",
    },
  };
  const s = styles[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className="w-full rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer select-none active:scale-[0.97] disabled:opacity-70"
      style={{
        background: s.bg,
        border: s.bd,
        color: s.col,
        boxShadow: s.sh,
        minHeight: "48px",
        fontFamily: variant === "solid" ? "'Orbitron', monospace" : "inherit",
        fontSize: variant === "solid" ? "11px" : "14px",
        letterSpacing: variant === "solid" ? "0.05em" : "normal",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
}

/* ─── Form Input ─── */
function FormInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  icon,
  rightEl,
}: {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  icon?: ReactNode;
  rightEl?: ReactNode;
}) {
  return (
    <div>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 600,
            color: "#888",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "6px",
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {icon && (
          <span
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#666",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            {icon}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{
            display: "block",
            width: "100%",
            color: "#fff",
            background: "rgba(255,255,255,0.04)",
            border: error ? "1px solid #f87171" : "1px solid rgba(0,245,255,0.15)",
            borderRadius: "12px",
            paddingLeft: icon ? "40px" : "14px",
            paddingRight: rightEl ? "40px" : "14px",
            paddingTop: "13px",
            paddingBottom: "13px",
            fontSize: "16px",
            fontFamily: "'DM Mono', monospace",
            outline: "none",
            minHeight: "48px",
            WebkitAppearance: "none",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.target.style.border = "1px solid rgba(0,245,255,0.5)";
            e.target.style.boxShadow = "0 0 12px rgba(0,245,255,0.1)";
          }}
          onBlur={(e) => {
            e.target.style.border = error ? "1px solid #f87171" : "1px solid rgba(0,245,255,0.15)";
            e.target.style.boxShadow = "none";
          }}
        />
        {rightEl && (
          <span
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#888",
              display: "flex",
              alignItems: "center",
            }}
          >
            {rightEl}
          </span>
        )}
      </div>
      {error && <p style={{ fontSize: "12px", color: "#f87171", margin: "4px 0 0" }}>{error}</p>}
    </div>
  );
}

/* ─── Social Buttons ─── */
function SocialButtons({ onAction }: { onAction: (name: string) => void }) {
  const Btn = ({
    onClick,
    icon,
    label,
    accent,
  }: {
    onClick: () => void;
    icon: ReactNode;
    label: string;
    accent?: boolean;
  }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.97] cursor-pointer select-none"
      style={{
        background: accent ? "rgba(168,85,247,0.07)" : "rgba(255,255,255,0.05)",
        border: accent ? "1px solid rgba(168,85,247,0.28)" : "1px solid rgba(255,255,255,0.09)",
        color: accent ? "#a855f7" : "#bbb",
        minHeight: "46px",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
  return (
    <div className="flex flex-col gap-2">
      <Btn
        onClick={() => onAction("Google")}
        label="Continue with Google"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        }
      />
      <Btn
        onClick={() => onAction("LinkedIn")}
        label="Continue with LinkedIn"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        }
      />
      <Btn onClick={() => onAction("OTP")} label="Login with Mobile OTP" icon={<Phone className="w-4 h-4" />} accent />
    </div>
  );
}

/* ─── Divider ─── */
function Divider() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-[10px] text-gray-600 uppercase tracking-widest">or</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

/* ─── Toast ─── */
function Toast({ msg, accent }: { msg: string; accent?: boolean }) {
  if (!msg) return null;
  return (
    <div
      className="text-sm text-center px-3 py-2.5 rounded-xl border"
      style={{
        background: accent ? "rgba(168,85,247,0.09)" : "rgba(0,245,255,0.09)",
        color: accent ? "#a855f7" : "#00f5ff",
        borderColor: accent ? "rgba(168,85,247,0.25)" : "rgba(0,245,255,0.25)",
      }}
    >
      {msg}
    </div>
  );
}

/* ─── Login Form ─── */
function LoginForm({ onSuccess }: { onSuccess: (name: string) => void }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [toast, setToast] = useState("");
  const set = (k: "email" | "password", v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };
  const validate = () => {
    const e: { email?: string; password?: string } = {};
    if (!form.email) e.email = "Email or mobile is required";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Min 6 characters";
    return e;
  };
  const { login } = useUserContext();

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      setToast("Login successful — redirecting…");
      setTimeout(() => onSuccess(user.name), 900);
    } catch (err: any) {
      setToast("");
      setErrors({ email: err.message || "Invalid email or password" });
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = (name: string) => {
    if (name === "Google") {
      window.location.href = `http://localhost:5000/api/auth/google`;
    } else if (name === "LinkedIn") {
      window.location.href = `http://localhost:5000/api/auth/linkedin`;
    } else if (name === "OTP") {
      setToast("OTP login coming soon…");
      setTimeout(() => setToast(""), 2500);
    }
  };

  return (
    <div className="flex flex-col gap-3" style={{ animation: "fadeIn 0.3s ease-out" }}>
      <Toast msg={toast} />
      <FormInput
        label="Email / Mobile"
        placeholder="you@example.com"
        value={form.email}
        onChange={(e) => set("email", e.target.value)}
        error={errors.email}
        icon={<Mail className="w-4 h-4" />}
      />
      <FormInput
        label="Password"
        type={showPass ? "text" : "password"}
        placeholder="••••••••"
        value={form.password}
        onChange={(e) => set("password", e.target.value)}
        error={errors.password}
        icon={<Lock className="w-4 h-4" />}
        rightEl={
          <button type="button" onClick={() => setShowPass((s) => !s)} className="cursor-pointer">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />
      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 text-gray-500 cursor-pointer select-none min-h-[36px]">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            style={{ accentColor: "#00f5ff", width: "16px", height: "16px" }}
          />
          Remember me
        </label>
        <button type="button" className="text-cyan-400 bg-transparent border-none cursor-pointer min-h-[36px] text-xs px-1">
          Forgot Password?
        </button>
      </div>
      <GlowButton variant="solid" onClick={handleSubmit} loading={loading}>
        Login to ChipVerse
      </GlowButton>
      <Divider />
      <SocialButtons onAction={handleSocial} />
    </div>
  );
}

/* ─── Register Form ─── */
function RegisterForm({ onSuccess }: { onSuccess: (name: string) => void }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = "Full name required";
    if (!form.email || !form.email.includes("@")) e.email = "Valid email required";
    if (!form.mobile || form.mobile.length < 10) e.mobile = "Valid mobile required";
    if (!form.password || form.password.length < 6) e.password = "Min 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords don't match";
    if (!agreed) e.agreed = "You must agree to continue";
    return e;
  };
  const { register } = useUserContext();

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.mobile);
      setToast("Account created — welcome to ChipVerse!");
      setTimeout(() => onSuccess(user.name), 900);
    } catch (err: any) {
      setToast("");
      setErrors({ email: err.message || "Registration failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = (name: string) => {
    if (name === "Google") {
      window.location.href = `http://localhost:5000/api/auth/google`;
    } else if (name === "LinkedIn") {
      window.location.href = `http://localhost:5000/api/auth/linkedin`;
    } else if (name === "OTP") {
      setToast("OTP login coming soon…");
      setTimeout(() => setToast(""), 2500);
    }
  };

  return (
    <div className="flex flex-col gap-2.5" style={{ animation: "fadeIn 0.3s ease-out" }}>
      <Toast msg={toast} accent />
      <FormInput
        label="Full Name"
        placeholder="Ada Lovelace"
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        error={errors.name}
        icon={<UserIcon className="w-4 h-4" />}
      />
      <FormInput
        label="Email"
        placeholder="you@example.com"
        value={form.email}
        onChange={(e) => set("email", e.target.value)}
        error={errors.email}
        icon={<Mail className="w-4 h-4" />}
      />
      <FormInput
        label="Mobile"
        placeholder="+91 98765 43210"
        value={form.mobile}
        onChange={(e) => set("mobile", e.target.value)}
        error={errors.mobile}
        icon={<Phone className="w-4 h-4" />}
      />
      <FormInput
        label="Password"
        type={showPass ? "text" : "password"}
        placeholder="Min 6 characters"
        value={form.password}
        onChange={(e) => set("password", e.target.value)}
        error={errors.password}
        icon={<Lock className="w-4 h-4" />}
        rightEl={
          <button type="button" onClick={() => setShowPass((s) => !s)} className="cursor-pointer">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />
      <FormInput
        label="Confirm Password"
        type={showPass ? "text" : "password"}
        placeholder="Repeat password"
        value={form.confirm}
        onChange={(e) => set("confirm", e.target.value)}
        error={errors.confirm}
        icon={<KeyRound className="w-4 h-4" />}
      />
      <label className="flex items-start gap-2.5 text-xs text-gray-500 cursor-pointer select-none mt-0.5 leading-relaxed">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          style={{ accentColor: "#a855f7", width: "16px", height: "16px", flexShrink: 0, marginTop: "2px" }}
        />
        <span>
          I agree to the <span className="text-purple-400">Terms of Service</span> and{" "}
          <span className="text-purple-400">Privacy Policy</span>
        </span>
      </label>
      {errors.agreed && <p className="text-xs text-red-400 m-0">{errors.agreed}</p>}
      <GlowButton variant="solid" onClick={handleSubmit} loading={loading}>
        <span className="flex items-center gap-1.5">
          Create Account <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </GlowButton>
      <Divider />
      <SocialButtons onAction={handleSocial} />
    </div>
  );
}

/* ─── Auth Card ─── */
function AuthCard({ onSuccess }: { onSuccess: (name: string) => void }) {
  const [tab, setTab] = useState<"login" | "register">("login");
  return (
    <div style={{ animation: "slideUp 0.7s ease-out" }}>
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(0,245,255,0.16)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 0 60px rgba(0,245,255,0.07), inset 0 1px 0 rgba(255,255,255,0.05)",
          padding: "clamp(16px, 4vw, 26px)",
        }}
      >
        <div
          style={{
            position: "absolute", top: "-60px", right: "-60px",
            width: "140px", height: "140px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,245,255,0.09) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute", bottom: "-60px", left: "-60px",
            width: "140px", height: "140px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.09) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          className="relative flex rounded-xl p-1 mb-5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            style={{
              position: "absolute", top: "4px", bottom: "4px",
              width: "calc(50% - 4px)", borderRadius: "9px",
              transition: "left 0.3s ease",
              left: tab === "login" ? "4px" : "calc(50%)",
              background: "linear-gradient(135deg, rgba(0,245,255,0.17), rgba(168,85,247,0.11))",
              border: "1px solid rgba(0,245,255,0.28)",
              boxShadow: "0 0 14px rgba(0,245,255,0.16)",
            }}
          />
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 relative z-10 capitalize bg-transparent border-none cursor-pointer min-h-[40px] select-none"
              style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: "11px", letterSpacing: "0.05em",
                color: tab === t ? "#00f5ff" : "#555",
                transition: "color 0.3s",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <div key={tab}>
          {tab === "login" ? <LoginForm onSuccess={onSuccess} /> : <RegisterForm onSuccess={onSuccess} />}
        </div>
      </div>
    </div>
  );
}

/* ─── Feature Bullets ─── */
const FEATURES = [
  { Icon: Zap, text: "Interactive Labs — Hands-on RTL & Physical Design" },
  { Icon: Map, text: "Guided Career Paths — From student to engineer" },
  { Icon: Factory, text: "Real Industry Projects — Intel, TSMC-style challenges" },
  { Icon: Rocket, text: "Job Ready Roadmaps — 8 major VLSI domains" },
  { Icon: Trophy, text: "Rankings & Certifications — Industry-recognized badges" },
];

function FeatureBullets() {
  return (
    <div className="flex flex-col gap-2.5">
      {FEATURES.map(({ Icon, text }, i) => (
        <div
          key={i}
          className="flex items-center gap-3"
          style={{ animation: `slideIn 0.5s ease-out ${0.2 + i * 0.1}s both` }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(0,245,255,0.08)",
              border: "1px solid rgba(0,245,255,0.18)",
              color: "#00f5ff",
            }}
          >
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-gray-400" style={{ fontSize: "clamp(12px, 1.4vw, 13.5px)", lineHeight: 1.4 }}>
            {text}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Page ─── */
export default function Login() {
  const { setName } = useUserContext();
  const [, setLocation] = useLocation();

  const handleSuccess = (name: string) => {
    setName(name);
    setLocation("/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden pt-16" style={{ background: "linear-gradient(135deg, #050505 0%, #0a0a14 50%, #0d0d0d 100%)" }}>
      <style>{`
        @keyframes floatChip  { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-10px) rotate(1deg)} }
        @keyframes pulseCore  { 0%,100%{opacity:.9;transform:scale(1)} 50%{opacity:.4;transform:scale(1.5)} }
        @keyframes pulseLine  { 0%{opacity:.4} 100%{opacity:1} }
        @keyframes slideUp    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn    { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
        @keyframes titleGlow  { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.14)} }
        @keyframes borderGlow { 0%,100%{border-color:rgba(0,245,255,.12)} 50%{border-color:rgba(0,245,255,.38)} }
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #0a0a14 inset !important;
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #fff;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      <CircuitBackground />
      <ParticleCanvas color="#00f5ff" density={50} />

      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          background: "radial-gradient(ellipse at 30% 50%, rgba(5,5,5,0) 0%, rgba(5,5,5,0.28) 60%, rgba(5,5,5,0.58) 100%)",
        }}
      />

      <main className="relative z-10">
        <div className="max-w-7xl mx-auto" style={{ padding: "clamp(24px, 5vw, 52px) clamp(16px, 4vw, 24px)" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
              gap: "clamp(36px, 6vw, 72px)",
              alignItems: "start",
            }}
          >
            {/* LEFT: hero */}
            <div className="relative" style={{ animation: "slideUp 0.6s ease-out" }}>
              <div className="relative z-10 flex flex-col" style={{ gap: "clamp(16px, 3vw, 24px)" }}>
                <div
                  className="inline-flex items-center gap-2 rounded-full text-cyan-400 text-[11px] font-semibold tracking-wider w-fit"
                  style={{
                    padding: "6px 14px",
                    background: "rgba(0,245,255,0.07)",
                    border: "1px solid rgba(0,245,255,0.22)",
                  }}
                >
                  <span
                    style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: "#00f5ff", flexShrink: 0,
                      boxShadow: "0 0 8px #00f5ff",
                      animation: "pulseCore 2s ease-in-out infinite",
                    }}
                  />
                  VLSI Learning Platform · Now in Beta
                </div>

                <h1
                  className="m-0"
                  style={{
                    fontFamily: "'Orbitron', monospace",
                    fontWeight: 900,
                    fontSize: "clamp(26px, 5.2vw, 52px)",
                    lineHeight: 1.08,
                    animation: "titleGlow 3s ease-in-out infinite",
                  }}
                >
                  <span className="block" style={{ background: "linear-gradient(135deg, #fff, #ddd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Master VLSI.
                  </span>
                  <span className="block" style={{ background: "linear-gradient(135deg, #00f5ff, #0099ff 50%, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Build Chips.
                  </span>
                  <span className="block" style={{ background: "linear-gradient(135deg, #fff, #ddd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Shape the Future.
                  </span>
                </h1>

                <p className="m-0 max-w-md text-gray-400" style={{ fontSize: "clamp(12.5px, 1.5vw, 14.5px)", fontFamily: "'DM Mono', monospace", lineHeight: 1.75 }}>
                  Hands-on learning for RTL, Physical Design, Verification, FPGA, Analog IC, and Semiconductor Careers.
                </p>

                <FeatureBullets />

                <div className="hidden sm:block">
                  <ChipIllustration small />
                </div>

                <div
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-2xl"
                  style={{
                    padding: "clamp(12px, 2vw, 16px)",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(0,245,255,0.12)",
                    animation: "borderGlow 3s ease-in-out infinite",
                  }}
                >
                  <StatCounter value="10000+" label="Learners" />
                  <StatCounter value="500+" label="Labs" />
                  <StatCounter value="8" label="Domains" />
                  <StatCounter value="100+" label="Hiring Ops" />
                </div>
              </div>
            </div>

            {/* RIGHT: auth card */}
            <div style={{ animation: "slideUp 0.85s ease-out 0.15s both" }}>
              <p
                className="text-center text-gray-600 m-0 mb-3.5 uppercase"
                style={{ fontSize: "10px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.14em" }}
              >
                Begin your journey
              </p>

              <AuthCard onSuccess={handleSuccess} />

              <p
                className="text-center mt-3.5"
                style={{ color: "#444", fontSize: "11px", fontFamily: "'DM Mono', monospace", lineHeight: 1.6 }}
              >
                Trusted by engineers at&nbsp;
                <span className="text-gray-500">Intel · Qualcomm · TSMC · AMD · ARM</span>
              </p>

              <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-gray-600">
                <Check className="w-3 h-3 text-green-400" /> No credit card · Free forever tier
              </div>

              {/* ─── Admin Portal ─── */}
              <div className="flex items-center justify-center mt-5">
                <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
                  <div style={{ flex: 1, height: "1px", background: "rgba(245,158,11,0.1)" }} />
                  <button
                    onClick={() => setLocation("/admin/login")}
                    style={{
                      display: "flex", alignItems: "center", gap: "7px",
                      padding: "8px 20px",
                      background: "rgba(245,158,11,0.06)",
                      border: "1px solid rgba(245,158,11,0.18)",
                      borderRadius: "10px",
                      color: "#78350f",
                      fontSize: "11px",
                      fontFamily: "'DM Mono', monospace",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      letterSpacing: "0.04em",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = "rgba(245,158,11,0.12)";
                      el.style.color = "#f59e0b";
                      el.style.borderColor = "rgba(245,158,11,0.35)";
                      el.style.boxShadow = "0 0 12px rgba(245,158,11,0.1)";
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = "rgba(245,158,11,0.06)";
                      el.style.color = "#78350f";
                      el.style.borderColor = "rgba(245,158,11,0.18)";
                      el.style.boxShadow = "none";
                    }}
                  >
                    ⚡ Admin Portal
                  </button>
                  <div style={{ flex: 1, height: "1px", background: "rgba(245,158,11,0.1)" }} />
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}