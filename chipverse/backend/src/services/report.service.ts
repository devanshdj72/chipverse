import prisma from '../config/prisma';

export interface SubLevelBreakdown {
  concept:     { completed: number; total: number };
  syntax:      { completed: number; total: number };
  walkthrough: { completed: number; total: number };
  lab:         { completed: number; total: number };
  quiz:        { completed: number; total: number };
}

export interface LevelDetail {
  levelId:             number;
  title:               string;
  status:              'completed' | 'in_progress' | 'not_started';
  xpEarned:            number;
  subLevelsCompleted:  number;
  totalSubLevels:      number;
  badge?:              string;
}

export interface ReportPayload {
  domainId:             string;
  domainName:           string;
  totalXpEarned:        number;
  levelsCompleted:      number;
  totalLevels:          number;
  subLevelsCompleted:   number;
  totalSubLevels:       number;
  completionPercentage: number;
  subLevelBreakdown:    SubLevelBreakdown;
  levelDetails:         LevelDetail[];
  badgesEarned:         string[];
  strengths:            string[];
  improvements:         string[];
}

// ── AI Analysis via Groq ──────────────────────────────────────────────────────
async function generateAIAnalysis(payload: ReportPayload, userName: string): Promise<{
  strengths: string[];
  improvements: string[];
  summary: string;
  nextSteps: string[];
  rating: number;
}> {
  const GROQ_KEY = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!GROQ_KEY) {
    return {
      strengths: ['Consistent learning progress', 'Good engagement with course material'],
      improvements: ['Complete more lab exercises', 'Focus on quiz performance'],
      summary: `${userName} has made solid progress in ${payload.domainName}.`,
      nextSteps: ['Continue with next level', 'Practice lab exercises'],
      rating: Math.round(payload.completionPercentage / 20),
    };
  }

  const breakdown = payload.subLevelBreakdown;
  const prompt = `You are an expert VLSI/semiconductor engineering mentor analyzing a student's learning report.

Student: ${userName}
Domain: ${payload.domainName}
Progress: ${payload.levelsCompleted}/${payload.totalLevels} levels (${payload.completionPercentage.toFixed(1)}%)
XP Earned: ${payload.totalXpEarned}
Sub-levels completed: ${payload.subLevelsCompleted}/${payload.totalSubLevels}

Sub-level breakdown:
- Concept reading: ${breakdown.concept.completed}/${breakdown.concept.total}
- Syntax study: ${breakdown.syntax.completed}/${breakdown.syntax.total}
- Walkthroughs: ${breakdown.walkthrough.completed}/${breakdown.walkthrough.total}
- Lab exercises: ${breakdown.lab.completed}/${breakdown.lab.total}
- Quizzes: ${breakdown.quiz.completed}/${breakdown.quiz.total}

Completed levels: ${payload.levelDetails.filter(l => l.status === 'completed').map(l => l.title).join(', ') || 'None yet'}
Badges earned: ${payload.badgesEarned.join(', ') || 'None yet'}

Provide a personalized, specific, actionable analysis in this exact JSON format (no markdown):
{
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "improvements": ["specific improvement 1", "specific improvement 2", "specific improvement 3"],
  "summary": "2-3 sentence personalized summary mentioning specific levels/topics",
  "nextSteps": ["concrete next step 1", "concrete next step 2", "concrete next step 3"],
  "rating": <number 1-5 based on progress>
}`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
    const data: any = await res.json();
    const text = data.choices?.[0]?.message?.content ?? '';
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error('[Report] AI analysis failed:', e);
    // Fallback based on actual data
    const pct = payload.completionPercentage;
    return {
      strengths: [
        pct > 50 ? `Strong completion rate of ${pct.toFixed(0)}% in ${payload.domainName}` : `Started ${payload.domainName} learning journey`,
        breakdown.lab.completed > 0 ? `Completed ${breakdown.lab.completed} hands-on lab exercises` : 'Good theoretical foundation',
        breakdown.quiz.completed > 0 ? `Passed ${breakdown.quiz.completed} assessments` : 'Engaged with course material',
      ],
      improvements: [
        breakdown.lab.completed < breakdown.lab.total ? `Complete remaining ${breakdown.lab.total - breakdown.lab.completed} lab exercises` : 'Explore advanced topics',
        breakdown.quiz.completed < breakdown.quiz.total ? `Attempt ${breakdown.quiz.total - breakdown.quiz.completed} remaining quizzes` : 'Review quiz answers for deeper understanding',
        payload.levelsCompleted < payload.totalLevels ? `Progress through ${payload.totalLevels - payload.levelsCompleted} remaining levels` : 'Apply knowledge in real projects',
      ],
      summary: `${userName} has completed ${payload.levelsCompleted} out of ${payload.totalLevels} levels in ${payload.domainName}, earning ${payload.totalXpEarned} XP. ${pct > 70 ? 'Excellent dedication to mastering this domain.' : pct > 40 ? 'Good progress with room to grow.' : 'Just getting started — keep going!'}`,
      nextSteps: [
        `Focus on completing ${payload.domainName} lab exercises for practical skills`,
        `Review concepts in levels with incomplete sub-levels`,
        `Challenge yourself with the BattleField to test your knowledge`,
      ],
      rating: Math.max(1, Math.min(5, Math.round(pct / 20))),
    };
  }
}

// ── Generate / Update report ──────────────────────────────────────────────────
export const generateReport = async (userId: string, payload: ReportPayload) => {
  const { domainId } = payload;

  const [user, profile] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, avatarUrl: true } }),
    prisma.userProfile.findUnique({ where: { userId }, select: { xp: true, streak: true, rank: true, battlesWon: true, battlesLost: true } }),
  ]);

  // Generate AI analysis
  const aiAnalysis = await generateAIAnalysis(payload, user?.name ?? 'Student');

  const fullReportData = {
    ...payload,
    // Override with AI-generated analysis
    strengths:    aiAnalysis.strengths,
    improvements: aiAnalysis.improvements,
    aiSummary:    aiAnalysis.summary,
    nextSteps:    aiAnalysis.nextSteps,
    aiRating:     aiAnalysis.rating,
    // User context
    userName:      user?.name ?? 'Unknown',
    userAvatarUrl: user?.avatarUrl ?? null,
    totalXp:       profile?.xp ?? 0,
    streak:        profile?.streak ?? 0,
    globalRank:    profile?.rank ?? 'RTL Beginner',
    battlesWon:    profile?.battlesWon ?? 0,
    battlesLost:   profile?.battlesLost ?? 0,
    generatedAt:   new Date().toISOString(),
  };

  const report = await prisma.domainReport.upsert({
    where:  { userId_domainId: { userId, domainId } },
    update: { reportData: fullReportData as any, updatedAt: new Date() },
    create: { userId, domainId, reportData: fullReportData as any },
  });

  return report;
};

export const getMyReport = async (userId: string, domainId: string) => {
  return prisma.domainReport.findUnique({ where: { userId_domainId: { userId, domainId } } });
};

export const getReportByToken = async (shareToken: string) => {
  return prisma.domainReport.findUnique({
    where: { shareToken },
    include: { user: { select: { name: true, avatarUrl: true } } },
  });
};
