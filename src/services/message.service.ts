import { db } from "@/lib/db";

export async function getConversations(userId: string) {
  return db.conversation.findMany({
    where: { participants: { some: { userId } } },
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      participants: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
      campaign: { select: { id: true, title: true } },
    },
  });
}

export async function getConversationById(id: string, userId: string) {
  return db.conversation.findFirst({
    where: {
      id,
      participants: { some: { userId } },
    },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, image: true, role: true } },
        },
      },
      campaign: { select: { id: true, title: true } },
    },
  });
}

export async function getOrCreateConversation(
  userAId: string,
  userBId: string,
  campaignId?: string,
) {
  // Find existing conversation between these two users for this campaign
  const existing = await db.conversation.findFirst({
    where: {
      ...(campaignId ? { campaignId } : {}),
      participants: { some: { userId: userAId } },
      AND: [{ participants: { some: { userId: userBId } } }],
    },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
    },
  });

  if (existing) return existing;

  return db.conversation.create({
    data: {
      ...(campaignId ? { campaignId } : {}),
      participants: {
        create: [{ userId: userAId }, { userId: userBId }],
      },
    },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
    },
  });
}

export async function getMessages(conversationId: string, limit = 50) {
  return db.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: limit,
    include: {
      sender: { select: { id: true, name: true, image: true } },
    },
  });
}

export async function saveMessage(data: {
  conversationId: string;
  senderId: string;
  content: string;
  fileUrl?: string;
}) {
  const [message] = await db.$transaction([
    db.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        content: data.content,
        fileUrl: data.fileUrl,
      },
    }),
    db.conversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);
  return message;
}

export async function markConversationRead(conversationId: string, userId: string) {
  return db.conversationParticipant.updateMany({
    where: { conversationId, userId },
    data: { lastReadAt: new Date() },
  });
}
