import prisma from '../config/prisma';

// ─── Send Friend Request ──────────────────────────────────────────────────────
export const sendFriendRequest = async (senderId: string, receiverId: string) => {
  if (senderId === receiverId) throw new Error('Cannot add yourself as a friend');

  // Check already friends
  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userAId: senderId, userBId: receiverId },
        { userAId: receiverId, userBId: senderId },
      ],
    },
  });
  if (existing) throw new Error('Already friends');

  // Check pending request
  const pending = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
      status: 'PENDING',
    },
  });
  if (pending) throw new Error('Friend request already pending');

  return prisma.friendRequest.create({
    data: { senderId, receiverId },
    include: {
      receiver: { select: { id: true, name: true, avatarUrl: true } },
    },
  });
};

// ─── Respond to Friend Request ────────────────────────────────────────────────
export const respondToFriendRequest = async (
  requestId: string,
  userId: string,
  action: 'accept' | 'reject'
) => {
  const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new Error('Request not found');
  if (request.receiverId !== userId) throw new Error('Not authorized');
  if (request.status !== 'PENDING') throw new Error('Request already handled');

  if (action === 'accept') {
    await prisma.$transaction([
      prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      }),
      prisma.friendship.create({
        data: { userAId: request.senderId, userBId: request.receiverId },
      }),
    ]);
    return { accepted: true };
  } else {
    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });
    return { accepted: false };
  }
};

// ─── Unfriend ─────────────────────────────────────────────────────────────────
export const unfriend = async (userId: string, friendId: string) => {
  await prisma.friendship.deleteMany({
    where: {
      OR: [
        { userAId: userId, userBId: friendId },
        { userAId: friendId, userBId: userId },
      ],
    },
  });
  return { success: true };
};

// ─── Get Friends List ─────────────────────────────────────────────────────────
export const getFriends = async (userId: string) => {
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    include: {
      userA: { select: { id: true, name: true, avatarUrl: true } },
      userB: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  const friendIds = friendships.map((f: any) =>
    f.userAId === userId ? f.userBId : f.userAId
  );

  const profiles = await prisma.userProfile.findMany({
    where: { userId: { in: friendIds } },
    select: { userId: true, xp: true, streak: true, rank: true, currentDomain: true },
  });

  const profileMap = new Map(profiles.map((p: any) => [p.userId, p]));

  return friendships.map((f: any) => {
    const friend = f.userAId === userId ? f.userB : f.userA;
    const profile = profileMap.get(friend.id);
    return {
      id: friend.id,
      name: friend.name,
      avatarUrl: friend.avatarUrl,
      xp: profile?.xp ?? 0,
      streak: profile?.streak ?? 0,
      rank: profile?.rank ?? 'RTL Beginner',
      currentDomain: profile?.currentDomain ?? 'rtl',
      friendshipId: f.id,
    };
  });
};

// ─── Get Pending Requests ─────────────────────────────────────────────────────
export const getPendingRequests = async (userId: string) => {
  return prisma.friendRequest.findMany({
    where: { receiverId: userId, status: 'PENDING' },
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

// ─── Search Users ─────────────────────────────────────────────────────────────
export const searchUsers = async (query: string, currentUserId: string) => {
  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: currentUserId } },
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
      ],
    },
    select: { id: true, name: true, avatarUrl: true, email: true },
    take: 10,
  });

  // Get friendship statuses
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ userAId: currentUserId }, { userBId: currentUserId }],
    },
  });
  const friendIds = new Set(
    friendships.map((f: any) => (f.userAId === currentUserId ? f.userBId : f.userAId))
  );

  const pendingRequests = await prisma.friendRequest.findMany({
    where: {
      OR: [
        { senderId: currentUserId, status: 'PENDING' },
        { receiverId: currentUserId, status: 'PENDING' },
      ],
    },
  });

  return users.map((u: any) => ({
    ...u,
    isFriend: friendIds.has(u.id),
    requestPending: pendingRequests.some(
      (r: any) =>
        (r.senderId === currentUserId && r.receiverId === u.id) ||
        (r.senderId === u.id && r.receiverId === currentUserId)
    ),
  }));
};

// ─── Friends Leaderboard ──────────────────────────────────────────────────────
export const getFriendsLeaderboard = async (userId: string) => {
  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
  });

  const friendIds = friendships.map((f: any) =>
    f.userAId === userId ? f.userBId : f.userAId
  );

  // ✅ Always include self — even if no friends yet
  const allIds = [...new Set([userId, ...friendIds])];

  const profiles = await prisma.userProfile.findMany({
    where: { userId: { in: allIds } },
    orderBy: { xp: 'desc' },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  // ✅ If your profile doesn't exist yet in userProfile, still show you
  const profileUserIds = profiles.map((p: any) => p.userId);
  const missingIds = allIds.filter(id => !profileUserIds.includes(id));

  if (missingIds.length > 0) {
    const missingUsers = await prisma.user.findMany({
      where: { id: { in: missingIds } },
      select: { id: true, name: true, avatarUrl: true },
    });
    for (const u of missingUsers) {
      profiles.push({
        userId: u.id,
        xp: 0,
        streak: 0,
        rank: 'RTL Beginner',
        battlesWon: 0,
        battlesLost: 0,
        user: u,
      } as any);
    }
    // Re-sort after adding missing
    profiles.sort((a: any, b: any) => b.xp - a.xp);
  }

  return profiles.map((p: any, i: number) => ({
    rank: i + 1,
    userId: p.userId,
    name: p.user.name,
    avatarUrl: p.user.avatarUrl,
    xp: p.xp,
    streak: p.streak,
    rank_title: p.rank,
    battlesWon: p.battlesWon,
    battlesLost: p.battlesLost,
    isMe: p.userId === userId,   // ✅ flags YOUR row so frontend can highlight it
  }));
};
// ─── Get Sent Requests (I am the sender) ─────────────────────────────────────
export const getSentRequests = async (userId: string) => {
  return prisma.friendRequest.findMany({
    where: { senderId: userId, status: 'PENDING' },
    include: {
      receiver: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};
