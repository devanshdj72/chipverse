import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { Timer, Zap, Loader2, CheckCircle, Wifi, WifiOff, AlertCircle } from "lucide-react";
import { useUser } from "@/lib/user";
import api from "@/lib/api";
import { DOMAIN_THEMES } from "@/lib/themes";

type Question = { id: number; q: string; options: string[]; answer?: number };

export default function BattleRoom() {
  const { battleId } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useUser();

  const [battle, setBattle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<"waiting" | "countdown" | "battle" | "submitted" | "result" | "error">("waiting");
  const [countdown, setCountdown] = useState(3);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // LIVE mode state
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);
  const questionStartRef = useRef<number>(Date.now());
  const scoreRef = useRef(0);

  // OFFLINE mode state
  const [offlineAnswers, setOfflineAnswers] = useState<(number | null)[]>([]);

  const [submitted, setSubmitted] = useState(false);

  // ── Refs ──
  const mountedRef = useRef(true);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // battleRef keeps polling closure in sync with latest battle state
  // without this, polling captures stale battle from initial render
  const battleRef = useRef<any>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Keep battleRef in sync whenever battle state changes
  useEffect(() => {
    battleRef.current = battle;
  }, [battle]);

  useEffect(() => { if (battleId) loadBattle(); }, [battleId]);

  const loadBattle = async () => {
    try {
      const res = await api.battles.get(battleId!);
      if (!mountedRef.current) return;
      setBattle(res.data);
      if (res.data.status === "ACTIVE")    setPhase("countdown");
      if (res.data.status === "COMPLETED") setPhase("result");
    } catch (err) {
      console.error("loadBattle error:", err);
      if (mountedRef.current) setPhase("error");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  // Init offline answers once questions load
  useEffect(() => {
    if (battle?.questions?.length) {
      setOfflineAnswers(new Array(battle.questions.length).fill(null));
    }
  }, [battle?.questions?.length]);

  // ── Countdown ──
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      setPhase("battle");
      questionStartRef.current = Date.now();
      return;
    }
    const t = setTimeout(() => {
      if (mountedRef.current) setCountdown(c => c - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [countdown, phase]);

  // ── LIVE per-question timer ──
  useEffect(() => {
    if (phase !== "battle" || !battle || battle.mode !== "LIVE" || showAnswer) return;
    if (timeLeft <= 0) {
      handleLiveSelect(-1);
      return;
    }
    const t = setTimeout(() => {
      if (mountedRef.current) setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase, showAnswer, battle]);

  // ── Safe battle data with fallbacks ──
  const questions: Question[] = battle?.questions ?? [];
  const question = questions[current] ?? null;
  const isLive = battle?.mode === "LIVE";

  const isChallenger = battle?.challenger?.id === user?.id;
  const me       = (isChallenger ? battle?.challenger : battle?.opponent) ?? { id: "", name: "You" };
  const opponent = (isChallenger ? battle?.opponent   : battle?.challenger) ?? { id: "", name: "Opponent" };

  // Display scores — hide sentinel -1 value
  const rawMyScore  = isChallenger ? battle?.challengerXp : battle?.opponentXp;
  const rawOppScore = isChallenger ? battle?.opponentXp   : battle?.challengerXp;
  const myFinalScore  = rawMyScore  === -1 || rawMyScore  == null ? "—" : rawMyScore;
  const oppFinalScore = rawOppScore === -1 || rawOppScore == null ? "—" : rawOppScore;

  const won    = battle?.winnerId != null && battle?.winnerId === user?.id;
  const isDraw = battle?.status === "COMPLETED" && battle?.winnerId == null;

  // ── LIVE: select answer ──
  const handleLiveSelect = useCallback((idx: number) => {
    if (showAnswer || !battle) return;
    const timeTaken = Date.now() - questionStartRef.current;
    setTotalTimeTaken(prev => prev + timeTaken);
    setSelected(idx);
    setShowAnswer(true);
    // Only count as correct if a valid option was chosen (not timeout = -1)
    if (idx !== -1 && question?.answer !== undefined && idx === question.answer) {
      scoreRef.current += 1;
    } else if (idx !== -1 && question?.answer === undefined) {
      // No answer field in LIVE mode (stripped server-side) — count attempt
      scoreRef.current += 1;
    }
  }, [showAnswer, battle, question]);

  // ── LIVE: next question or finish ──
  const handleLiveNext = async () => {
    const isLast = current + 1 >= questions.length;
    if (isLast) {
      await submitFinalScore(scoreRef.current, totalTimeTaken);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setShowAnswer(false);
      setTimeLeft(15);
      questionStartRef.current = Date.now();
    }
  };

  // ── OFFLINE: select an answer ──
  const handleOfflineSelect = (qIdx: number, optIdx: number) => {
    setOfflineAnswers(prev => {
      const next = [...prev];
      next[qIdx] = optIdx;
      return next;
    });
  };

  // ── OFFLINE: calculate correct answers then submit ──
  const handleOfflineSubmit = async () => {
    if (submitted) return;
    let correct = 0;
    questions.forEach((q, idx) => {
      const userAnswer = offlineAnswers[idx];
      if (userAnswer === null) return;
      if (q.answer !== undefined) {
        // answer field present — check if correct
        if (userAnswer === q.answer) correct++;
      }
      // If answer field not present, don't count (shouldn't happen in OFFLINE mode)
    });
    await submitFinalScore(correct, 0);
  };

  // ── Core submit function ──
  const submitFinalScore = async (finalScore: number, timeTakenMs: number) => {
    if (submitted) return;
    setSubmitted(true);
    setSubmitError(null);
    setPhase("submitted");

    try {
      const res = await api.battles.submitScore(battleId!, finalScore, timeTakenMs);
      if (!mountedRef.current) return;

      // Safely merge — backend returns partial battle when only one player submitted
      // Use battleRef.current (not battle) to avoid stale closure
      const currentBattle = battleRef.current;
      const updatedBattle = {
        ...currentBattle,
        ...res.data,
        challenger: res.data?.challenger ?? currentBattle?.challenger,
        opponent:   res.data?.opponent   ?? currentBattle?.opponent,
      };

      setBattle(updatedBattle);

      if (res.data?.status === "COMPLETED") {
        setPhase("result");
      } else {
        // Other player hasn't submitted yet — poll until they do
        startPolling();
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      if (!mountedRef.current) return;

      const msg = err?.message ?? "Submission failed";

      // If score was already submitted, just start polling for the result
      if (msg.includes("already submitted")) {
        startPolling();
        return;
      }

      // For any other error — show error state, NOT result
      // Showing result with no data causes the "You Lost" bug
      setSubmitted(false); // allow retry
      setPhase("battle");  // go back to battle so user can retry
      setSubmitError(msg);
    }
  };

  // ── Poll until opponent submits ──
  const startPolling = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      if (!mountedRef.current) {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        return;
      }
      try {
        const res = await api.battles.get(battleId!);
        if (!mountedRef.current) return;

        if (res.data?.status === "COMPLETED") {
          // Use battleRef.current — NOT battle from closure (stale)
          const currentBattle = battleRef.current;
          const updatedBattle = {
            ...currentBattle,
            ...res.data,
            challenger: res.data?.challenger ?? currentBattle?.challenger,
            opponent:   res.data?.opponent   ?? currentBattle?.opponent,
          };
          setBattle(updatedBattle);
          setPhase("result");
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
      } catch {
        // Silent fail — keep polling
      }
    }, 3000);

    // Stop polling after 10 minutes
    setTimeout(() => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }, 10 * 60 * 1000);
  };

  const timerColor = timeLeft <= 5 ? "#ef4444" : timeLeft <= 10 ? "#f59e0b" : "#a855f7";
  const timerPct   = (timeLeft / 15) * 100;
  const theme      = DOMAIN_THEMES[battle?.domainId] ?? DOMAIN_THEMES.rtl;

  const ModeBadge = () => (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
      isLive
        ? "bg-red-500/15 border-red-500/40 text-red-400"
        : "bg-blue-500/15 border-blue-500/40 text-blue-400"
    }`}>
      {isLive ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
      {isLive ? "LIVE — Speed Matters" : "OFFLINE — Accuracy Matters"}
    </div>
  );

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
    </div>
  );

  // ── Battle not found ──
  if (!battle) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      Battle not found
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {/* ── Waiting for opponent to accept ── */}
        {phase === "waiting" && (
          <div className="bg-gray-950 border border-purple-500/50 rounded-2xl p-8 text-center space-y-4">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-white">Waiting for opponent...</h2>
            <p className="text-gray-400">
              Battle will start once <span className="text-white font-bold">{opponent.name}</span> accepts
            </p>
            <ModeBadge />
          </div>
        )}

        {/* ── Error state ── */}
        {phase === "error" && (
          <div className="bg-gray-950 border border-red-500/50 rounded-2xl p-8 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Something went wrong</h2>
            <p className="text-gray-400">Could not load battle. Please try again.</p>
            <button
              onClick={() => { setPhase("waiting"); loadBattle(); }}
              className="px-6 py-2 rounded-xl bg-purple-600 text-white font-bold text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Countdown ── */}
        {phase === "countdown" && (
          <div className="bg-gray-950 border border-purple-500/50 rounded-2xl p-8 text-center space-y-6"
            style={{ boxShadow: `0 0 60px ${theme.glow}` }}>
            <ModeBadge />
            <div className="text-gray-400 text-sm font-mono uppercase tracking-widest">
              Battle Starting
            </div>
            <div className="text-9xl font-bold font-['Orbitron']"
              style={{ color: theme.primary }}>
              {countdown || "⚔️"}
            </div>
            <div className="flex justify-center items-center gap-12">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-purple-600/30 border-2 border-purple-500 flex items-center justify-center text-white font-bold text-xl mx-auto mb-2">
                  {me.name?.charAt(0) ?? "?"}
                </div>
                <div className="text-white text-sm font-bold">You</div>
              </div>
              <div className="text-purple-400 font-bold text-2xl font-['Orbitron']">VS</div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-red-600/30 border-2 border-red-500 flex items-center justify-center text-white font-bold text-xl mx-auto mb-2">
                  {opponent.name?.charAt(0) ?? "?"}
                </div>
                <div className="text-white text-sm font-bold">{opponent.name}</div>
              </div>
            </div>
            {isLive && (
              <p className="text-yellow-400 text-sm">⚡ Answer fast — speed breaks ties!</p>
            )}
          </div>
        )}

        {/* ── LIVE Battle ── */}
        {phase === "battle" && isLive && question && (
          <div className="bg-gray-950 border rounded-2xl overflow-hidden"
            style={{ borderColor: theme.primary, boxShadow: `0 0 40px ${theme.glow}` }}>

            {/* Timer bar */}
            <div className="h-1.5 bg-white/10">
              <div className="h-full transition-all duration-1000 ease-linear"
                style={{ width: `${timerPct}%`, background: timerColor }} />
            </div>

            <div className="p-5 space-y-4">
              {submitError && (
                <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {submitError} — please try submitting again.
                </div>
              )}

              <div className="flex items-center justify-between">
                <ModeBadge />
                <div className="flex items-center gap-2 px-3 py-1 rounded-full border"
                  style={{ borderColor: timerColor, color: timerColor }}>
                  <Timer className="w-3.5 h-3.5" />
                  <span className="font-mono font-bold text-sm">{timeLeft}s</span>
                </div>
                <span className="text-xs text-gray-500">Q{current + 1}/{questions.length}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-green-400 font-mono font-bold">
                  Score: {scoreRef.current}/{questions.length}
                </span>
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-500 font-mono">Bet: {battle.betXp} XP</span>
              </div>

              <div className="p-4 rounded-xl bg-black/60 border border-white/10">
                <p className="text-white font-medium leading-relaxed">{question.q}</p>
              </div>

              <div className="space-y-2">
                {question.options.map((opt: string, idx: number) => {
                  let cls = "border-white/10 bg-white/5 text-gray-300 hover:border-purple-500/50 hover:bg-purple-500/5 cursor-pointer";
                  if (showAnswer) {
                    cls = idx === selected
                      ? "border-blue-500/70 bg-blue-500/15 text-blue-200"
                      : "border-white/5 bg-black/30 text-gray-600 opacity-40 cursor-default";
                  }
                  return (
                    <button key={idx} onClick={() => handleLiveSelect(idx)} disabled={showAnswer}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${cls}`}>
                      <span className="font-bold mr-2 text-purple-400">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {showAnswer && (
                <button onClick={handleLiveNext}
                  className="w-full py-3 rounded-xl font-bold text-black text-sm"
                  style={{ background: theme.gradient }}>
                  {current + 1 < questions.length ? "Next Question →" : "Finish & Submit"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── OFFLINE Battle ── */}
        {phase === "battle" && !isLive && (
          <div className="bg-gray-950 border rounded-2xl overflow-hidden"
            style={{ borderColor: theme.primary, boxShadow: `0 0 40px ${theme.glow}` }}>
            <div className="p-5 space-y-5">

              {submitError && (
                <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {submitError} — please try submitting again.
                </div>
              )}

              <div className="flex items-center justify-between">
                <ModeBadge />
                <span className="text-xs text-gray-500">
                  {offlineAnswers.filter(a => a !== null).length}/{questions.length} answered
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-white font-bold">vs {opponent.name}</span>
                <span className="text-gray-500 font-mono">
                  Bet: <span className="text-yellow-400">{battle.betXp} XP</span>
                </span>
              </div>

              {/* All questions */}
              <div className="space-y-6">
                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-xs text-purple-400 font-bold mt-0.5">
                        {qIdx + 1}
                      </span>
                      <p className="text-white font-medium leading-relaxed">{q.q}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 pl-9">
                      {q.options.map((opt: string, oIdx: number) => {
                        const isSel = offlineAnswers[qIdx] === oIdx;
                        return (
                          <button key={oIdx} onClick={() => handleOfflineSelect(qIdx, oIdx)}
                            className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${
                              isSel
                                ? "border-purple-500 bg-purple-500/20 text-white"
                                : "border-white/10 bg-white/5 text-gray-300 hover:border-purple-500/40 hover:bg-purple-500/5"
                            }`}>
                            <span className={`font-bold mr-2 ${isSel ? "text-purple-300" : "text-purple-500"}`}>
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit button */}
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500">
                    {offlineAnswers.filter(a => a !== null).length < questions.length
                      ? `${questions.length - offlineAnswers.filter(a => a !== null).length} unanswered`
                      : "✓ All answered"}
                  </span>
                  <span className="text-xs text-blue-400">No timer — take your time</span>
                </div>
                <button onClick={handleOfflineSubmit} disabled={submitted}
                  className="w-full py-3 rounded-xl font-bold text-black text-sm disabled:opacity-50"
                  style={{ background: theme.gradient }}>
                  {submitted ? "Submitting..." : "Submit Answers"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Submitted — waiting for opponent ── */}
        {phase === "submitted" && (
          <div className="bg-gray-950 border border-purple-500/50 rounded-2xl p-8 text-center space-y-5"
            style={{ boxShadow: `0 0 40px ${theme.glow}` }}>
            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Answers Submitted!</h2>
              <p className="text-gray-400 text-sm">
                Waiting for <span className="text-white font-bold">{opponent.name}</span> to finish...
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-purple-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Checking every 3 seconds...</span>
            </div>
            <p className="text-xs text-gray-600">
              Result will appear automatically once {opponent.name} submits their answers.
            </p>
            <ModeBadge />
          </div>
        )}

        {/* ── Result ── */}
        {phase === "result" && (
          <div className="bg-gray-950 border border-purple-500/50 rounded-2xl p-8 text-center space-y-5"
            style={{ boxShadow: `0 0 60px ${theme.glow}` }}>

            <div className="text-7xl">
              {isDraw ? "🤝" : won ? "🏆" : "💀"}
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white font-['Orbitron'] mb-2">
                {isDraw ? "It's a Draw!" : won ? "You Won!" : "You Lost!"}
              </h2>
              <p className="text-gray-400">
                {isDraw
                  ? "No XP transferred — equal skill!"
                  : won
                  ? `+${battle.betXp} XP added to your account!`
                  : `-${battle.betXp} XP deducted`}
              </p>
            </div>

            <ModeBadge />

            {/* Score comparison */}
            <div className="grid grid-cols-3 gap-3 items-center">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="text-2xl font-bold font-mono" style={{ color: theme.primary }}>
                  {myFinalScore}
                </div>
                <div className="text-xs text-gray-500 mt-1">Your Score</div>
                {isLive && (
                  <div className="text-xs text-purple-400 mt-1 font-mono">
                    {(((isChallenger ? battle.challengerTime : battle.opponentTime) ?? 0) / 1000).toFixed(1)}s
                  </div>
                )}
              </div>

              <div className="text-gray-600 text-sm font-bold">VS</div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="text-2xl font-bold text-white font-mono">
                  {oppFinalScore}
                </div>
                <div className="text-xs text-gray-500 mt-1">{opponent.name}</div>
                {isLive && (
                  <div className="text-xs text-purple-400 mt-1 font-mono">
                    {(((isChallenger ? battle.opponentTime : battle.challengerTime) ?? 0) / 1000).toFixed(1)}s
                  </div>
                )}
              </div>
            </div>

            {isLive && !isDraw && rawMyScore === rawOppScore && (
              <p className="text-xs text-yellow-400">⚡ Decided by speed tiebreaker</p>
            )}

            <div className="flex gap-3">
              <button onClick={() => setLocation("/battlefield")}
                className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 text-sm font-bold">
                ← Battlefield
              </button>
              <button onClick={() => setLocation("/leaderboard")}
                className="flex-1 py-3 rounded-xl font-bold text-black text-sm"
                style={{ background: theme.gradient }}>
                Leaderboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}