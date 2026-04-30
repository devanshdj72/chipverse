import prisma from '../config/prisma';
import { getRandomQuestions } from '../data/battleQuestions';
import { createNotification } from './notification.service';

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
  if (betXp < 10)  throw new Error('Minimum bet is 10 XP');
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

  const battle = await prisma.battle.create({
    data: {
      challengerId,
      opponentId,
      domainId,
      betXp,
      mode,
      questions: questions as any,
      expiresAt,
      challengerXp: -1,
      opponentXp:   -1,
      challengerTime: 0,
      opponentTime:   0,
    },
    include: {
      challenger: { select: { id: true, name: true, avatarUrl: true } },
      opponent:   { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  // 🔔 Notify opponent of incoming battle challenge
  await createNotification({
    userId:  opponentId,
    type:    'battle_challenge',
    title:   'Battle Challenge!',
    message: `${battle.challenger.name} challenged you to a ${mode} battle for ${betXp} XP`,
    data:    {
      battleId:        battle.id,
      challengerId,
      challengerName:  battle.challenger.name,
      betXp,
      mode,
    },
  });

  return battle;
};

// ─── Accept / Decline Battle ──────────────────────────────────────────────────
export const respondToBattle = async (
  battleId: string,
  userId: string,
  action: 'accept' | 'decline'
) => {
  const battle = await prisma.battle.findUnique({
    where: { id: battleId },
    include: {
      challenger: { select: { id: true, name: true } },
      opponent:   { select: { id: true, name: true } },
    },
  });
  if (!battle) throw new Error('Battle not found');
  if (battle.opponentId !== userId) throw new Error('Not authorized');
  if (battle.status !== 'PENDING') throw new Error('Battle is no longer pending');
  if (battle.expiresAt < new Date()) throw new Error('Battle invitation expired');

  if (action === 'decline') {
    // 🔔 Notify challenger their challenge was declined
    await createNotification({
      userId:  battle.challengerId,
      type:    'battle_result',
      title:   'Battle Declined',
      message: `${battle.opponent.name} declined your battle challenge`,
      data:    { battleId },
    });

    return prisma.battle.update({
      where: { id: battleId },
      data:  { status: 'DECLINED' },
    });
  }

  // 🔔 Notify challenger their challenge was accepted
  await createNotification({
    userId:  battle.challengerId,
    type:    'battle_accepted',
    title:   'Battle Accepted!',
    message: `${battle.opponent.name} accepted your battle challenge. Get ready!`,
    data:    { battleId, mode: battle.mode },
  });

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

  const clampedScore  = Math.max(0, Math.min(5, Math.round(score)));
  const isChallenger  = battle.challengerId === userId;

  const alreadySubmitted = isChallenger
    ? battle.challengerXp !== -1
    : battle.opponentXp   !== -1;
  if (alreadySubmitted) throw new Error('Score already submitted');

  const updateData = isChallenger
    ? { challengerXp: clampedScore, challengerTime: timeTakenMs }
    : { opponentXp:   clampedScore, opponentTime:   timeTakenMs };

  const updated = await prisma.battle.update({
    where: { id: battleId },
    data:  updateData,
  });

  const challengerDone = isChallenger ? true : updated.challengerXp !== -1;
  const opponentDone   = !isChallenger ? true : updated.opponentXp  !== -1;

  if (challengerDone && opponentDone) {
    return completeBattle(battleId, updated);
  }

  return updated;
};

// ─── Complete Battle & Transfer XP ───────────────────────────────────────────
const completeBattle = async (battleId: string, battle: any) => {
  let winnerId: string | null = null;
  let isDraw = false;

  const cScore = battle.challengerXp;
  const oScore = battle.opponentXp;

  if (cScore > oScore) {
    winnerId = battle.challengerId;
  } else if (oScore > cScore) {
    winnerId = battle.opponentId;
  } else {
    if (
      battle.challengerTime > 0 &&
      battle.opponentTime   > 0 &&
      battle.challengerTime !== battle.opponentTime
    ) {
      winnerId = battle.challengerTime < battle.opponentTime
        ? battle.challengerId
        : battle.opponentId;
    } else {
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
        status:      'COMPLETED',
        winnerId:    isDraw ? null : winnerId,
        completedAt: new Date(),
      },
    });

    if (!isDraw && winnerId && loserId) {
      await tx.userProfile.update({
        where: { userId: winnerId },
        data: {
          xp:         { increment: battle.betXp },
          battlesWon: { increment: 1 },
        },
      });

      const loserProfile = await tx.userProfile.findUnique({
        where: { userId: loserId },
      });
      const xpToDeduct = Math.min(battle.betXp, loserProfile?.xp ?? 0);
      await tx.userProfile.update({
        where: { userId: loserId },
        data: {
          xp:          { decrement: xpToDeduct },
          battlesLost: { increment: 1 },
        },
      });
    }
  });

  // Fetch final battle with player names for notifications
  const completed = await prisma.battle.findUnique({
    where: { id: battleId },
    include: {
      challenger: { select: { id: true, name: true, avatarUrl: true } },
      opponent:   { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  if (!completed) return completed;

  // 🔔 Notify both players of the result
  const buildResultMessage = (recipientId: string) => {
    if (isDraw) return `Your battle ended in a draw! No XP lost or gained.`;
    if (winnerId === recipientId)
      return `You won! +${battle.betXp} XP gained.`;
    return `You lost. -${battle.betXp} XP deducted.`;
  };

  const buildResultTitle = (recipientId: string) => {
    if (isDraw) return `Battle Result: Draw 🤝`;
    if (winnerId === recipientId) return `Battle Result: You Won! 🏆`;
    return `Battle Result: You Lost 💀`;
  };

  await Promise.all([
    createNotification({
      userId:  battle.challengerId,
      type:    'battle_result',
      title:   buildResultTitle(battle.challengerId),
      message: buildResultMessage(battle.challengerId),
      data: {
        battleId,
        isDraw,
        won:      winnerId === battle.challengerId,
        xpChange: isDraw ? 0
          : winnerId === battle.challengerId ? battle.betXp : -battle.betXp,
      },
    }),
    createNotification({
      userId:  battle.opponentId,
      type:    'battle_result',
      title:   buildResultTitle(battle.opponentId),
      message: buildResultMessage(battle.opponentId),
      data: {
        battleId,
        isDraw,
        won:      winnerId === battle.opponentId,
        xpChange: isDraw ? 0
          : winnerId === battle.opponentId ? battle.betXp : -battle.betXp,
      },
    }),
  ]);

  return completed;
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
      const sanitized = questions.map(({ answer: _a, ...q }) => q);
      return { ...battle, questions: sanitized };
    }
    return { ...battle, questions };
  }

  return battle;
};