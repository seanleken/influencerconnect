import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  getConversationById,
  getMessages,
  markConversationRead,
} from "@/services/message.service";
import { ChatThread } from "@/components/messages/ChatThread";
import { AvatarWithFallback } from "@/components/shared/AvatarWithFallback";
import { ArrowLeft, Megaphone } from "lucide-react";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [conversation, dbMessages] = await Promise.all([
    getConversationById(conversationId, session.user.id),
    getMessages(conversationId),
  ]);

  if (!conversation) notFound();

  await markConversationRead(conversationId, session.user.id);

  const other = conversation.participants.find(
    (p) => p.userId !== session.user.id,
  );

  const initialMessages = dbMessages.map((m) => ({
    id: m.id,
    content: m.content,
    senderId: m.senderId,
    senderName: m.sender.name,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 py-4 border-b border-gray-200">
        <Link
          href="/messages"
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <AvatarWithFallback
          src={other?.user.image}
          name={other?.user.name ?? "User"}
          className="w-9 h-9"
        />
        <div className="min-w-0">
          <p className="text-body-sm font-semibold text-gray-950 truncate">
            {other?.user.name ?? "Unknown"}
          </p>
          {conversation.campaign && (
            <Link
              href={`/campaigns/${conversation.campaign.id}`}
              className="flex items-center gap-1 text-caption text-brand-600 hover:text-brand-700 truncate"
            >
              <Megaphone className="w-3 h-3" />
              {conversation.campaign.title}
            </Link>
          )}
        </div>
      </div>

      {/* Chat */}
      <ChatThread
        conversationId={conversationId}
        currentUserId={session.user.id}
        initialMessages={initialMessages}
      />
    </div>
  );
}
