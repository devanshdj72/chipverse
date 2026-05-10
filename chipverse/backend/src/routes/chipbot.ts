import { Router, Request, Response } from 'express';

const router = Router();

// ── Config (set CHIPBOT_DAILY_CREDITS in Railway env to override) ─────────────
const DAILY_CREDITS = parseInt(process.env.CHIPBOT_DAILY_CREDITS || '20', 10);

// ── In-memory credits store ───────────────────────────────────────────────────
// Key: userId   Value: { used: number, date: string "YYYY-MM-DD" UTC }
const creditsMap = new Map<string, { used: number; date: string }>();

function getTodayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function getCredits(userId: string): { used: number; remaining: number; total: number } {
  const today = getTodayUTC();
  const entry = creditsMap.get(userId);

  // New user OR day rolled over → reset
  if (!entry || entry.date !== today) {
    creditsMap.set(userId, { used: 0, date: today });
    return { used: 0, remaining: DAILY_CREDITS, total: DAILY_CREDITS };
  }

  return {
    used:      entry.used,
    remaining: Math.max(0, DAILY_CREDITS - entry.used),
    total:     DAILY_CREDITS,
  };
}

function consumeCredit(userId: string): void {
  const today   = getTodayUTC();
  const current = getCredits(userId);
  creditsMap.set(userId, { used: current.used + 1, date: today });
}

function refundCredit(userId: string): void {
  const entry = creditsMap.get(userId);
  if (entry && entry.used > 0) {
    creditsMap.set(userId, { ...entry, used: entry.used - 1 });
  }
}

// Purge stale entries every hour
setInterval(() => {
  const today = getTodayUTC();
  for (const [key, val] of creditsMap.entries()) {
    if (val.date !== today) creditsMap.delete(key);
  }
}, 60 * 60_000);
// ─────────────────────────────────────────────────────────────────────────────

function resolveUserId(req: Request): string {
  return (
    (req as any).user?.id?.toString() ||
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'anonymous'
  );
}

// ── GET /api/chipbot/credits ──────────────────────────────────────────────────
// Frontend calls this on chat open to show initial credits without spending one
router.get('/credits', (req: Request, res: Response) => {
  const userId = resolveUserId(req);
  return res.json(getCredits(userId));
});

// ── POST /api/chipbot/chat ────────────────────────────────────────────────────
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const userId  = resolveUserId(req);
    const credits = getCredits(userId);

    // ── Out of credits ──
    if (credits.remaining <= 0) {
      return res.status(429).json({
        error:   'NO_CREDITS',
        message: 'You have used all your daily ChipBot credits. Credits reset at midnight UTC.',
        credits: { used: credits.used, remaining: 0, total: DAILY_CREDITS },
      });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Consume credit before calling Groq
    consumeCredit(userId);

    // ── Forward to Groq ──
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:       'llama-3.3-70b-versatile',
        messages,
        max_tokens:  1024,
        temperature: 0.7,
      }),
    });

    // Groq rate limit — refund the credit, user didn't get a response
    if (groqRes.status === 429) {
      refundCredit(userId);
      return res.status(503).json({
        error:   'GROQ_BUSY',
        message: 'AI service is busy right now. Your credit was not used — please try again in a few seconds.',
        credits: getCredits(userId),
      });
    }

    if (!groqRes.ok) {
      refundCredit(userId);
      console.error('[ChipBot] Groq error:', groqRes.status);
      return res.status(502).json({
        error:   'GROQ_ERROR',
        message: 'AI service error. Your credit was not used. Please try again.',
        credits: getCredits(userId),
      });
    }

    const data  = await groqRes.json();
    const reply = (data as any).choices?.[0]?.message?.content ?? '';

    return res.json({ reply, credits: getCredits(userId) });

  } catch (err) {
    console.error('[ChipBot] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;