import prisma from '../config/prisma';
import { createNotification } from './notification.service';

// ─── Send Friend Request ──────────────────────────────────────────────────────
export const sendFriendRequest = async (senderId: string, receiverId: string) => {
  if (senderId === receiverId) throw new Error('Cannot add yourself as a friend');

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userAId: senderId, userBId: receiverId },
        { userAId: receiverId, userBId: senderId },
      ],
    },
  });
  if (existing) throw new Error('Already friends');

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

// Clean up any old ACCEPTED or REJECTED requests before creating new one
await prisma.friendRequest.deleteMany({
  where: {
    OR: [
      { senderId, receiverId, status: { in: ['ACCEPTED', 'REJECTED'] } },
      { senderId: receiverId, receiverId: senderId, status: { in: ['ACCEPTED', 'REJECTED'] } },
    ],
  },
});

return prisma.friendRequest.create({
    data: { senderId, receiverId },
    include: {
      sender:   { select: { id: true, name: true, avatarUrl: true } },
      receiver: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  // 🔔 Notify receiver of incoming friend request
  await createNotification({
    userId:  receiverId,
    type:    'friend_request',
    title:   'New Friend Request',
    message: `${request.sender.name} sent you a friend request`,
    data:    { requestId: request.id, senderId, senderName: request.sender.name },
  });

  return request;
};

// ─── Respond to Friend Request ────────────────────────────────────────────────
export const respondToFriendRequest = async (
  requestId: string,
  userId: string,
  action: 'accept' | 'reject'
) => {
  const request = await prisma.friendRequest.findUnique({
    where: { id: requestId },
    include: {
      sender:   { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
    },
  }) as any;

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

    // 🔔 Notify original sender that their request was accepted
    await createNotification({
      userId:  request.senderId,
      type:    'friend_accepted',
      title:   'Friend Request Accepted',
      message: `${request.receiver.name} accepted your friend request`,
      data:    { friendId: request.receiverId, friendName: request.receiver.name },
    });

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

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ userAId: currentUserId }, { userBId: currentUserId }],
    },
  });
  const friendIds = new Set(
    friendships.map((f: any) =>
      f.userAId === currentUserId ? f.userBId : f.userAId
    )
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

  const allIds = [...new Set([userId, ...friendIds])];

  const profiles = await prisma.userProfile.findMany({
    where: { userId: { in: allIds } },
    orderBy: { xp: 'desc' },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

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
    isMe: p.userId === userId,
  }));
};

// ─── Get Sent Requests ────────────────────────────────────────────────────────
export const getSentRequests = async (userId: string) => {
  return prisma.friendRequest.findMany({
    where: { senderId: userId, status: 'PENDING' },
    include: {
      receiver: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};