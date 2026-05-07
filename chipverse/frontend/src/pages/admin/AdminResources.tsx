// frontend/src/pages/admin/AdminResources.tsx
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

const RESOURCE_TYPES = ["PAPER", "VIDEO", "TOOL", "ARTICLE", "NOTES", "BOOK", "PLAYLIST"];
const LEVELS = Array.from({ length: 13 }, (_, i) => i);

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
  description?: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  admin: { name: string; email: string };
};

const emptyForm = {
  title: "", url: "", type: "PAPER", domain: "rtl",
  levelId: 0, description: "", tags: "",
};

export default function AdminResources() {
  const { isLoggedIn, authHeaders, logout } = useAdmin();
  const [, navigate] = useLocation();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDomain, setFilterDomain] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) { navigate("/admin/login"); return; }
    fetchResources();
  }, [isLoggedIn]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/resources`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      setResources(data.resources || []);
    } catch (err) {
      showToast("Failed to fetch resources", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        levelId: Number(form.levelId),
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      };
      const url = editingId
        ? `${API_BASE}/api/admin/resources/${editingId}`
        : `${API_BASE}/api/admin/resources`;
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast(editingId ? "Resource updated!" : "Resource added!");
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchResources();
    } catch (err: any) {
      showToast(err.message || "Failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (r: Resource) => {
    setForm({
      title: r.title, url: r.url, type: r.type,
      domain: r.domain, levelId: r.levelId,
      description: r.description || "",
      tags: r.tags.join(", "),
    });
    setEditingId(r.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resource?")) return;
    setDeletingId(id);
    try {
      await fetch(`${API_BASE}/api/admin/resources/${id}`, {
        method: "DELETE", headers: authHeaders(),
      });
      showToast("Resource deleted");
      fetchResources();
    } catch {
      showToast("Failed to delete", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = resources.filter(r => {
    if (filterDomain !== "all" && r.domain !== filterDomain) return false;
    if (filterLevel !== "all" && r.levelId !== Number(filterLevel)) return false;
    return true;
  });

  const activeDomain = DOMAINS.find(d => d.id === filterDomain);
  const accentColor = activeDomain?.color || "#f59e0b";

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px", color: "#fff",
    fontSize: "13px", outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "10px", fontWeight: 600,
    color: "#666", marginBottom: "6px",
    fontFamily: "'DM Mono', monospace", textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  return (
    <div className="min-h-screen bg-black">
      <CircuitBackground />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed", top: "80px", right: "24px", zIndex: 9999,
              padding: "12px 20px", borderRadius: "12px",
              background: toast.type === "success"
                ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
              border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}`,
              color: toast.type === "success" ? "#34d399" : "#f87171",
              fontSize: "13px", fontWeight: 600,
            }}
          >
            {toast.type === "success" ? "✅" : "❌"} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(0,0,0,0.9)",
        borderBottom: "1px solid rgba(245,158,11,0.2)",
        backdropFilter: "blur(20px)",
        padding: "0 24px",
      }}>
        <div style={{
          maxWidth: "1200px", margin: "0 auto",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", height: "60px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => navigate("/admin/dashboard")}
              style={{
                background: "none", border: "none",
                color: "#888", cursor: "pointer", fontSize: "18px",
              }}
            >
              ←
            </button>
            <span style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "14px", fontWeight: 700, color: "#f59e0b",
            }}>
              RESOURCE MANAGER
            </span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); }}
              style={{
                padding: "7px 16px",
                background: showForm ? "rgba(239,68,68,0.1)" : "linear-gradient(135deg, #f59e0b, #d97706)",
                border: "none", borderRadius: "8px",
                color: showForm ? "#f87171" : "#000",
                fontSize: "12px", fontWeight: 700, cursor: "pointer",
                fontFamily: "'Orbitron', sans-serif",
              }}
            >
              {showForm ? "✕ Cancel" : "+ Add Resource"}
            </button>
            <button
              onClick={() => { logout(); navigate("/admin/login"); }}
              style={{
                padding: "7px 14px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px", color: "#888",
                fontSize: "12px", cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px", position: "relative", zIndex: 10 }}>

        {/* Add/Edit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden", marginBottom: "32px" }}
            >
              <div style={{
                background: "rgba(245,158,11,0.04)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: "20px", padding: "28px",
              }}>
                <h3 style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "16px", fontWeight: 700,
                  color: "#f59e0b", margin: "0 0 24px 0",
                }}>
                  {editingId ? "✏️ Edit Resource" : "➕ Add New Resource"}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "16px",
                  }}>
                    {/* Title */}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Title *</label>
                      <input
                        required value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="Resource title"
                        style={inputStyle}
                      />
                    </div>

                    {/* URL */}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>URL *</label>
                      <input
                        required value={form.url}
                        onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                        placeholder="https://..."
                        style={inputStyle}
                      />
                    </div>

                    {/* Domain */}
                    <div>
                      <label style={labelStyle}>Domain *</label>
                      <select
                        value={form.domain}
                        onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}
                        style={{ ...inputStyle, cursor: "pointer" }}
                      >
                        {DOMAINS.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Level */}
                    <div>
                      <label style={labelStyle}>Level (0-12) *</label>
                      <select
                        value={form.levelId}
                        onChange={e => setForm(f => ({ ...f, levelId: Number(e.target.value) }))}
                        style={{ ...inputStyle, cursor: "pointer" }}
                      >
                        {LEVELS.map(l => (
                          <option key={l} value={l}>Level {l}</option>
                        ))}
                      </select>
                    </div>

                    {/* Type */}
                    <div>
                      <label style={labelStyle}>Type *</label>
                      <select
                        value={form.type}
                        onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                        style={{ ...inputStyle, cursor: "pointer" }}
                      >
                        {RESOURCE_TYPES.map(t => (
                          <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>
                        ))}
                      </select>
                    </div>

                    {/* Tags */}
                    <div>
                      <label style={labelStyle}>Tags (comma separated)</label>
                      <input
                        value={form.tags}
                        onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                        placeholder="verilog, beginner, logic"
                        style={inputStyle}
                      />
                    </div>

                    {/* Description */}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Description</label>
                      <textarea
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Brief description of the resource..."
                        rows={3}
                        style={{
                          ...inputStyle,
                          resize: "vertical", fontFamily: "inherit",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: "11px 28px",
                        background: "linear-gradient(135deg, #f59e0b, #d97706)",
                        border: "none", borderRadius: "10px",
                        color: "#000", fontSize: "13px", fontWeight: 700,
                        fontFamily: "'Orbitron', sans-serif",
                        cursor: submitting ? "not-allowed" : "pointer",
                        opacity: submitting ? 0.6 : 1,
                      }}
                    >
                      {submitting ? "Saving..." : editingId ? "Update Resource" : "Add Resource"}
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}
                      style={{
                        padding: "11px 20px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px", color: "#888",
                        fontSize: "13px", cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div style={{
          display: "flex", gap: "12px", flexWrap: "wrap",
          marginBottom: "24px", alignItems: "center",
        }}>
          <span style={{ color: "#555", fontSize: "12px", fontFamily: "'DM Mono',monospace" }}>
            FILTER:
          </span>
          {/* Domain filter */}
          <select
            value={filterDomain}
            onChange={e => setFilterDomain(e.target.value)}
            style={{
              padding: "7px 14px",
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${accentColor}30`,
              borderRadius: "8px", color: "#fff",
              fontSize: "12px", cursor: "pointer", outline: "none",
            }}
          >
            <option value="all">All Domains</option>
            {DOMAINS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>

          {/* Level filter */}
          <select
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
            style={{
              padding: "7px 14px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px", color: "#fff",
              fontSize: "12px", cursor: "pointer", outline: "none",
            }}
          >
            <option value="all">All Levels</option>
            {LEVELS.map(l => <option key={l} value={l}>Level {l}</option>)}
          </select>

          <span style={{
            marginLeft: "auto", color: "#555",
            fontSize: "11px", fontFamily: "'DM Mono',monospace",
          }}>
            {filtered.length} resources
          </span>
        </div>

        {/* Resources List */}
        {loading ? (
          <div style={{ textAlign: "center", color: "#555", padding: "60px" }}>
            Loading resources...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px",
            color: "#555", fontSize: "14px",
          }}>
            No resources found. Click <strong style={{ color: "#f59e0b" }}>+ Add Resource</strong> to get started.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.map((r, i) => {
              const domain = DOMAINS.find(d => d.id === r.domain);
              const color = domain?.color || "#f59e0b";
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: `1px solid ${r.isActive ? color + "25" : "rgba(255,255,255,0.05)"}`,
                    borderRadius: "14px", padding: "16px 20px",
                    display: "flex", alignItems: "center",
                    gap: "16px", flexWrap: "wrap",
                    opacity: r.isActive ? 1 : 0.5,
                  }}
                >
                  {/* Type icon */}
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "10px",
                    background: `${color}15`,
                    border: `1px solid ${color}25`,
                    display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "18px", flexShrink: 0,
                  }}>
                    {TYPE_ICONS[r.type] || "📄"}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{
                      fontWeight: 600, color: "#fff",
                      fontSize: "14px", marginBottom: "4px",
                    }}>
                      {r.title}
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{
                        background: `${color}15`,
                        border: `1px solid ${color}25`,
                        borderRadius: "6px", padding: "2px 8px",
                        fontSize: "10px", color,
                        fontFamily: "'DM Mono', monospace",
                      }}>
                        {domain?.name || r.domain}
                      </span>
                      <span style={{
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "6px", padding: "2px 8px",
                        fontSize: "10px", color: "#888",
                        fontFamily: "'DM Mono', monospace",
                      }}>
                        Level {r.levelId}
                      </span>
                      <span style={{
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "6px", padding: "2px 8px",
                        fontSize: "10px", color: "#888",
                        fontFamily: "'DM Mono', monospace",
                      }}>
                        {r.type}
                      </span>
                      {!r.isActive && (
                        <span style={{
                          background: "rgba(239,68,68,0.1)",
                          borderRadius: "6px", padding: "2px 8px",
                          fontSize: "10px", color: "#f87171",
                        }}>
                          DELETED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* URL */}
                  <a
                    href={r.url} target="_blank" rel="noopener noreferrer"
                    style={{
                      color: "#555", fontSize: "11px",
                      maxWidth: "200px", overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap",
                      textDecoration: "none",
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    🔗 {r.url.replace("https://", "").substring(0, 30)}...
                  </a>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button
                      onClick={() => handleEdit(r)}
                      style={{
                        padding: "7px 14px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px", color: "#ccc",
                        fontSize: "12px", cursor: "pointer",
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={deletingId === r.id || !r.isActive}
                      style={{
                        padding: "7px 14px",
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: "8px", color: "#f87171",
                        fontSize: "12px", cursor: "pointer",
                        opacity: (deletingId === r.id || !r.isActive) ? 0.5 : 1,
                      }}
                    >
                      {deletingId === r.id ? "..." : "🗑️"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}