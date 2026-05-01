import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Minimize2, Maximize2, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserContext } from "@/lib/user";

interface Message {
  role: "user" | "assistant";
  content: string;
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

  // Simple markdown-like rendering
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
      // Handle bold **text**
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
      <div
        className={cn(
          "max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
          isUser
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-white/8 text-gray-100 rounded-bl-sm border border-white/10"
        )}
      >
        {renderContent(msg.content)}
      </div>
    </div>
  );
}

export default function AIAssistant() {
  const { isAuthenticated } = useUserContext();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm **ChipBot** 🤖 — your VLSI AI assistant.\n\nAsk me anything about RTL, Physical Design, Verification, FPGA, Analog IC, DFT, or semiconductor careers!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);


  useEffect(() => {
    if (open) {
      setHasNewMessage(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const userMsg: Message = { role: "user", content: content.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...newMessages.map((m) => ({ role: m.role, content: m.content })),
          ],
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (!res.ok) throw new Error(`Groq API error: ${res.status}`);

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response. Please try again.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

      // Show badge on bubble if chat is closed
      if (!open) setHasNewMessage(true);

    } catch (err) {
      console.error("ChipBot error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. Please check your internet connection and try again.",
        },
      ]);
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

  const handleSuggestion = (s: string) => {
    sendMessage(s);
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hi! I'm **ChipBot** 🤖 — your VLSI AI assistant.\n\nAsk me anything about RTL, Physical Design, Verification, FPGA, Analog IC, DFT, or semiconductor careers!",
      },
    ]);
  };

  // Must be after all hooks — no early returns above this line
  if (!isAuthenticated) return null;

  return (
    <>
      {/* ── Floating bubble button ── */}
      <button
        onClick={() => { setOpen((v) => !v); setHasNewMessage(false); }}
        style={{
          position: "fixed",
          bottom: "24px",
          left: "24px",
          zIndex: 9998,
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #2563eb, #7c3aed)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 24px rgba(37,99,235,0.5), 0 4px 16px rgba(0,0,0,0.4)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 0 32px rgba(37,99,235,0.7), 0 4px 20px rgba(0,0,0,0.5)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(37,99,235,0.5), 0 4px 16px rgba(0,0,0,0.4)";
        }}
      >
        {open ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <Cpu className="w-5 h-5 text-white" />
        )}
        {/* New message badge */}
        {hasNewMessage && !open && (
          <span style={{
            position: "absolute", top: "-2px", right: "-2px",
            width: "14px", height: "14px", borderRadius: "50%",
            background: "#ef4444", border: "2px solid #000",
          }} />
        )}
      </button>

      {/* Tooltip */}
      {!open && (
        <div style={{
          position: "fixed", bottom: "82px", left: "24px", zIndex: 9997,
          background: "rgba(10,10,20,0.95)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "8px", padding: "5px 10px",
          color: "#ccc", fontSize: "11px", fontWeight: 600,
          pointerEvents: "none", whiteSpace: "nowrap",
          opacity: 0,
          animation: "none",
        }}
          className="chipbot-tooltip"
        >
          Ask ChipBot 🤖
        </div>
      )}

      {/* ── Chat window ── */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "88px",
            left: "24px",
            zIndex: 9998,
            width: "clamp(300px, 90vw, 380px)",
            height: minimized ? "52px" : "clamp(400px, 70vh, 560px)",
            background: "rgba(8,8,18,0.97)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 0 40px rgba(37,99,235,0.15), 0 20px 60px rgba(0,0,0,0.6)",
            transition: "height 0.3s ease",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "14px 16px",
            borderBottom: minimized ? "none" : "1px solid rgba(255,255,255,0.07)",
            background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))",
            flexShrink: 0,
          }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "linear-gradient(135deg,#2563eb,#7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 0 12px rgba(37,99,235,0.4)",
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
              <button
                onClick={clearChat}
                title="Clear chat"
                style={{ padding: "4px", borderRadius: "6px", background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "10px" }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#aaa"}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "#666"}
              >
                🗑
              </button>
              <button
                onClick={() => setMinimized((v) => !v)}
                style={{ padding: "4px", borderRadius: "6px", background: "none", border: "none", color: "#666", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#aaa"}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "#666"}
              >
                {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{ padding: "4px", borderRadius: "6px", background: "none", border: "none", color: "#666", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#aaa"}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "#666"}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 8px", scrollbarWidth: "thin" }}>

                {messages.map((msg, i) => (
                  <MessageBubble key={i} msg={msg} />
                ))}

                {loading && <TypingIndicator />}
                <div ref={bottomRef} />
              </div>

              {/* Suggestions — only show when only greeting exists */}
              {messages.length === 1 && !loading && (
                <div style={{ padding: "0 14px 8px" }}>
                  <div style={{ color: "#555", fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                    Suggested questions
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSuggestion(s)}
                        style={{
                          padding: "4px 9px", borderRadius: "999px", fontSize: "10.5px",
                          background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.25)",
                          color: "#93c5fd", cursor: "pointer", transition: "all 0.2s",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.2)";
                          (e.currentTarget as HTMLElement).style.borderColor = "rgba(37,99,235,0.5)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.1)";
                          (e.currentTarget as HTMLElement).style.borderColor = "rgba(37,99,235,0.25)";
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div style={{
                padding: "10px 14px 14px",
                borderTop: "1px solid rgba(255,255,255,0.07)",
                flexShrink: 0,
              }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about VLSI, careers, concepts..."
                    disabled={loading}
                    style={{
                      flex: 1, background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "14px", padding: "10px 14px",
                      color: "#fff", fontSize: "13px", resize: "none",
                      outline: "none", maxHeight: "100px",
                      fontFamily: "inherit", lineHeight: 1.5,
                      opacity: loading ? 0.5 : 1,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(37,99,235,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading}
                    style={{
                      width: "38px", height: "38px", borderRadius: "12px",
                      background: input.trim() && !loading
                        ? "linear-gradient(135deg,#2563eb,#7c3aed)"
                        : "rgba(255,255,255,0.06)",
                      border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "all 0.2s",
                      boxShadow: input.trim() && !loading ? "0 0 14px rgba(37,99,235,0.4)" : "none",
                    }}
                  >
                    {loading
                      ? <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      : <Send className="w-4 h-4 text-white" />
                    }
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