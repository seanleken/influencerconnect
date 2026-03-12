"use client";

import { ChatMessages, type ChatMessage } from "./ChatMessages";
import { ChatInput } from "./ChatInput";

interface ChatThreadProps {
  conversationId: string;
  currentUserId: string;
  initialMessages: ChatMessage[];
}

export function ChatThread({
  conversationId,
  currentUserId,
  initialMessages,
}: ChatThreadProps) {
  return (
    <div className="flex flex-col h-full">
      <ChatMessages
        conversationId={conversationId}
        currentUserId={currentUserId}
        initialMessages={initialMessages}
      />
<ChatInput conversationId={conversationId} />
    </div>
  );
}
