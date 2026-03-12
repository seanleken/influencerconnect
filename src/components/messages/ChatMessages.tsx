"use client";

import { useEffect, useRef, useState } from "react";
import { getPusherClient } from "@/lib/pusher-client";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: string;
}

interface ChatMessagesProps {
  conversationId: string;
  currentUserId: string;
  initialMessages: ChatMessage[];
}

export function ChatMessages({
  conversationId,
  currentUserId,
  initialMessages,
}: ChatMessagesProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`conversation-${conversationId}`);

    channel.bind("new-message", (data: ChatMessage) => {
      setMessages((prev) => {
        // Deduplicate — the sender's optimistic message has the same id
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`conversation-${conversationId}`);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-body-sm text-gray-400">
        No messages yet. Send one to get started!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg) => {
        const isOwn = msg.senderId === currentUserId;
        return (
          <div
            key={msg.id}
            className={cn("flex", isOwn ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-xs sm:max-w-md lg:max-w-lg rounded-2xl px-4 py-2.5",
                isOwn
                  ? "bg-brand-600 text-white rounded-br-sm"
                  : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm",
              )}
            >
              <p className="text-body-sm whitespace-pre-wrap break-words">
                {msg.content}
              </p>
              <p
                className={cn(
                  "text-caption mt-1",
                  isOwn ? "text-brand-200 text-right" : "text-gray-400",
                )}
              >
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
