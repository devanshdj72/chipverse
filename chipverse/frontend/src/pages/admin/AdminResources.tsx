// frontend/src/pages/admin/AdminResources.tsx
import { useState, useEffect, useRef } from "react";
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

const SUB_LEVELS = [
  { id: "CONCEPT", label: "Concept", icon: "📚", desc: "Theory & explanation" },
  { id: "SYNTAX", label: "Key Concepts / Syntax", icon: "🔤", desc: "Equations & syntax" },
  { id: "WALKTHROUGH", label: "Walkthrough", icon: "👀", desc: "Step-by-step example" },
  { id: "LAB", label: "Lab", icon: "⚗️", desc: "Hands-on practice" },
  { id: "QUIZ", label: "Quiz", icon: "🧠", desc: "Test knowledge" },
];

// Types that primarily use URLs
const URL_TYPES = ["VIDEO", "TOOL", "PLAYLIST"];

const RESOURCE_TYPES = [
  { id: "PAPER",    icon: "📄", label: "Research Paper",  hint: "arXiv, IEEE, ACM link or PDF upload" },
  { id: "VIDEO",    icon: "🎬", label: "Video",           hint: "YouTube, Vimeo, or lecture URL" },
  { id: "TOOL",     icon: "🔧", label: "Tool / Software", hint: "Website or download link" },
  { id: "ARTICLE",  icon: "📰", label: "Article",         hint: "Blog post, documentation link" },
  { id: "NOTES",    icon: "📝", label: "Notes / Slides",  hint: "PDF, PPTX, or DOCX upload" },
  { id: "BOOK",     icon: "📚", label: "Book / Textbook", hint: "Link or PDF upload" },
  { id: "PLAYLIST", icon: "🎵", label: "Playlist",        hint: "YouTube playlist or course link" },
];

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  PENDING:  { bg: "rgba(245,158,11,0.1)",  color: "#f59e0b", label: "⏳ Pending Review" },
  APPROVED: { bg: "rgba(16,185,129,0.1)",  color: "#10b981", label: "✅ Approved" },
  REJECTED: { bg: "rgba(239,68,68,0.1)",   color: "#f87171", label: "❌ Rejected" },
};

type Resource = {
  id: string;
  title: string;
  url?: string;
  fileName?: string;
  type: string;
  domain: string;
  levelId: number;
  subLevelType: string;
  description?: string;
  tags: string[];
  status: string;
  rejectionReason?: string;
  isActive: boolean;
  createdAt: string;
  uploader: { name: string; email: string };
};

const emptyForm = {
  title: "",
  url: "",
  type: "",
  domain: "",
  levelId: -1,
  subLevelType: "",
  description: "",
  tags: "",
  fileData: "",
  fileName: "",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px", color: "#fff",
  fontSize: "13px", outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "10px", fontWeight: 600,
  color: "#666", marginBottom: "6px",
  fontFamily: "'DM Mono', monospace",
  textTransform: "uppercase", letterSpacing: "0.5px",
};

export default function AdminResources() {
  const { isLoggedIn, authHeaders, logout } = useAdmin();
  const [, navigate] = useLocation();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDomain, setFilterDomain] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoggedIn) { navigate("/admin/login"); return; }
    fetchResources();
  }, [isLoggedIn]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/resources`, { headers: authHeaders() });
      const data = await res.json();
      setResources(data.resources || []);
    } catch { showToast("Failed to fetch", "error"); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setStep(1);
    setEditingId(null);
    setShowForm(false);
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      setForm(f => ({ ...f, fileData: base64, fileName: file.name }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.domain || form.levelId < 0 || !form.subLevelType || !form.title || !form.type) {
      showToast("Please complete all required fields", "error");
      return;
    }
    if (!form.url && !form.fileData) {
      showToast("Please provide a URL or upload a file", "error");
      return;
    }
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
      showToast(editingId ? "Resource updated!" : "Submitted for review! ⏳");
      resetForm();
      fetchResources();
    } catch (err: any) {
      showToast(err.message || "Failed", "error");
    } finally { setSubmitting(false); }
  };

  const handleEdit = (r: Resource) => {
    setForm({
      title: r.title, url: r.url || "", type: r.type,
      domain: r.domain, levelId: r.levelId,
      subLevelType: r.subLevelType,
      description: r.description || "",
      tags: r.tags.join(", "),
      fileData: "", fileName: r.fileName || "",
    });
    setEditingId(r.id);
    setStep(4);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resource?")) return;
    try {
      await fetch(`${API_BASE}/api/admin/resources/${id}`, { method: "DELETE", headers: authHeaders() });
      showToast("Resource deleted");
      fetchResources();
    } catch { showToast("Failed to delete", "error"); }
  };

  const filtered = resources.filter(r => {
    if (filterDomain !== "all" && r.domain !== filterDomain) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    return true;
  });

  const selectedDomain = DOMAINS.find(d => d.id === form.domain);
  const accentColor = selectedDomain?.color || "#f59e0b";
  const selectedType = RESOURCE_TYPES.find(t => t.id === form.type);
  const steps = ["Domain", "Level", "Sub-level", "Details"];

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

      {/* Navbar */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(0,0,0,0.9)", borderBottom: "1px solid rgba(245,158,11,0.2)", backdropFilter: "blur(20px)", padding: "0 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => navigate("/admin/dashboard")} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "18px" }}>←</button>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "14px", fontWeight: 700, color: "#f59e0b" }}>RESOURCE MANAGER</span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => { if (showForm) resetForm(); else { setShowForm(true); setStep(1); } }}
              style={{ padding: "7px 16px", background: showForm ? "rgba(239,68,68,0.1)" : "linear-gradient(135deg, #f59e0b, #d97706)", border: "none", borderRadius: "8px", color: showForm ? "#f87171" : "#000", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "'Orbitron', sans-serif" }}
            >
              {showForm ? "✕ Cancel" : "+ Add Resource"}
            </button>
            <button onClick={() => { logout(); navigate("/admin/login"); }} style={{ padding: "7px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#888", fontSize: "12px", cursor: "pointer" }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px", position: "relative", zIndex: 10 }}>

        {/* ── FORM ── */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden", marginBottom: "32px" }}
            >
              <div style={{ background: "rgba(245,158,11,0.03)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "20px", padding: "28px" }}>
                <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "16px", fontWeight: 700, color: "#f59e0b", margin: "0 0 20px 0" }}>
                  {editingId ? "✏️ Edit Resource" : "➕ Submit New Resource"}
                </h3>

                {/* Step indicator */}
                {!editingId && (
                  <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
                    {steps.map((s, i) => (
                      <div key={s} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: step > i + 1 ? "#10b981" : step === i + 1 ? "#f59e0b" : "rgba(255,255,255,0.05)", border: `1px solid ${step >= i + 1 ? "transparent" : "rgba(255,255,255,0.1)"}`, fontSize: "11px", fontWeight: 700, color: step >= i + 1 ? "#000" : "#555", transition: "all 0.3s" }}>
                          {step > i + 1 ? "✓" : i + 1}
                        </div>
                        <span style={{ fontSize: "11px", color: step === i + 1 ? "#f59e0b" : "#555", fontFamily: "'DM Mono', monospace" }}>{s}</span>
                        {i < steps.length - 1 && <div style={{ width: "20px", height: "1px", background: step > i + 1 ? "#10b981" : "rgba(255,255,255,0.1)" }} />}
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSubmit}>

                  {/* STEP 1: Domain */}
                  {step === 1 && !editingId && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <p style={{ color: "#888", fontSize: "13px", marginBottom: "16px" }}>Select the domain this resource belongs to:</p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px" }}>
                        {DOMAINS.map(d => (
                          <motion.div key={d.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={() => { setForm(f => ({ ...f, domain: d.id })); setStep(2); }}
                            style={{ padding: "14px", borderRadius: "12px", cursor: "pointer", background: form.domain === d.id ? `${d.color}15` : "rgba(255,255,255,0.03)", border: `1px solid ${form.domain === d.id ? d.color + "50" : "rgba(255,255,255,0.08)"}`, transition: "all 0.2s" }}>
                            <div style={{ fontSize: "11px", fontWeight: 700, color: d.color, fontFamily: "'Orbitron', sans-serif" }}>{d.name}</div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: Level */}
                  {step === 2 && !editingId && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <p style={{ color: "#888", fontSize: "13px", marginBottom: "16px" }}>
                        Select level for <span style={{ color: accentColor }}>{selectedDomain?.name}</span>:
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "8px", marginBottom: "16px" }}>
                        {Array.from({ length: 13 }, (_, i) => (
                          <motion.div key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => { setForm(f => ({ ...f, levelId: i })); setStep(3); }}
                            style={{ padding: "12px 8px", borderRadius: "10px", cursor: "pointer", textAlign: "center", background: form.levelId === i ? `${accentColor}15` : "rgba(255,255,255,0.03)", border: `1px solid ${form.levelId === i ? accentColor + "50" : "rgba(255,255,255,0.08)"}` }}>
                            <div style={{ fontSize: "18px", fontWeight: 700, color: form.levelId === i ? accentColor : "#fff", fontFamily: "'DM Mono', monospace" }}>{i}</div>
                            <div style={{ fontSize: "9px", color: "#555", marginTop: "2px" }}>Level {i}</div>
                          </motion.div>
                        ))}
                      </div>
                      <button type="button" onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "12px" }}>← Back</button>
                    </motion.div>
                  )}

                  {/* STEP 3: Sub-level */}
                  {step === 3 && !editingId && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <p style={{ color: "#888", fontSize: "13px", marginBottom: "16px" }}>
                        Select sub-level for <span style={{ color: accentColor }}>{selectedDomain?.name}</span> → Level {form.levelId}:
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                        {SUB_LEVELS.map(sl => (
                          <motion.div key={sl.id} whileHover={{ x: 4 }}
                            onClick={() => { setForm(f => ({ ...f, subLevelType: sl.id })); setStep(4); }}
                            style={{ padding: "14px 18px", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px", background: form.subLevelType === sl.id ? `${accentColor}10` : "rgba(255,255,255,0.03)", border: `1px solid ${form.subLevelType === sl.id ? accentColor + "40" : "rgba(255,255,255,0.08)"}`, transition: "all 0.2s" }}>
                            <span style={{ fontSize: "22px" }}>{sl.icon}</span>
                            <div>
                              <div style={{ fontWeight: 700, color: "#fff", fontSize: "13px" }}>{sl.label}</div>
                              <div style={{ color: "#555", fontSize: "11px" }}>{sl.desc}</div>
                            </div>
                            {form.subLevelType === sl.id && <span style={{ marginLeft: "auto", color: accentColor }}>✓</span>}
                          </motion.div>
                        ))}
                      </div>
                      <button type="button" onClick={() => setStep(2)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "12px" }}>← Back</button>
                    </motion.div>
                  )}

                  {/* STEP 4: Resource Details */}
                  {step === 4 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                      {/* Breadcrumb */}
                      {!editingId && (
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px", padding: "10px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px" }}>
                          <span style={{ fontSize: "10px", color: accentColor, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{selectedDomain?.name}</span>
                          <span style={{ color: "#444" }}>→</span>
                          <span style={{ fontSize: "10px", color: "#888", fontFamily: "'DM Mono',monospace" }}>Level {form.levelId}</span>
                          <span style={{ color: "#444" }}>→</span>
                          <span style={{ fontSize: "10px", color: "#888", fontFamily: "'DM Mono',monospace" }}>
                            {SUB_LEVELS.find(s => s.id === form.subLevelType)?.icon} {SUB_LEVELS.find(s => s.id === form.subLevelType)?.label}
                          </span>
                        </div>
                      )}

                      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                        {/* ── 1. TITLE ── */}
                        <div>
                          <label style={labelStyle}>Title *</label>
                          <input
                            required value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="e.g. Introduction to RTL Design — MIT OpenCourseWare"
                            style={inputStyle}
                          />
                        </div>

                        {/* ── 2. RESOURCE TYPE ── */}
                        <div>
                          <label style={labelStyle}>Resource Type *</label>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "8px" }}>
                            {RESOURCE_TYPES.map(t => (
                              <motion.div
                                key={t.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setForm(f => ({ ...f, type: t.id }))}
                                style={{
                                  padding: "12px 14px", borderRadius: "10px", cursor: "pointer",
                                  background: form.type === t.id ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.03)",
                                  border: `1px solid ${form.type === t.id ? "rgba(245,158,11,0.5)" : "rgba(255,255,255,0.08)"}`,
                                  transition: "all 0.15s",
                                }}
                              >
                                <div style={{ fontSize: "20px", marginBottom: "4px" }}>{t.icon}</div>
                                <div style={{ fontSize: "12px", fontWeight: 700, color: form.type === t.id ? "#f59e0b" : "#ccc" }}>{t.label}</div>
                                <div style={{ fontSize: "10px", color: "#555", marginTop: "2px", lineHeight: 1.3 }}>{t.hint}</div>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* ── 3. URL ── */}
                        <div>
                          <label style={labelStyle}>
                            URL {URL_TYPES.includes(form.type) ? "*" : "(optional)"}
                          </label>
                          <input
                            value={form.url}
                            onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                            placeholder={
                              form.type === "VIDEO" ? "https://youtube.com/watch?v=..." :
                              form.type === "TOOL" ? "https://tool-website.com" :
                              form.type === "PLAYLIST" ? "https://youtube.com/playlist?list=..." :
                              "https://... (optional if uploading a file)"
                            }
                            style={{
                              ...inputStyle,
                              borderColor: URL_TYPES.includes(form.type) ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.1)",
                            }}
                          />
                          {form.type && (
                            <p style={{ color: "#555", fontSize: "11px", marginTop: "5px", fontFamily: "'DM Mono',monospace" }}>
                              {selectedType?.hint}
                            </p>
                          )}
                        </div>

                        {/* ── 4. FILE UPLOAD ── */}
                        <div>
                          <label style={labelStyle}>Upload File (optional — all formats supported)</label>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="*/*"
                            style={{ display: "none" }}
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleFileSelect(file);
                            }}
                          />
                          <div
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                              padding: "24px", borderRadius: "12px", cursor: "pointer",
                              border: `2px dashed ${dragOver ? "rgba(245,158,11,0.6)" : form.fileName ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.1)"}`,
                              background: dragOver ? "rgba(245,158,11,0.05)" : form.fileName ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)",
                              textAlign: "center", transition: "all 0.2s",
                            }}
                          >
                            {form.fileName ? (
                              <div>
                                <div style={{ fontSize: "28px", marginBottom: "8px" }}>✅</div>
                                <div style={{ color: "#10b981", fontWeight: 600, fontSize: "14px" }}>{form.fileName}</div>
                                <div style={{ color: "#555", fontSize: "11px", marginTop: "4px" }}>Click to change file</div>
                              </div>
                            ) : (
                              <div>
                                <div style={{ fontSize: "28px", marginBottom: "8px" }}>📁</div>
                                <div style={{ color: "#888", fontSize: "13px", fontWeight: 600 }}>
                                  {dragOver ? "Drop file here" : "Drag & drop or click to upload"}
                                </div>
                                <div style={{ color: "#555", fontSize: "11px", marginTop: "4px" }}>
                                  PDF, DOCX, PPTX, MP4, ZIP, or any format
                                </div>
                              </div>
                            )}
                          </div>
                          {form.fileName && (
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, fileData: "", fileName: "" })); }}
                              style={{ marginTop: "8px", background: "none", border: "none", color: "#f87171", fontSize: "12px", cursor: "pointer", fontFamily: "'DM Mono',monospace" }}
                            >
                              ✕ Remove file
                            </button>
                          )}
                        </div>

                        {/* ── 5. TAGS ── */}
                        <div>
                          <label style={labelStyle}>Tags (comma separated)</label>
                          <input
                            value={form.tags}
                            onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                            placeholder="verilog, beginner, synthesis, timing"
                            style={inputStyle}
                          />
                        </div>

                        {/* ── 6. DESCRIPTION ── */}
                        <div>
                          <label style={labelStyle}>Description</label>
                          <textarea
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Brief description of what this resource covers..."
                            rows={3}
                            style={{ ...inputStyle, resize: "vertical" }}
                          />
                        </div>

                        {/* Edit mode: domain/level/sublevel dropdowns */}
                        {editingId && (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                            <div>
                              <label style={labelStyle}>Domain</label>
                              <select value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                                {DOMAINS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={labelStyle}>Level</label>
                              <select value={form.levelId} onChange={e => setForm(f => ({ ...f, levelId: Number(e.target.value) }))} style={{ ...inputStyle, cursor: "pointer" }}>
                                {Array.from({ length: 13 }, (_, i) => <option key={i} value={i}>Level {i}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={labelStyle}>Sub-level</label>
                              <select value={form.subLevelType} onChange={e => setForm(f => ({ ...f, subLevelType: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                                {SUB_LEVELS.map(sl => <option key={sl.id} value={sl.id}>{sl.icon} {sl.label}</option>)}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Submit */}
                      <div style={{ display: "flex", gap: "12px", marginTop: "24px", alignItems: "center" }}>
                        {!editingId && (
                          <button type="button" onClick={() => setStep(3)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "12px" }}>
                            ← Back
                          </button>
                        )}
                        <motion.button
                          type="submit" disabled={submitting}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          style={{ padding: "12px 28px", background: "linear-gradient(135deg, #f59e0b, #d97706)", border: "none", borderRadius: "10px", color: "#000", fontSize: "13px", fontWeight: 700, fontFamily: "'Orbitron', sans-serif", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1, boxShadow: "0 0 20px rgba(245,158,11,0.3)" }}
                        >
                          {submitting ? "Submitting..." : editingId ? "Update Resource" : "Submit for Review →"}
                        </motion.button>
                      </div>
                      <p style={{ color: "#555", fontSize: "11px", marginTop: "10px", fontFamily: "'DM Mono',monospace" }}>
                        ⏳ Submitted resources go to Super Admin for approval before appearing on site.
                      </p>
                    </motion.div>
                  )}
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FILTERS ── */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px", alignItems: "center" }}>
          <span style={{ color: "#555", fontSize: "12px", fontFamily: "'DM Mono',monospace" }}>FILTER:</span>
          <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)}
            style={{ padding: "7px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "12px", cursor: "pointer", outline: "none" }}>
            <option value="all">All Domains</option>
            {DOMAINS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: "7px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "12px", cursor: "pointer", outline: "none" }}>
            <option value="all">All Statuses</option>
            <option value="PENDING">⏳ Pending</option>
            <option value="APPROVED">✅ Approved</option>
            <option value="REJECTED">❌ Rejected</option>
          </select>
          <span style={{ marginLeft: "auto", color: "#555", fontSize: "11px", fontFamily: "'DM Mono',monospace" }}>
            {filtered.length} resources
          </span>
        </div>

        {/* ── LIST ── */}
        {loading ? (
          <div style={{ textAlign: "center", color: "#555", padding: "60px" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#555", fontSize: "14px" }}>
            No resources yet. Click{" "}
            <strong
              onClick={() => { setShowForm(true); setStep(1); }}
              style={{ color: "#f59e0b", cursor: "pointer", textDecoration: "underline" }}
            >
              + Add Resource
            </strong>{" "}
            to submit one.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.map((r, i) => {
              const domain = DOMAINS.find(d => d.id === r.domain);
              const color = domain?.color || "#f59e0b";
              const sl = SUB_LEVELS.find(s => s.id === r.subLevelType);
              const rt = RESOURCE_TYPES.find(t => t.id === r.type);
              const statusStyle = STATUS_STYLES[r.status] || STATUS_STYLES.PENDING;
              return (
                <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                  style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${color}20`, borderRadius: "14px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", opacity: r.isActive ? 1 : 0.4 }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${color}15`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                    {rt?.icon || "📄"}
                  </div>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ fontWeight: 600, color: "#fff", fontSize: "14px", marginBottom: "6px" }}>{r.title}</div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <span style={{ background: `${color}15`, border: `1px solid ${color}25`, borderRadius: "6px", padding: "2px 8px", fontSize: "10px", color, fontFamily: "'DM Mono',monospace" }}>{domain?.name}</span>
                      <span style={{ background: "rgba(255,255,255,0.05)", borderRadius: "6px", padding: "2px 8px", fontSize: "10px", color: "#888", fontFamily: "'DM Mono',monospace" }}>Level {r.levelId}</span>
                      <span style={{ background: "rgba(255,255,255,0.05)", borderRadius: "6px", padding: "2px 8px", fontSize: "10px", color: "#888", fontFamily: "'DM Mono',monospace" }}>{sl?.icon} {sl?.label || r.subLevelType}</span>
                      <span style={{ background: statusStyle.bg, borderRadius: "6px", padding: "2px 8px", fontSize: "10px", color: statusStyle.color, fontFamily: "'DM Mono',monospace" }}>{statusStyle.label}</span>
                      {r.fileName && <span style={{ background: "rgba(16,185,129,0.1)", borderRadius: "6px", padding: "2px 8px", fontSize: "10px", color: "#10b981", fontFamily: "'DM Mono',monospace" }}>📎 {r.fileName}</span>}
                    </div>
                    {r.status === "REJECTED" && r.rejectionReason && (
                      <div style={{ marginTop: "6px", fontSize: "11px", color: "#f87171", fontStyle: "italic" }}>Reason: {r.rejectionReason}</div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    {(r.status === "PENDING" || r.status === "REJECTED") && (
                      <button onClick={() => handleEdit(r)} style={{ padding: "7px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#ccc", fontSize: "12px", cursor: "pointer" }}>✏️ Edit</button>
                    )}
                    <button onClick={() => handleDelete(r.id)} style={{ padding: "7px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#f87171", fontSize: "12px", cursor: "pointer" }}>🗑️</button>
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