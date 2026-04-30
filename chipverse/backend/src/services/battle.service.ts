import prisma from '../config/prisma';
import { getRandomQuestions } from '../data/battleQuestions';

// ─── Create Battle Challenge ───────────────────────────────────────────────────
export const createBattle = async (
  challengerId: string,
  opponentId: string,
  domainId: string,
  betXp: number,
  mode: 'LIVE' | 'OFFLINE' = 'OFFLINE'
) => {
  if (challengerId === opponentId) throw new Error('Cannot battle yourself');

  const profile = await prisma.userProfile.findUnique({ where: { userId: challengerId } });
  if (!profile || profile.xp < betXp) throw new Error('Not enough XP to place this bet');
  if (betXp < 10) throw new Error('Minimum bet is 10 XP');
  if (betXp > 500) throw new Error('Maximum bet is 500 XP');

  const existing = await prisma.battle.findFirst({
    where: {
      OR: [
        { challengerId, opponentId },
        { challengerId: opponentId, opponentId: challengerId },
      ],
      status: { in: ['PENDING', 'ACTIVE'] },
    },
  });
  if (existing) throw new Error('A battle is already pending or active between you');

  const questions = getRandomQuestions(domainId, 5);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // challengerXp / opponentXp start at -1 = "not yet submitted" sentinel
  return prisma.battle.create({
    data: {
      challengerId,
      opponentId,
      domainId,
      betXp,
      mode,
      questions: questions as any,
      expiresAt,
      challengerXp: -1,
      opponentXp: -1,
      challengerTime: 0,
      opponentTime: 0,
    },
    include: {
      challenger: { select: { id: true, name: true, avatarUrl: true } },
      opponent:   { select: { id: true, name: true, avatarUrl: true } },
    },
  });
};

// ─── Accept / Decline Battle ──────────────────────────────────────────────────
export const respondToBattle = async (
  battleId: string,
  userId: string,
  action: 'accept' | 'decline'
) => {
  const battle = await prisma.battle.findUnique({ where: { id: battleId } });
  if (!battle) throw new Error('Battle not found');
  if (battle.opponentId !== userId) throw new Error('Not authorized');
  if (battle.status !== 'PENDING') throw new Error('Battle is no longer pending');
  if (battle.expiresAt < new Date()) throw new Error('Battle invitation expired');

  if (action === 'decline') {
    return prisma.battle.update({
      where: { id: battleId },
      data: { status: 'DECLINED' },
    });
  }

  // ✅ NO XP check on accept — opponent can always accept a challenge.
  // If they lose, their XP is floored at 0 (never goes negative).
  // Only the challenger needs enough XP to send the challenge.
  return prisma.battle.update({
    where: { id: battleId },
    data: { status: 'ACTIVE', startedAt: new Date() },
    include: {
      challenger: { select: { id: true, name: true, avatarUrl: true } },
      opponent:   { select: { id: true, name: true, avatarUrl: true } },
    },
  });
};

// ─── Submit Battle Score ──────────────────────────────────────────────────────
// score       = number of CORRECT answers (0–5), counted on frontend
// timeTakenMs = total ms taken across all questions (LIVE tiebreaker only)
//
// KEY DESIGN:
// - We use -1 as sentinel meaning "not yet submitted"
// - score === 0 is a valid submission (all answers wrong)
// - "trust current submitter" guard: the person calling this function is
//   DEFINITELY done — only check the DB for the OTHER player.
//   This prevents old DB rows with challengerXp=0 from false-triggering completeBattle.
export const submitBattleScore = async (
  battleId: string,
  userId: string,
  score: number,
  timeTakenMs: number = 0
) => {
  const battle = await prisma.battle.findUnique({ where: { id: battleId } });
  if (!battle) throw new Error('Battle not found');
  if (battle.status !== 'ACTIVE') throw new Error('Battle is not active');
  if (battle.challengerId !== userId && battle.opponentId !== userId)
    throw new Error('Not a participant');

  // Clamp score to valid range 0–5
  const clampedScore = Math.max(0, Math.min(5, Math.round(score)));
  const isChallenger = battle.challengerId === userId;

  // Check if THIS player already submitted (moved away from -1 sentinel)
  const alreadySubmitted = isChallenger
    ? battle.challengerXp !== -1
    : battle.opponentXp !== -1;

  if (alreadySubmitted) throw new Error('Score already submitted');

  const updateData = isChallenger
    ? { challengerXp: clampedScore, challengerTime: timeTakenMs }
    : { opponentXp: clampedScore,   opponentTime: timeTakenMs };

  const updated = await prisma.battle.update({
    where: { id: battleId },
    data: updateData,
  });

  // ✅ TRUST CURRENT SUBMITTER GUARD:
  // The person who just called this is DEFINITELY done — don't check DB for them.
  // Only check DB for the OTHER player.
  // This prevents old battles with DB default 0 from false-triggering completeBattle.
  const challengerDone = isChallenger
    ? true                           // I just submitted as challenger — I am done
    : updated.challengerXp !== -1;  // check if challenger submitted before me

  const opponentDone = !isChallenger
    ? true                           // I just submitted as opponent — I am done
    : updated.opponentXp !== -1;   // check if opponent submitted before me

  if (challengerDone && opponentDone) {
    return completeBattle(battleId, updated);
  }

  // One player submitted — waiting for the other
  return updated;
};

// ─── Complete Battle & Transfer XP ───────────────────────────────────────────
const completeBattle = async (battleId: string, battle: any) => {
  let winnerId: string | null = null;
  let isDraw = false;

  const cScore = battle.challengerXp; // correct answers 0–5
  const oScore = battle.opponentXp;   // correct answers 0–5

  if (cScore > oScore) {
    winnerId = battle.challengerId;
  } else if (oScore > cScore) {
    winnerId = battle.opponentId;
  } else {
    // Equal scores — tiebreaker by time (LIVE mode: lower time = faster = wins)
    if (
      battle.challengerTime > 0 &&
      battle.opponentTime > 0 &&
      battle.challengerTime !== battle.opponentTime
    ) {
      winnerId = battle.challengerTime < battle.opponentTime
        ? battle.challengerId
        : battle.opponentId;
    } else {
      // Genuine draw
      isDraw = true;
    }
  }

  const loserId = winnerId
    ? (winnerId === battle.challengerId ? battle.opponentId : battle.challengerId)
    : null;

  await prisma.$transaction(async (tx: any) => {
    await tx.battle.update({
      where: { id: battleId },
      data: {
        status: 'COMPLETED',
        winnerId: isDraw ? null : winnerId,
        completedAt: new Date(),
      },
    });

    if (!isDraw && winnerId && loserId) {
      // Winner gets full betXp
      await tx.userProfile.update({
        where: { userId: winnerId },
        data: {
          xp: { increment: battle.betXp },
          battlesWon: { increment: 1 },
        },
      });

      // ✅ Floor loser XP at 0 — fetch current XP first, deduct only what they have
      const loserProfile = await tx.userProfile.findUnique({
        where: { userId: loserId },
      });
      const xpToDeduct = Math.min(battle.betXp, loserProfile?.xp ?? 0);
      await tx.userProfile.update({
        where: { userId: loserId },
        data: {
          xp: { decrement: xpToDeduct },
          battlesLost: { increment: 1 },
        },
      });
    }
    // On draw: no XP transfer, no stat changes
  });

  return prisma.battle.findUnique({
    where: { id: battleId },
    include: {
      challenger: { select: { id: true, name: true, avatarUrl: true } },
      opponent:   { select: { id: true, name: true, avatarUrl: true } },
    },
  });
};

// ─── Get User Battles ─────────────────────────────────────────────────────────
export const getUserBattles = async (userId: string) => {
  return prisma.battle.findMany({
    where: {
      OR: [{ challengerId: userId }, { opponentId: userId }],
      status: { in: ['PENDING', 'ACTIVE', 'COMPLETED', 'DECLINED'] },
    },
    include: {
      challenger: { select: { id: true, name: true, avatarUrl: true } },
      opponent:   { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
};

// ─── Get Battle by ID ─────────────────────────────────────────────────────────
export const getBattleById = async (battleId: string, userId: string) => {
  const battle = await prisma.battle.findUnique({
    where: { id: battleId },
    include: {
      challenger: { select: { id: true, name: true, avatarUrl: true } },
      opponent:   { select: { id: true, name: true, avatarUrl: true } },
    },
  });
  if (!battle) throw new Error('Battle not found');
  if (battle.challengerId !== userId && battle.opponentId !== userId)
    throw new Error('Not authorized');

  if (battle.status === 'ACTIVE') {
    const questions = battle.questions as any[];

    if (battle.mode === 'LIVE') {
      // LIVE mode: strip answer field so players can't cheat by inspecting response
      const sanitized = questions.map(({ answer: _a, ...q }) => q);
      return { ...battle, questions: sanitized };
    }
    // OFFLINE mode: keep answer field so frontend can calculate correct score
    return { ...battle, questions };
  }

  return battle;
};