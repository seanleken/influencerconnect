"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendMessageSchema } from "@/schemas/message";
import {
  saveMessage,
  getConversationById,
  getOrCreateConversation,
} from "@/services/message.service";
import { pusherServer } from "@/lib/pusher-server";

export async function sendMessage(formData: unknown) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const result = sendMessageSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { conversationId, content, fileUrl } = result.data;

  const conversation = await getConversationById(conversationId, session.user.id);
  if (!conversation) return { success: false, error: "Conversation not found" };

  const message = await saveMessage({
    conversationId,
    senderId: session.user.id,
    content,
    fileUrl,
  });

  // Push to all subscribers of this conversation
  await pusherServer.trigger(`conversation-${conversationId}`, "new-message", {
    id: message.id,
    content: message.content,
    senderId: message.senderId,
    senderName: session.user.name ?? "Unknown",
    createdAt: message.createdAt.toISOString(),
    fileUrl: message.fileUrl ?? null,
  });

  // Notify other participants
  const others = conversation.participants.filter((p) => p.userId !== session.user.id);
  await Promise.all(
    others.map((p) =>
      pusherServer.trigger(`user-${p.userId}-notifications`, "new-notification", {
        type: "NEW_MESSAGE",
        title: `New message from ${session.user.name}`,
        conversationId,
      }),
    ),
  );

  revalidatePath("/messages");
  return { success: true };
}

export async function startConversation(otherUserId: string, campaignId?: string) {
  const session = await auth();
  if (!session?.user) return { success: false as const, error: "Unauthorized" };

  const conversation = await getOrCreateConversation(
    session.user.id,
    otherUserId,
    campaignId,
  );

  revalidatePath("/messages");
  return { success: true as const, conversationId: conversation.id };
}

