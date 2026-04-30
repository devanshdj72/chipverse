import prisma from '../config/prisma';

export const getOrCreateDM = async (userAId: string, userBId: string) => {
  // Find existing DM between these two users
  const existing = await prisma.conversation.findFirst({
    where: {
      isGroup: false,
      members: { every: { userId: { in: [userAId, userBId] } } },
      AND: [
        { members: { some: { userId: userAId } } },
        { members: { some: { userId: userBId } } },
      ],
    },
    include: {
      members: { include: { user: { select: { id: true, name: true } } } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { id: true, name: true } } },
      },
    },
  });

  if (existing) return existing;

  return prisma.conversation.create({
    data: {
      isGroup: false,
      members: {
        create: [{ userId: userAId }, { userId: userBId }],
      },
    },
    include: {
      members: { include: { user: { select: { id: true, name: true } } } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { id: true, name: true } } },
      },
    },
  });
};

export const createGroup = async (creatorId: string, name: string, memberIds: string[]) => {
  const allMembers = Array.from(new Set([creatorId, ...memberIds]));
  return prisma.conversation.create({
    data: {
      isGroup: true,
      name,
      members: {
        create: allMembers.map((uid) => ({ userId: uid })),
      },
    },
    include: {
      members: { include: { user: { select: { id: true, name: true } } } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { id: true, name: true } } },
      },
    },
  });
};

export const getUserConversations = async (userId: string) => {
  return prisma.conversation.findMany({
    where: { members: { some: { userId } } },
    include: {
      members: { include: { user: { select: { id: true, name: true } } } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { sender: { select: { id: true, name: true } } },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
};

export const getMessages = async (conversationId: string, userId: string) => {
  // Verify user is member
  const member = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!member) throw new Error('Not a member of this conversation');

  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    include: { sender: { select: { id: true, name: true } } },
  });
};

export const saveMessage = async (conversationId: string, senderId: string, content: string) => {
  const msg = await prisma.message.create({
    data: { conversationId, senderId, content },
    include: { sender: { select: { id: true, name: true } } },
  });

  // Update conversation updatedAt so it bubbles to top
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return msg;
};

export const addMemberToGroup = async (conversationId: string, requesterId: string, newUserId: string) => {
  // Verify conversation is a group and requester is member
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { members: true },
  });
  if (!conv || !conv.isGroup) throw new Error('Not a group');
  if (!conv.members.some((m) => m.userId === requesterId)) throw new Error('Not a member');

  return prisma.conversationMember.create({
    data: { conversationId, userId: newUserId },
  });
};