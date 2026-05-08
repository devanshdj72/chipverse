// frontend/src/pages/admin/AdminDashboard.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useAdmin, API_BASE } from "@/hooks/useAdmin";
import CircuitBackground from "@/components/CircuitBackground";

const DOMAINS = [
  { id: "rtl", name: "RTL Design", color: "#00f5ff" },
  { id: "verification", name: "Verification", color: "#a855f7" },
  { id: "physical-design", name: "Physical Design", color: "#3b82f6" },
  { id: "analog", name: "Analog IC", color: "#f59e0b" },
  { id: "fpga", name: "FPGA", color: "#10b981" },
  { id: "embedded", name: "Embedded", color: "#f97316" },
  { id: "dft", name: "DFT", color: "#ec4899" },
  { id: "research", name: "Research", color: "#fbbf24" },
];

const SUB_LEVEL_ICONS: Record<string, string> = {
  CONCEPT: "📚", SYNTAX: "🔤", WALKTHROUGH: "👀", LAB: "⚗️", QUIZ: "🧠",
};

const TYPE_ICONS: Record<string, string> = {
  PAPER: "📄", VIDEO: "🎬", TOOL: "🔧", ARTICLE: "📰",
  NOTES: "📝", BOOK: "📚", PLAYLIST: "🎵",
};

type Resource = {
  id: string;
  title: string;
  url: string;
  type: string;
  domain: string;
  levelId: number;
  subLevelType: string;
  description?: string;
  status: string;
  createdAt: string;
  uploader: { name: string; email: string };
};

export default function AdminDashboard() {
  const { admin, logout, authHeaders, isLoggedIn, isSuperAdmin } = useAdmin();
  const [, navigate] = useLocation();
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [pendingResources, setPendingResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<{ id: string; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "pending">("overview");

  useEffect(() => {
    if (!isLoggedIn) { navigate("/admin/login"); return; }
    fetchData();
  }, [isLoggedIn]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allRes, pendingRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/resources`, { headers: authHeaders() }),
        isSuperAdmin
          ? fetch(`${API_BASE}/api/admin/resources/pending`, { headers: authHeaders() })
          : Promise.resolve(null),
      ]);
      const allData = await allRes.json();
      setAllResources(allData.resources || []);
      if (pendingRes) {
        const pendingData = await pendingRes.json();
        setPendingResources(pendingData.resources || []);
      }
    } catch (err) {
      showToast("Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessing(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/resources/${id}/approve`, {
        method: "POST", headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast("Resource approved! ✅ Now live on site.");
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Failed", "error");
    } finally { setProcessing(null); }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setProcessing(rejectModal.id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/resources/${rejectModal.id}/reject`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ reason: rejectReason || "No reason provided" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast("Resource rejected.");
      setRejectModal(null);
      setRejectReason("");
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Failed", "error");
    } finally { setProcessing(null); }
  };

  const stats = {
    total: allResources.length,
    approved: allResources.filter(r => r.status === "APPROVED").length,
    pending: allResources.filter(r => r.status === "PENDING").length,
    rejected: allResources.filter(r => r.status === "REJECTED").length,
  };

  const domainStats: Record<string, number> = {};
  allResources.filter(r => r.status === "APPROVED").forEach(r => {
    domainStats[r.domain] = (domainStats[r.domain] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-black">
      <CircuitBackground />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed", top: "80px", right: "24px", zIndex: 9999,
              padding: "12px 20px", borderRadius: "12px",
              background: toast.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
              border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}`,
              color: toast.type === "success" ? "#34d399" : "#f87171",
              fontSize: "13px", fontWeight: 600,
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setRejectModal(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, backdropFilter: "blur(8px)" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              style={{
                position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                zIndex: 101, width: "90%", maxWidth: "420px",
                background: "#0a0a0a", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "20px", padding: "28px",
              }}
            >
              <h3 style={{ fontFamily: "'Orbitron',sans-serif", color: "#f87171", fontSize: "16px", margin: "0 0 8px" }}>
                ❌ Reject Resource
              </h3>
              <p style={{ color: "#888", fontSize: "13px", marginBottom: "16px" }}>
                "{rejectModal.title}"
              </p>
              <label style={{ display: "block", fontSize: "11px", color: "#666", marginBottom: "8px", fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>
                Reason for rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Explain why this resource is being rejected..."
                rows={3}
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "10px", color: "#fff",
                  fontSize: "13px", outline: "none", resize: "vertical",
                  fontFamily: "inherit", boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <button
                  onClick={handleReject}
                  disabled={!!processing}
                  style={{
                    flex: 1, padding: "10px",
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.4)",
                    borderRadius: "10px", color: "#f87171",
                    fontSize: "13px", fontWeight: 700, cursor: "pointer",
                    opacity: processing ? 0.6 : 1,
                  }}
                >
                  {processing ? "Rejecting..." : "Confirm Reject"}
                </button>
                <button
                  onClick={() => { setRejectModal(null); setRejectReason(""); }}
                  style={{
                    padding: "10px 20px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px", color: "#888",
                    fontSize: "13px", cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(0,0,0,0.9)",
        borderBottom: "1px solid rgba(245,158,11,0.2)",
        backdropFilter: "blur(20px)", padding: "0 24px",
      }}>
        <div style={{
          maxWidth: "1200px", margin: "0 auto",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", height: "60px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "20px" }}>⚡</span>
            <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "14px", fontWeight: 700, color: "#f59e0b" }}>
              CHIPVERSE ADMIN
            </span>
            {isSuperAdmin && (
              <span style={{
                background: "rgba(245,158,11,0.15)",
                border: "1px solid rgba(245,158,11,0.4)",
                borderRadius: "6px", padding: "2px 8px",
                fontSize: "10px", color: "#f59e0b",
                fontFamily: "'DM Mono',monospace", fontWeight: 700,
              }}>
                SUPER ADMIN
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ color: "#666", fontSize: "12px" }}>👋 {admin?.name}</span>
            <button onClick={() => navigate("/admin/resources")}
              style={{ padding: "7px 16px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "8px", color: "#f59e0b", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
              Manage Resources
            </button>
            <button onClick={() => { logout(); navigate("/admin/login"); }}
              style={{ padding: "7px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#f87171", fontSize: "12px", cursor: "pointer" }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 10 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "32px" }}>
          <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "28px", fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>
            {isSuperAdmin ? "Super Admin Dashboard" : "Admin Dashboard"}
          </h1>
          <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
            {isSuperAdmin
              ? "Review and approve resources submitted by admins."
              : "Submit resources for review. Super admin will approve them."}
          </p>
        </motion.div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          {[
            { label: "Total Resources", value: stats.total, color: "#f59e0b", icon: "📚" },
            { label: "Live (Approved)", value: stats.approved, color: "#10b981", icon: "✅" },
            { label: "Pending Review", value: stats.pending, color: "#f59e0b", icon: "⏳" },
            { label: "Rejected", value: stats.rejected, color: "#f87171", icon: "❌" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${s.color}20`,
                borderRadius: "16px", padding: "20px",
              }}
            >
              <div style={{ fontSize: "22px", marginBottom: "8px" }}>{s.icon}</div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: s.color, fontFamily: "'DM Mono',monospace" }}>
                {loading ? "..." : s.value}
              </div>
              <div style={{ color: "#666", fontSize: "11px", marginTop: "4px" }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Super Admin: Tabs */}
        {isSuperAdmin && (
          <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "rgba(255,255,255,0.03)", padding: "4px", borderRadius: "12px", width: "fit-content" }}>
            {[
              { id: "overview", label: "📊 Overview" },
              { id: "pending", label: `⏳ Pending Review ${stats.pending > 0 ? `(${stats.pending})` : ""}` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: "8px 20px", borderRadius: "9px",
                  background: activeTab === tab.id ? "rgba(245,158,11,0.15)" : "transparent",
                  border: activeTab === tab.id ? "1px solid rgba(245,158,11,0.3)" : "1px solid transparent",
                  color: activeTab === tab.id ? "#f59e0b" : "#666",
                  fontSize: "12px", fontWeight: 600, cursor: "pointer",
                  fontFamily: "'DM Mono',monospace", transition: "all 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Overview tab */}
        {(!isSuperAdmin || activeTab === "overview") && (
          <>
            <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "16px" }}>
              Resources by Domain
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
              {DOMAINS.map((domain, i) => (
                <motion.div
                  key={domain.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -3 }}
                  onClick={() => navigate(`/admin/resources?domain=${domain.id}`)}
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: `1px solid ${domain.color}20`,
                    borderRadius: "14px", padding: "18px",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "12px", fontWeight: 700, color: "#fff" }}>
                      {domain.name}
                    </div>
                    <div style={{ fontSize: "18px", color: "#555" }}>{domainStats[domain.id] ? "📁" : "➕"}</div>
                  </div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: domain.color, fontFamily: "'DM Mono',monospace" }}>
                    {domainStats[domain.id] || 0}
                  </div>
                  <div style={{ color: "#555", fontSize: "10px" }}>approved resources</div>
                  <div style={{ marginTop: "10px", height: "3px", borderRadius: "999px", background: "rgba(255,255,255,0.05)" }}>
                    <div style={{ height: "100%", borderRadius: "999px", background: domain.color, width: `${Math.min(100, (domainStats[domain.id] || 0) * 10)}%`, transition: "width 0.6s" }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Pending Review tab (Super Admin only) */}
        {isSuperAdmin && activeTab === "pending" && (
          <div>
            <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "16px" }}>
              Pending Resources — Awaiting Your Review
            </h2>

            {loading ? (
              <div style={{ textAlign: "center", color: "#555", padding: "60px" }}>Loading...</div>
            ) : pendingResources.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "60px",
                background: "rgba(16,185,129,0.05)",
                border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: "16px", color: "#10b981",
              }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "16px", fontWeight: 700 }}>All clear!</div>
                <div style={{ fontSize: "13px", marginTop: "8px", color: "#666" }}>No resources pending review.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {pendingResources.map((r, i) => {
                  const domain = DOMAINS.find(d => d.id === r.domain);
                  const color = domain?.color || "#f59e0b";
                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        background: "rgba(245,158,11,0.03)",
                        border: "1px solid rgba(245,158,11,0.15)",
                        borderRadius: "16px", padding: "20px",
                      }}
                    >
                      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-start" }}>
                        {/* Icon */}
                        <div style={{
                          width: "44px", height: "44px", borderRadius: "12px",
                          background: `${color}15`, border: `1px solid ${color}25`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "20px", flexShrink: 0,
                        }}>
                          {TYPE_ICONS[r.type] || "📄"}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: "200px" }}>
                          <div style={{ fontWeight: 700, color: "#fff", fontSize: "15px", marginBottom: "6px" }}>
                            {r.title}
                          </div>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                            <span style={{ background: `${color}15`, border: `1px solid ${color}25`, borderRadius: "6px", padding: "2px 8px", fontSize: "10px", color, fontFamily: "'DM Mono',monospace" }}>
                              {domain?.name}
                            </span>
                            <span style={{ background: "rgba(255,255,255,0.05)", borderRadius: "6px", padding: "2px 8px", fontSize: "10px", color: "#888", fontFamily: "'DM Mono',monospace" }}>
                              Level {r.levelId}
                            </span>
                            <span style={{ background: "rgba(255,255,255,0.05)", borderRadius: "6px", padding: "2px 8px", fontSize: "10px", color: "#888", fontFamily: "'DM Mono',monospace" }}>
                              {SUB_LEVEL_ICONS[r.subLevelType]} {r.subLevelType}
                            </span>
                            <span style={{ background: "rgba(255,255,255,0.05)", borderRadius: "6px", padding: "2px 8px", fontSize: "10px", color: "#888", fontFamily: "'DM Mono',monospace" }}>
                              {r.type}
                            </span>
                          </div>
                          <a href={r.url} target="_blank" rel="noopener noreferrer"
                            style={{ color: "#555", fontSize: "12px", textDecoration: "none" }}
                            onClick={e => e.stopPropagation()}>
                            🔗 {r.url.length > 60 ? r.url.substring(0, 60) + "..." : r.url}
                          </a>
                          {r.description && (
                            <p style={{ color: "#666", fontSize: "12px", marginTop: "6px", marginBottom: 0 }}>{r.description}</p>
                          )}
                          <div style={{ marginTop: "8px", fontSize: "11px", color: "#555" }}>
                            Submitted by <span style={{ color: "#888" }}>{r.uploader.name}</span> · {new Date(r.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: "10px", flexShrink: 0, flexDirection: "column" }}>
                          <motion.button
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={() => handleApprove(r.id)}
                            disabled={processing === r.id}
                            style={{
                              padding: "10px 20px",
                              background: "linear-gradient(135deg, #10b981, #059669)",
                              border: "none", borderRadius: "10px",
                              color: "#fff", fontSize: "13px", fontWeight: 700,
                              cursor: processing === r.id ? "not-allowed" : "pointer",
                              opacity: processing === r.id ? 0.6 : 1,
                              fontFamily: "'Orbitron',sans-serif",
                              boxShadow: "0 0 20px rgba(16,185,129,0.2)",
                            }}
                          >
                            {processing === r.id ? "..." : "✅ Approve"}
                          </motion.button>
                          <button
                            onClick={() => setRejectModal({ id: r.id, title: r.title })}
                            disabled={processing === r.id}
                            style={{
                              padding: "10px 20px",
                              background: "rgba(239,68,68,0.1)",
                              border: "1px solid rgba(239,68,68,0.3)",
                              borderRadius: "10px", color: "#f87171",
                              fontSize: "13px", fontWeight: 700,
                              cursor: processing === r.id ? "not-allowed" : "pointer",
                              opacity: processing === r.id ? 0.6 : 1,
                            }}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}