// frontend/src/pages/admin/AdminLogin.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useAdmin } from "@/hooks/useAdmin";
import CircuitBackground from "@/components/CircuitBackground";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAdmin();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <CircuitBackground />

      {/* Glow orbs */}
      <div style={{
        position: "absolute", top: "20%", left: "15%",
        width: "300px", height: "300px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "20%", right: "15%",
        width: "250px", height: "250px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: "100%", maxWidth: "420px",
          margin: "0 16px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: "24px",
          padding: "40px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 0 60px rgba(245,158,11,0.08)",
          position: "relative", zIndex: 10,
        }}
      >
        {/* Top accent line */}
        <div style={{
          position: "absolute", top: 0, left: "10%", right: "10%", height: "2px",
          background: "linear-gradient(90deg, transparent, #f59e0b, transparent)",
          borderRadius: "999px",
        }} />

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "56px", height: "56px", borderRadius: "16px",
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.3)",
            marginBottom: "16px",
            fontSize: "24px",
          }}>
            ⚡
          </div>
          <h1 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "22px", fontWeight: 700,
            color: "#fff", margin: 0,
            letterSpacing: "1px",
          }}>
            ChipVerse Admin
          </h1>
          <p style={{ color: "#666", fontSize: "13px", marginTop: "6px" }}>
            Restricted access — admins only
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{
              display: "block", fontSize: "11px", fontWeight: 600,
              color: "#888", marginBottom: "8px",
              fontFamily: "'DM Mono', monospace", textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@chipverse.com"
              style={{
                width: "100%", padding: "12px 16px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px", color: "#fff",
                fontSize: "14px", outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(245,158,11,0.5)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block", fontSize: "11px", fontWeight: 600,
              color: "#888", marginBottom: "8px",
              fontFamily: "'DM Mono', monospace", textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: "100%", padding: "12px 16px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px", color: "#fff",
                fontSize: "14px", outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(245,158,11,0.5)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: "10px 14px", borderRadius: "10px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171", fontSize: "13px",
                marginBottom: "16px",
              }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            style={{
              width: "100%", padding: "13px",
              background: loading
                ? "rgba(245,158,11,0.3)"
                : "linear-gradient(135deg, #f59e0b, #d97706)",
              border: "none", borderRadius: "12px",
              color: "#000", fontSize: "14px", fontWeight: 700,
              fontFamily: "'Orbitron', sans-serif",
              cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: "0.5px",
              boxShadow: loading ? "none" : "0 0 20px rgba(245,158,11,0.3)",
              transition: "all 0.2s",
            }}
          >
            {loading ? "Logging in..." : "Login to Admin Panel"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}