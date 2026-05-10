import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Loader2, Minimize2, Maximize2, Cpu, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserContext } from "@/lib/user";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Credits {
  used:      number;
  remaining: number;
  total:     number;
}

const SYSTEM_PROMPT = `You are ChipBot — an expert AI assistant for ChipVerse, the world's best VLSI and semiconductor learning platform.

You help students and engineers with:
- RTL Design (Verilog, SystemVerilog, VHDL)
- Physical Design (floorplanning, placement, routing, STA)
- Verification (UVM, SystemVerilog assertions, coverage)
- Analog IC Design (amplifiers, PLLs, ADCs, DACs)
- FPGA Design (Xilinx Vivado, Intel Quartus, HLS)
- Embedded Systems (RTOS, bare-metal, Linux BSP)
- DFT (scan insertion, ATPG, MBIST, JTAG)
- Semiconductor Research (FinFET, GAA, TCAD, AI accelerators)
- Career guidance for VLSI jobs at Intel, Qualcomm, NVIDIA, TSMC, MediaTek, AMD

Personality:
- Friendly, encouraging, and technically precise
- Use simple analogies for complex concepts
- Give practical examples with code snippets when helpful
- Keep responses concise but complete
- Use bullet points for lists
- Always encourage the learner

If asked something outside VLSI/semiconductors/electronics, politely redirect back to your expertise.

Format code snippets with proper markdown code blocks.`;

const SUGGESTIONS = [
  "How do I avoid latches in Verilog?",
  "What is setup and hold time?",
  "Explain UVM testbench architecture",
  "How to get a job at Qualcomm?",
  "What is Clock Tree Synthesis?",
  "Difference between FPGA and ASIC?",
];

// ── Base URL — points to Railway in prod, local backend in dev ────────────────
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');

// ── Credits bar component ─────────────────────────────────────────────────────
function CreditsBar({ credits }: { credits: Credits | null }) {
  if (!credits) return null;

  const pct      = (credits.remaining / credits.total) * 100;
  const isEmpty  = credits.remaining === 0;
  const isLow    = credits.remaining <= Math.ceil(credits.total * 0.25);
  const isMedium = credits.remaining <= Math.ceil(credits.total * 0.5);

  const barColor = isEmpty  ? '#ef4444'
                 : isLow    ? '#f97316'
                 : isMedium ? '#eab308'
                 :            '#4ade80';

  const label = isEmpty
    ? 'Credits reset at midnight UTC'
    : `${credits.remaining} / ${credits.total} credits today`;

  return (
    <div style={{ padding: '6px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Zap style={{ width: '10px', height: '10px', color: barColor }} />
          <span style={{ fontSize: '9.5px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Daily Credits
          </span>
        </div>
        <span style={{
          fontSize: '9.5px', fontFamily: 'monospace',
          color: isEmpty ? '#ef4444' : isLow ? '#f97316' : '#666',
          fontWeight: isLow ? 700 : 400,
        }}>
          {label}
        </span>
      </div>

      <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: isEmpty ? '#374151' : `linear-gradient(90deg, ${barColor}99, ${barColor})`,
          borderRadius: '999px',
          transition: 'width 0.5s ease, background 0.3s ease',
          boxShadow: isEmpty ? 'none' : `0 0 6px ${barColor}66`,
        }} />
      </div>

      {isLow && !isEmpty && (
        <p style={{ fontSize: '9px', color: '#f97316', marginTop: '4px', textAlign: 'right' }}>
          ⚠ Running low — use credits wisely
        </p>
      )}
      {isEmpty && (
        <p style={{ fontSize: '9px', color: '#ef4444', marginTop: '4px', textAlign: 'right' }}>
          ✕ No credits left — resets at midnight UTC
        </p>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="bg-white/8 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  const renderContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const code = part.slice(3, -3).replace(/^\w+\n/, "");
        return (
          <pre key={i} className="bg-black/50 border border-white/10 rounded-lg p-3 mt-2 mb-2 overflow-x-auto text-xs text-green-300 font-mono whitespace-pre-wrap">
            {code}
          </pre>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={i} className="bg-black/40 text-blue-300 px-1.5 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
      }
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i}>
          {boldParts.map((bp, j) => {
            if (bp.startsWith("**") && bp.endsWith("**")) {
              return <strong key={j} className="text-white font-semibold">{bp.slice(2, -2)}</strong>;
            }
            return <span key={j}>{bp}</span>;
          })}
        </span>
      );
    });
  };

  return (
    <div className={cn("flex mb-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
          <Cpu className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className={cn(
        "max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
        isUser
          ? "bg-blue-600 text-white rounded-br-sm"
          : "bg-white/8 text-gray-100 rounded-bl-sm border border-white/10"
      )}>
        {renderContent(msg.content)}
      </div>
    </div>
  );
}

export default function AIAssistant() {
  const { isAuthenticated } = useUserContext();
  const [open,          setOpen]          = useState(false);
  const [minimized,     setMinimized]     = useState(false);
  const [messages,      setMessages]      = useState<Message[]>([{
    role: "assistant",
    content: "Hi! I'm **ChipBot** 🤖 — your VLSI AI assistant.\n\nAsk me anything about RTL, Physical Design, Verification, FPGA, Analog IC, DFT, or semiconductor careers!",
  }]);
  const [input,         setInput]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [credits,       setCredits]       = useState<Credits | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  // ── Drag state ──────────────────────────────────────────────────────────────
  const [pos,      setPos]      = useState({ right: 24, bottom: 24 });
  const dragging   = useRef(false);
  const hasDragged = useRef(false);
  const dragStart  = useRef({ mouseX: 0, mouseY: 0, right: 24, bottom: 24 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current   = true;
    hasDragged.current = false;
    dragStart.current  = { mouseX: e.clientX, mouseY: e.clientY, right: pos.right, bottom: pos.bottom };
    e.preventDefault();
  }, [pos]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    dragging.current   = true;
    hasDragged.current = false;
    const t = e.touches[0];
    dragStart.current  = { mouseX: t.clientX, mouseY: t.clientY, right: pos.right, bottom: pos.bottom };
  }, [pos]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      hasDragged.current = true;
      const dx = e.clientX - dragStart.current.mouseX;
      const dy = e.clientY - dragStart.current.mouseY;
      setPos({
        right:  Math.max(8, Math.min(dragStart.current.right  - dx, window.innerWidth  - 60)),
        bottom: Math.max(8, Math.min(dragStart.current.bottom - dy, window.innerHeight - 60)),
      });
    };
    const onMouseUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   onMouseUp);
    };
  }, []);

  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      hasDragged.current = true;
      const t  = e.touches[0];
      const dx = t.clientX - dragStart.current.mouseX;
      const dy = t.clientY - dragStart.current.mouseY;
      setPos({
        right:  Math.max(8, Math.min(dragStart.current.right  - dx, window.innerWidth  - 60)),
        bottom: Math.max(8, Math.min(dragStart.current.bottom - dy, window.innerHeight - 60)),
      });
    };
    const onTouchEnd = () => { dragging.current = false; };
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend",  onTouchEnd);
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend",  onTouchEnd);
    };
  }, []);
  // ────────────────────────────────────────────────────────────────────────────

  // ── Fetch credits when chat opens ───────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setHasNewMessage(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    setTimeout(() => inputRef.current?.focus(), 200);

    fetch(`${API_BASE}/api/chipbot/credits`)
      .then(r => r.json())
      .then(data => setCredits(data))
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    if (credits && credits.remaining <= 0) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "❌ **No credits left!** Your daily ChipBot credits have been used up. They reset automatically at **midnight UTC**. Come back tomorrow!",
      }]);
      return;
    }

    const userMsg: Message = { role: "user", content: content.trim() };
    const newMessages      = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chipbot/chat`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...newMessages.map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      const data = await res.json();

      if (data.credits) setCredits(data.credits);

      if (res.status === 429 && data.error === 'NO_CREDITS') {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "❌ **No credits left!** You've used all your daily ChipBot credits. They reset at **midnight UTC**. Come back tomorrow! 🌙",
        }]);
        return;
      }

      if (res.status === 503 && data.error === 'GROQ_BUSY') {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "⏳ **AI is busy right now.** Your credit was **not used** — please try again in a few seconds!",
        }]);
        return;
      }

      if (!res.ok) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Sorry, something went wrong. Your credit was not used — please try again.",
        }]);
        return;
      }

      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      if (!open) setHasNewMessage(true);

    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please check your internet connection and try again.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: "Hi! I'm **ChipBot** 🤖 — your VLSI AI assistant.\n\nAsk me anything about RTL, Physical Design, Verification, FPGA, Analog IC, DFT, or semiconductor careers!",
    }]);
  };

  if (!isAuthenticated) return null;

  // ── Smart chat window positioning ────────────────────────────────────────────
  const CHAT_W = 380;
  const CHAT_H = 560;
  const BTN    = 52;

  const btnLeft  = window.innerWidth  - pos.right  - BTN;
  const btnTop   = window.innerHeight - pos.bottom - BTN;
  const openRight = (window.innerWidth - btnLeft - BTN) >= CHAT_W || (window.innerWidth - btnLeft - BTN) >= btnLeft;
  const openUp    = btnTop >= CHAT_H || btnTop >= (window.innerHeight - btnTop - BTN);

  const chatStyle: React.CSSProperties = {
    position: "fixed",
    zIndex:   9998,
    width:    `clamp(300px, 90vw, ${CHAT_W}px)`,
    height:   minimized ? "52px" : `clamp(400px, 70vh, ${CHAT_H}px)`,
    ...(openRight
      ? { left:  `${Math.min(btnLeft, window.innerWidth - CHAT_W - 8)}px` }
      : { right: `${Math.min(pos.right, window.innerWidth - CHAT_W - 8)}px` }),
    ...(openUp
      ? { bottom: `${pos.bottom + BTN + 12}px` }
      : { top:    `${Math.min(btnTop + BTN + 12, window.innerHeight - CHAT_H - 8)}px` }),
  };

  const outOfCredits = credits ? credits.remaining <= 0 : false;

  return (
    <>
      {/* ── Draggable floating button ── */}
      <button
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onClick={() => {
          if (!hasDragged.current) {
            setOpen(v => !v);
            setHasNewMessage(false);
          }
        }}
        style={{
          position: "fixed", bottom: `${pos.bottom}px`, right: `${pos.right}px`,
          zIndex: 9999, width: "52px", height: "52px", borderRadius: "50%",
          background: "linear-gradient(135deg, #2563eb, #7c3aed)",
          border: "none", cursor: "grab",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 24px rgba(37,99,235,0.5), 0 4px 16px rgba(0,0,0,0.4)",
          userSelect: "none", touchAction: "none",
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 0 32px rgba(37,99,235,0.7), 0 4px 20px rgba(0,0,0,0.5)"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(37,99,235,0.5), 0 4px 16px rgba(0,0,0,0.4)"}
      >
        {open ? <X className="w-5 h-5 text-white" /> : <Cpu className="w-5 h-5 text-white" />}
        {hasNewMessage && !open && (
          <span style={{
            position: "absolute", top: "-2px", right: "-2px",
            width: "14px", height: "14px", borderRadius: "50%",
            background: "#ef4444", border: "2px solid #000",
          }} />
        )}
      </button>

      {/* ── Chat window ── */}
      {open && (
        <div style={{
          ...chatStyle,
          background: "rgba(8,8,18,0.97)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px", display: "flex", flexDirection: "column",
          overflow: "hidden", boxShadow: "0 0 40px rgba(37,99,235,0.15), 0 20px 60px rgba(0,0,0,0.6)",
          transition: "height 0.3s ease", backdropFilter: "blur(20px)",
        }}>

          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px",
            borderBottom: minimized ? "none" : "1px solid rgba(255,255,255,0.07)",
            background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))",
            flexShrink: 0,
          }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "linear-gradient(135deg,#2563eb,#7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, boxShadow: "0 0 12px rgba(37,99,235,0.4)",
            }}>
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "13px" }}>ChipBot</div>
              <div style={{ color: "#4ade80", fontSize: "10px", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                Online · VLSI Expert
              </div>
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <button onClick={clearChat} title="Clear chat"
                style={{ padding: "4px", borderRadius: "6px", background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "10px" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#aaa"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#666"}
              >🗑</button>
              <button onClick={() => setMinimized(v => !v)}
                style={{ padding: "4px", borderRadius: "6px", background: "none", border: "none", color: "#666", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#aaa"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#666"}
              >
                {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => setOpen(false)}
                style={{ padding: "4px", borderRadius: "6px", background: "none", border: "none", color: "#666", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#aaa"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#666"}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Credits bar */}
              <CreditsBar credits={credits} />

              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 8px", scrollbarWidth: "thin" }}>
                {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
                {loading && <TypingIndicator />}
                <div ref={bottomRef} />
              </div>

              {/* Suggestions */}
              {messages.length === 1 && !loading && (
                <div style={{ padding: "0 14px 8px" }}>
                  <div style={{ color: "#555", fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                    Suggested questions
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                    {SUGGESTIONS.map(s => (
                      <button key={s} onClick={() => sendMessage(s)}
                        disabled={outOfCredits}
                        style={{
                          padding: "4px 9px", borderRadius: "999px", fontSize: "10.5px",
                          background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.25)",
                          color: outOfCredits ? "#444" : "#93c5fd",
                          cursor: outOfCredits ? "not-allowed" : "pointer",
                          transition: "all 0.2s", textAlign: "left",
                        }}
                        onMouseEnter={e => { if (!outOfCredits) (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.2)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.1)"; }}
                      >{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div style={{ padding: "10px 14px 14px", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                  <textarea
                    ref={inputRef} rows={1} value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={outOfCredits ? "No credits left — resets at midnight UTC" : "Ask about VLSI, careers, concepts..."}
                    disabled={loading || outOfCredits}
                    style={{
                      flex: 1, background: "rgba(255,255,255,0.05)",
                      border: `1px solid ${outOfCredits ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: "14px", padding: "10px 14px",
                      color: outOfCredits ? "#555" : "#fff",
                      fontSize: "13px", resize: "none", outline: "none", maxHeight: "100px",
                      fontFamily: "inherit", lineHeight: 1.5,
                      opacity: (loading || outOfCredits) ? 0.5 : 1,
                      cursor: outOfCredits ? "not-allowed" : "text",
                    }}
                    onFocus={e => { if (!outOfCredits) e.target.style.borderColor = "rgba(37,99,235,0.5)"; }}
                    onBlur={e => { e.target.style.borderColor = outOfCredits ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.1)"; }}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading || outOfCredits}
                    style={{
                      width: "38px", height: "38px", borderRadius: "12px",
                      background: (input.trim() && !loading && !outOfCredits)
                        ? "linear-gradient(135deg,#2563eb,#7c3aed)"
                        : "rgba(255,255,255,0.06)",
                      border: "none",
                      cursor: (input.trim() && !loading && !outOfCredits) ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "all 0.2s",
                      boxShadow: (input.trim() && !loading && !outOfCredits) ? "0 0 14px rgba(37,99,235,0.4)" : "none",
                    }}
                  >
                    {loading
                      ? <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      : <Send className="w-4 h-4 text-white" />}
                  </button>
                </div>
                <div style={{ color: "#333", fontSize: "9.5px", textAlign: "center", marginTop: "6px" }}>
                  Powered by Groq · Llama 3
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}