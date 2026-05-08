// frontend/src/components/ResourceSection.tsx
// Drop this inside any sub-level panel to show approved resources
// Usage: <ResourceSection domain="rtl" levelId={3} subLevelType="CONCEPT" />

import { useState, useEffect } from "react";

const API_BASE = "https://chipverse-production.up.railway.app";

const TYPE_ICONS: Record<string, string> = {
  PAPER: "📄", VIDEO: "🎬", TOOL: "🔧", ARTICLE: "📰",
  NOTES: "📝", BOOK: "📚", PLAYLIST: "🎵",
};

const TYPE_COLORS: Record<string, string> = {
  PAPER: "#a855f7", VIDEO: "#f87171", TOOL: "#10b981",
  ARTICLE: "#3b82f6", NOTES: "#f59e0b",
  BOOK: "#00f5ff", PLAYLIST: "#ec4899",
};

type Resource = {
  id: string;
  title: string;
  url: string;
  type: string;
  description?: string;
  tags: string[];
  uploader: { name: string };
};

type Props = {
  domain: string;
  levelId: number;
  subLevelType: string; // CONCEPT | SYNTAX | WALKTHROUGH | LAB | QUIZ
  accentColor?: string;
};

export default function ResourceSection({ domain, levelId, subLevelType, accentColor = "#00f5ff" }: Props) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/resources?domain=${domain}&levelId=${levelId}&subLevelType=${subLevelType}`)
      .then(r => r.json())
      .then(data => {
        setResources(data.resources || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [domain, levelId, subLevelType]);

  // Don't render anything if no resources and not loading
  if (!loading && resources.length === 0) return null;

  return (
    <div style={{
      marginTop: "24px",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      paddingTop: "20px",
    }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: "100%", background: "none", border: "none",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", padding: 0, marginBottom: expanded ? "14px" : 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px" }}>📌</span>
          <span style={{
            fontSize: "12px", fontWeight: 700, color: accentColor,
            fontFamily: "'DM Mono', monospace", letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}>
            Faculty Resources
          </span>
          {!loading && resources.length > 0 && (
            <span style={{
              background: `${accentColor}20`,
              border: `1px solid ${accentColor}30`,
              borderRadius: "999px", padding: "1px 8px",
              fontSize: "10px", color: accentColor,
              fontFamily: "'DM Mono', monospace",
            }}>
              {resources.length}
            </span>
          )}
        </div>
        <span style={{ color: "#555", fontSize: "12px", transition: "transform 0.2s", display: "inline-block", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
          ▼
        </span>
      </button>

      {/* Resources list */}
      {expanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {loading ? (
            <div style={{ color: "#555", fontSize: "12px", padding: "12px 0", fontFamily: "'DM Mono',monospace" }}>
              Loading resources...
            </div>
          ) : (
            resources.map(r => {
              const color = TYPE_COLORS[r.type] || accentColor;
              return (
                <a
                  key={r.id}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "12px 14px", borderRadius: "12px",
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${color}20`,
                      transition: "all 0.2s", cursor: "pointer",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = `${color}08`;
                      (e.currentTarget as HTMLElement).style.borderColor = `${color}40`;
                      (e.currentTarget as HTMLElement).style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                      (e.currentTarget as HTMLElement).style.borderColor = `${color}20`;
                      (e.currentTarget as HTMLElement).style.transform = "translateX(0)";
                    }}
                  >
                    {/* Type icon */}
                    <div style={{
                      width: "34px", height: "34px", borderRadius: "9px", flexShrink: 0,
                      background: `${color}15`, border: `1px solid ${color}25`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "16px",
                    }}>
                      {TYPE_ICONS[r.type] || "📄"}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 600, color: "#e5e5e5", fontSize: "13px",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        marginBottom: "2px",
                      }}>
                        {r.title}
                      </div>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{
                          fontSize: "10px", color: color,
                          fontFamily: "'DM Mono',monospace",
                          background: `${color}10`, borderRadius: "4px",
                          padding: "1px 6px",
                        }}>
                          {r.type}
                        </span>
                        {r.tags.slice(0, 2).map(tag => (
                          <span key={tag} style={{
                            fontSize: "10px", color: "#555",
                            fontFamily: "'DM Mono',monospace",
                          }}>
                            #{tag}
                          </span>
                        ))}
                        <span style={{ fontSize: "10px", color: "#444", marginLeft: "auto" }}>
                          by {r.uploader?.name}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <span style={{ color: "#444", fontSize: "14px", flexShrink: 0 }}>→</span>
                  </div>
                </a>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}