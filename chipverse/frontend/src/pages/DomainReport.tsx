import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from 'recharts';
import {
  Download, Share2, Trophy, Star, Flame, Zap,
  CheckCircle2, Clock, BookOpen, Code, Eye,
  FlaskConical, Brain, Award, ArrowLeft, Check,
} from 'lucide-react';
import { useUserContext } from '@/lib/user';
import { DOMAIN_THEMES } from '@/lib/themes';
import { ROADMAPS, RTL_SUB_LEVELS, DOMAIN_LIST } from '@/lib/data';
import CircuitBackground from '@/components/CircuitBackground';
import api from '@/lib/api';

// ── Storage keys ──────────────────────────────────────────────────────────────
const STORAGE_KEYS: Record<string, string> = {
  rtl:               'rtl_sublevel_progress',
  verification:      'verification_sublevel_progress',
  'physical-design': 'pd_sublevel_progress',
  analog:            'analog_sublevel_progress',
  fpga:              'fpga_sublevel_progress',
  embedded:          'embedded_sublevel_progress',
  dft:               'dft_sublevel_progress',
  research:          'research_sublevel_progress',
};

// ── Load localStorage progress ────────────────────────────────────────────────
function loadLocalProgress(domainId: string) {
  try {
    const key = STORAGE_KEYS[domainId] || `${domainId}_sublevel_progress`;
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { completedSubLevels: [], completedLevels: [], claimedLevels: [], totalXp: 0 };
}

// ── Compute report from local + DB data ───────────────────────────────────────
function computeReport(domainId: string, dbCompletedLevels: number[]) {
  const levels     = ROADMAPS[domainId as keyof typeof ROADMAPS] || [];
  const subData    = RTL_SUB_LEVELS;
  const local      = loadLocalProgress(domainId);
  const domainInfo = DOMAIN_LIST.find(d => d.id === domainId);
  const allCompleted = new Set([...dbCompletedLevels, ...local.completedLevels]);

  const breakdown = {
    concept:     { completed: 0, total: 0 },
    syntax:      { completed: 0, total: 0 },
    walkthrough: { completed: 0, total: 0 },
    lab:         { completed: 0, total: 0 },
    quiz:        { completed: 0, total: 0 },
  };

  const levelDetails = levels.map(level => {
    const subLevel   = subData.find(s => s.levelId === level.id);
    const completed  = allCompleted.has(level.id);
    let subCompleted = 0;

    if (subLevel) {
      subLevel.subLevels.forEach(sl => {
        const type = sl.type as keyof typeof breakdown;
        if (breakdown[type]) breakdown[type].total++;
        if (local.completedSubLevels.includes(sl.id)) {
          subCompleted++;
          if (breakdown[type]) breakdown[type].completed++;
        }
      });
    }

    const subCount = subLevel?.subLevels.length || 0;
    const status   = completed        ? 'completed'
                   : subCompleted > 0 ? 'in_progress'
                   :                    'not_started';

    return {
      levelId:            level.id,
      title:              level.title,
      status,
      xpEarned:           completed
                            ? level.xp
                            : Math.round((subCompleted / Math.max(subCount, 1)) * level.xp),
      subLevelsCompleted: subCompleted,
      totalSubLevels:     subCount,
      badge:              level.badge,
    };
  }) as any[];

  const totalXpEarned   = levelDetails.reduce((s: number, l: any) => s + l.xpEarned, 0);
  const levelsCompleted = levelDetails.filter((l: any) => l.status === 'completed').length;
  const subLevCompleted = Object.values(breakdown).reduce((s, v) => s + v.completed, 0);
  const totalSubLevs    = Object.values(breakdown).reduce((s, v) => s + v.total, 0);
  const pct             = Math.round((levelsCompleted / Math.max(levels.length, 1)) * 100);
  const badgesEarned    = levelDetails
    .filter((l: any) => l.status === 'completed' && l.badge)
    .map((l: any) => l.badge);

  const typeScores   = Object.entries(breakdown).map(([k, v]) => ({
    type: k, pct: v.total ? Math.round((v.completed / v.total) * 100) : 0,
  }));
  const strengths    = typeScores.filter(t => t.pct >= 70)
    .map(t => `${t.type.charAt(0).toUpperCase() + t.type.slice(1)} — ${t.pct}% complete`);
  const improvements = typeScores.filter(t => t.pct < 40)
    .map(t => `${t.type.charAt(0).toUpperCase() + t.type.slice(1)} — needs practice`);

  return {
    domainId,
    domainName:           domainInfo?.name || domainId,
    totalXpEarned,
    levelsCompleted,
    totalLevels:          levels.length,
    subLevelsCompleted:   subLevCompleted,
    totalSubLevels:       totalSubLevs,
    completionPercentage: pct,
    subLevelBreakdown:    breakdown,
    levelDetails,
    badgesEarned,
    strengths:    strengths.length    ? strengths    : ['Keep completing levels to see your strengths!'],
    improvements: improvements.length ? improvements : ['Great balance across all skill types!'],
  };
}

// ── Radar chart data ──────────────────────────────────────────────────────────
function radarData(breakdown: any) {
  const labels: Record<string, string> = {
    concept: 'Concept', syntax: 'Syntax', walkthrough: 'Walkthrough',
    lab: 'Lab', quiz: 'Quiz',
  };
  return Object.entries(breakdown).map(([k, v]: any) => ({
    subject:  labels[k] || k,
    score:    v.total ? Math.round((v.completed / v.total) * 100) : 0,
    fullMark: 100,
  }));
}

const statusColor = (s: string) =>
  s === 'completed'   ? '#4ade80' :
  s === 'in_progress' ? '#f59e0b' : '#374151';

const typeIcon: Record<string, any> = {
  concept: BookOpen, syntax: Code, walkthrough: Eye, lab: FlaskConical, quiz: Brain,
};

// ─────────────────────────────────────────────────────────────────────────────
export default function DomainReport() {
  const params                   = useParams<{ domainId?: string; shareToken?: string }>();
  const domainId                 = params.domainId;
  const shareToken               = params.shareToken;
  const { user, profile }        = useUserContext();
  const [, setLocation]          = useLocation();
  const reportRef                = useRef<HTMLDivElement>(null);
  const theme                    = DOMAIN_THEMES[domainId || 'rtl'];

  const [report,   setReport]   = useState<any>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [copied,   setCopied]   = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [error,    setError]    = useState('');

  // ── Load / generate ───────────────────────────────────────────────────────
  useEffect(() => {
    if (shareToken) {
      api.report.getShared(shareToken)
        .then(r  => { setReport(r.data); setLoading(false); })
        .catch(() => { setError('Report not found'); setLoading(false); });
      return;
    }
    if (!domainId) return;
    api.report.get(domainId)
      .then(r => {
        setReport(r.data);
        setShareUrl(`${window.location.origin}/report/share/${r.data.shareToken}`);
        setLoading(false);
      })
      .catch(() => generateAndSave());
  }, [domainId, shareToken]);

  const generateAndSave = async () => {
    if (!domainId) return;
    setSaving(true);
    try {
      const dbCompleted = profile.completedLevels[domainId] || [];
      const payload     = computeReport(domainId, dbCompleted);
      const r           = await api.report.generate(payload);
      setReport(r.data);
      setShareUrl(`${window.location.origin}/report/share/${r.data.shareToken}`);
    } catch {
      setError('Failed to generate report');
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading || saving) return (
    // fixed overlay so main nav is completely hidden during load too
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          style={{ borderColor: theme?.primary || '#4169e1' }} />
        <p className="text-gray-400 text-sm">
          {saving ? 'Generating your report…' : 'Loading report…'}
        </p>
      </div>
    </div>
  );

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.history.back()}
          className="text-blue-400 hover:underline text-sm">
          ← Go back
        </button>
      </div>
    </div>
  );

  if (!report) return null;

  const data           = report.reportData ?? report;
  const radarChartData = radarData(data.subLevelBreakdown);
  const reportTheme    = DOMAIN_THEMES[data.domainId] || theme;
  const generatedDate  = new Date(data.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      {/*
        ── KEY CHANGE: fixed inset-0 z-[200] overflow-y-auto
           This makes the report a true full-screen overlay that sits
           ABOVE the main ChipVerse navbar (which is typically z-50).
           The user sees ONLY the report — no main nav bleeding through.
      */}
      <div
        className="fixed inset-0 z-[200] overflow-y-auto bg-black relative"
        ref={reportRef}
      >
        <CircuitBackground />

        {/* ── Top bar — Back button only (Share/Download moved to bottom) ── */}
        <div className="no-print fixed top-4 left-4 right-4 z-[210] flex items-center justify-between pointer-events-none">
          <button
            onClick={() => window.history.back()}
            className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-black/70 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-all backdrop-blur-md">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Refresh stays at top — it's a utility action, not a CTA */}
          {!shareToken && (
            <button
              onClick={generateAndSave}
              className="pointer-events-auto px-4 py-2 rounded-xl bg-black/70 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-all backdrop-blur-md">
              Refresh
            </button>
          )}
        </div>

        <div className="max-w-4xl mx-auto px-4 pt-20 pb-16 relative z-10">

          {/* ── Certificate header ── */}
          <div className="rounded-3xl overflow-hidden mb-6 border"
            style={{ borderColor: reportTheme?.border, background: `linear-gradient(135deg, ${reportTheme?.card}, rgba(0,0,0,0.9))` }}>
            <div className="h-2" style={{ background: reportTheme?.gradient }} />
            <div className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ background: reportTheme?.gradient }}>
                  <Trophy className="w-10 h-10 text-black" />
                </div>
              </div>
              <p className="text-xs font-mono uppercase tracking-widest mb-2"
                style={{ color: reportTheme?.primary }}>
                ChipVerse · Skill Report
              </p>
              <h1 className="text-3xl font-black text-white font-['Orbitron'] mb-1">
                {data.domainName}
              </h1>
              <p className="text-gray-400 text-sm mb-6">
                {data.userName || user.name} · Generated {generatedDate}
              </p>

              {/* Completion ring */}
              <div className="flex justify-center mb-6">
                <div className="relative w-28 h-28">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff10" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none"
                      stroke={reportTheme?.primary} strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${data.completionPercentage * 2.639} 263.9`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white font-mono">{data.completionPercentage}%</span>
                    <span className="text-xs text-gray-400">complete</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: <Zap className="w-5 h-5" style={{ color: reportTheme?.primary }} />, value: data.totalXpEarned.toLocaleString(), label: 'XP Earned' },
                  { icon: <CheckCircle2 className="w-5 h-5 text-green-400" />,                 value: `${data.levelsCompleted}/${data.totalLevels}`,    label: 'Levels Done' },
                  { icon: <Star className="w-5 h-5 text-yellow-400" />,                        value: data.badgesEarned.length,                         label: 'Badges' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                    <div className="flex justify-center mb-2">{s.icon}</div>
                    <div className="text-xl font-bold text-white font-mono">{s.value}</div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Radar + Breakdown ── */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <h2 className="text-white font-bold font-['Orbitron'] text-sm uppercase tracking-wider mb-4">
                Skill Radar
              </h2>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarChartData}>
                  <PolarGrid stroke="#ffffff15" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 9 }} />
                  <Radar name="Score" dataKey="score"
                    stroke={reportTheme?.primary} fill={reportTheme?.primary}
                    fillOpacity={0.25} strokeWidth={2} />
                  <Tooltip
                    formatter={(v: any) => [`${v}%`, 'Score']}
                    contentStyle={{ background: '#111', border: `1px solid ${reportTheme?.border}`, borderRadius: 8, color: '#fff', fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <h2 className="text-white font-bold font-['Orbitron'] text-sm uppercase tracking-wider mb-4">
                Sublevel Breakdown
              </h2>
              <div className="space-y-4">
                {Object.entries(data.subLevelBreakdown).map(([type, v]: any) => {
                  const pct  = v.total ? Math.round((v.completed / v.total) * 100) : 0;
                  const Icon = typeIcon[type] || Star;
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5" style={{ color: reportTheme?.primary }} />
                          <span className="text-gray-300 text-xs capitalize font-medium">{type}</span>
                        </div>
                        <span className="text-xs font-mono font-bold" style={{ color: reportTheme?.primary }}>
                          {v.completed}/{v.total}
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: reportTheme?.gradient }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Strengths & Improvements ── */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-black/40 border border-green-500/20 rounded-2xl p-6 backdrop-blur-md">
              <h2 className="text-green-400 font-bold font-['Orbitron'] text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Strengths
              </h2>
              <ul className="space-y-2">
                {data.strengths.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green-400 mt-0.5">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-black/40 border border-orange-500/20 rounded-2xl p-6 backdrop-blur-md">
              <h2 className="text-orange-400 font-bold font-['Orbitron'] text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <Flame className="w-4 h-4" /> Areas to Improve
              </h2>
              <ul className="space-y-2">
                {data.improvements.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-orange-400 mt-0.5">→</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Level progress ── */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md mb-6">
            <h2 className="text-white font-bold font-['Orbitron'] text-sm uppercase tracking-wider mb-5">
              Level Progress
            </h2>
            <div className="space-y-3">
              {data.levelDetails.map((l: any) => (
                <div key={l.levelId}
                  className="flex items-center gap-4 p-3 rounded-xl border transition-all"
                  style={{
                    borderColor: l.status === 'completed'   ? `${reportTheme?.primary}44`
                                : l.status === 'in_progress' ? '#f59e0b44' : '#ffffff0a',
                    background:  l.status === 'completed' ? reportTheme?.card : 'rgba(255,255,255,0.02)',
                  }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: statusColor(l.status) + '22', border: `2px solid ${statusColor(l.status)}` }}>
                    {l.status === 'completed'
                      ? <CheckCircle2 className="w-4 h-4" style={{ color: statusColor(l.status) }} />
                      : l.status === 'in_progress'
                      ? <Clock className="w-4 h-4" style={{ color: statusColor(l.status) }} />
                      : <span className="text-xs text-gray-600">{l.levelId}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{l.title}</div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-500">{l.subLevelsCompleted}/{l.totalSubLevels} sublevels</span>
                      {l.badge && l.status === 'completed' && (
                        <span className="text-xs text-yellow-400 flex items-center gap-1">
                          <Award className="w-3 h-3" /> {l.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-mono font-bold" style={{ color: reportTheme?.primary }}>
                      +{l.xpEarned} XP
                    </div>
                    <div className="text-xs capitalize mt-0.5" style={{ color: statusColor(l.status) }}>
                      {l.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Badges ── */}
          {data.badgesEarned.length > 0 && (
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md mb-6">
              <h2 className="text-white font-bold font-['Orbitron'] text-sm uppercase tracking-wider mb-4">
                Badges Earned
              </h2>
              <div className="flex flex-wrap gap-3">
                {data.badgesEarned.map((badge: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl border"
                    style={{ background: reportTheme?.card, borderColor: reportTheme?.border }}>
                    <Award className="w-4 h-4" style={{ color: reportTheme?.primary }} />
                    <span className="text-sm font-semibold" style={{ color: reportTheme?.primary }}>{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/*
            ── BOTTOM CTA — Share & Download ──────────────────────────────────
            Only shown when NOT viewing a shared report (shareToken view is
            read-only for external users who may not have an account).
            Hidden on print so the PDF stays clean.
          */}
          {!shareToken && (
            <div className="no-print rounded-3xl overflow-hidden mb-6 border border-white/10"
              style={{ background: `linear-gradient(135deg, ${reportTheme?.card}, rgba(0,0,0,0.95))` }}>
              {/* Accent line at top */}
              <div className="h-px" style={{ background: reportTheme?.gradient }} />

              <div className="p-8 text-center">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: reportTheme?.gradient + '22', border: `1px solid ${reportTheme?.border}` }}>
                    <Trophy className="w-7 h-7" style={{ color: reportTheme?.primary }} />
                  </div>
                </div>

                <h3 className="text-white font-black font-['Orbitron'] text-lg mb-1">
                  Share Your Progress
                </h3>
                <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto">
                  Let the world see your {data.domainName} skills. Download a PDF or share a live link.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  {/* Share link button */}
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-200 text-sm font-semibold hover:bg-white/10 transition-all w-full sm:w-auto justify-center">
                    {copied
                      ? <><Check className="w-4 h-4 text-green-400" /> Link Copied!</>
                      : <><Share2 className="w-4 h-4" /> Copy Share Link</>
                    }
                  </button>

                  {/* Download PDF button */}
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all w-full sm:w-auto justify-center"
                    style={{ background: reportTheme?.gradient, color: '#000' }}>
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>

                {shareUrl && (
                  <p className="text-gray-600 text-xs mt-5 font-mono break-all max-w-sm mx-auto">
                    {shareUrl}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Footer ── */}
          <div className="text-center text-gray-600 text-xs font-mono">
            ChipVerse · chipverse.app · Generated {generatedDate}
          </div>
        </div>
      </div>
    </>
  );
}