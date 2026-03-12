import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getConversations } from "@/services/message.service";
import { EmptyState } from "@/components/shared/EmptyState";
import { AvatarWithFallback } from "@/components/shared/AvatarWithFallback";
import { MessageSquare } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { PageContainer } from "@/components/layout/PageContainer";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const conversations = await getConversations(session.user.id);

  return (
    <PageContainer>
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-h1 font-heading text-gray-950">Messages</h1>
        <p className="text-body text-gray-500 mt-1">Your conversations</p>
      </div>

      {conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          heading="No conversations yet"
          description="Start a conversation by messaging a company or influencer from a campaign page."
        />
      ) : (
        <div className="space-y-1">
          {conversations.map((convo) => {
            const other = convo.participants.find(
              (p) => p.userId !== session.user.id,
            );
            const lastMessage = convo.messages[0];
            const myParticipant = convo.participants.find(
              (p) => p.userId === session.user.id,
            );
            const hasUnread =
              lastMessage &&
              (!myParticipant?.lastReadAt ||
                new Date(lastMessage.createdAt) >
                  new Date(myParticipant.lastReadAt));

            return (
              <Link
                key={convo.id}
                href={`/messages/${convo.id}`}
                className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <AvatarWithFallback
                  src={other?.user.image}
                  name={other?.user.name ?? "User"}
                  className="w-10 h-10 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p
                      className={`text-body-sm truncate ${hasUnread ? "font-semibold text-gray-950" : "font-medium text-gray-700"}`}
                    >
                      {other?.user.name ?? "Unknown"}
                    </p>
                    {lastMessage && (
                      <span className="text-caption text-gray-400 shrink-0 ml-2">
                        {formatDate(lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {convo.campaign && (
                    <p className="text-caption text-brand-600 truncate mb-0.5">
                      {convo.campaign.title}
                    </p>
                  )}
                  {lastMessage ? (
                    <p
                      className={`text-caption truncate ${hasUnread ? "text-gray-700" : "text-gray-400"}`}
                    >
                      {lastMessage.senderId === session.user.id ? "You: " : ""}
                      {lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-caption text-gray-400 italic">
                      No messages yet
                    </p>
                  )}
                </div>
                {hasUnread && (
                  <div className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
    </PageContainer>
  );
}
