// frontend/src/pages/admin/AdminDashboard.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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

export default function AdminDashboard() {
  const { admin, logout, authHeaders, isLoggedIn } = useAdmin();
  const [, navigate] = useLocation();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [totalResources, setTotalResources] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { navigate("/admin/login"); return; }
    fetchStats();
  }, [isLoggedIn]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/resources`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.resources) {
        const counts: Record<string, number> = {};
        data.resources.forEach((r: any) => {
          counts[r.domain] = (counts[r.domain] || 0) + 1;
        });
        setStats(counts);
        setTotalResources(data.resources.length);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/admin/login"); };

  return (
    <div className="min-h-screen bg-black" style={{ paddingTop: "0" }}>
      <CircuitBackground />

      {/* Admin Navbar */}
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
            <span style={{ fontSize: "20px" }}>⚡</span>
            <span style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "14px", fontWeight: 700, color: "#f59e0b",
              letterSpacing: "1px",
            }}>
              CHIPVERSE ADMIN
            </span>
            <span style={{
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: "6px", padding: "2px 8px",
              fontSize: "10px", color: "#f59e0b",
              fontFamily: "'DM Mono', monospace",
            }}>
              DASHBOARD
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ color: "#888", fontSize: "13px" }}>
              👋 {admin?.name}
            </span>
            <button
              onClick={() => navigate("/admin/resources")}
              style={{
                padding: "7px 16px",
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: "8px", color: "#f59e0b",
                fontSize: "12px", fontWeight: 600, cursor: "pointer",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              Manage Resources
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: "7px 14px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "8px", color: "#f87171",
                fontSize: "12px", cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 10 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "40px" }}>
          <h1 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "28px", fontWeight: 700, color: "#fff",
            margin: 0, marginBottom: "8px",
          }}>
            Admin Dashboard
          </h1>
          <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
            Manage resources across all ChipVerse learning domains
          </p>
        </motion.div>

        {/* Stats row */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px", marginBottom: "40px",
        }}>
          {[
            { label: "Total Resources", value: totalResources, color: "#f59e0b", icon: "📚" },
            { label: "Active Domains", value: Object.keys(stats).length, color: "#10b981", icon: "🎯" },
            { label: "Admins", value: 1, color: "#a855f7", icon: "👤" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${stat.color}30`,
                borderRadius: "16px", padding: "20px",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>{stat.icon}</div>
              <div style={{
                fontSize: "28px", fontWeight: 700, color: stat.color,
                fontFamily: "'DM Mono', monospace",
              }}>
                {loading ? "..." : stat.value}
              </div>
              <div style={{ color: "#666", fontSize: "12px", marginTop: "4px" }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Domain cards */}
        <h2 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "16px", fontWeight: 700, color: "#fff",
          marginBottom: "20px",
        }}>
          Resources by Domain
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "16px",
        }}>
          {DOMAINS.map((domain, i) => (
            <motion.div
              key={domain.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              onClick={() => navigate(`/admin/resources?domain=${domain.id}`)}
              style={{
                background: "rgba(255,255,255,0.025)",
                border: `1px solid ${domain.color}25`,
                borderRadius: "16px", padding: "20px",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "13px", fontWeight: 700,
                    color: "#fff", marginBottom: "4px",
                  }}>
                    {domain.name}
                  </div>
                  <div style={{ color: "#555", fontSize: "11px", fontFamily: "'DM Mono', monospace" }}>
                    {stats[domain.id] || 0} resources
                  </div>
                </div>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: `${domain.color}15`,
                  border: `1px solid ${domain.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px",
                }}>
                  {stats[domain.id] ? "📁" : "➕"}
                </div>
              </div>
              <div style={{
                marginTop: "12px", height: "3px", borderRadius: "999px",
                background: "rgba(255,255,255,0.05)",
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%", borderRadius: "999px",
                  background: domain.color,
                  width: `${Math.min(100, (stats[domain.id] || 0) * 10)}%`,
                  transition: "width 0.6s ease",
                }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}