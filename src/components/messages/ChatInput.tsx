"use client";

import { useState, useRef, useTransition } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { sendMessage } from "@/actions/messages";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  conversationId: string;
}

export function ChatInput({ conversationId }: ChatInputProps) {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;

    setText("");
    inputRef.current?.style.setProperty("height", "auto");

    startTransition(async () => {
      const result = await sendMessage({ conversationId, content: trimmed });
      if (!result.success) {
        toast({ title: "Failed to send", description: result.error, variant: "destructive" });
        setText(trimmed);
      }
    });

    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 p-4 border-t border-gray-200 bg-white">
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message…"
        rows={1}
        className={cn(
          "flex-1 resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5",
          "text-body text-gray-900 placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
          "max-h-32 overflow-y-auto",
        )}
        onInput={(e) => {
          const el = e.currentTarget;
          el.style.height = "auto";
          el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
        }}
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || isPending}
        className={cn(
          "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
          text.trim() && !isPending
            ? "bg-brand-600 text-white hover:bg-brand-700"
            : "bg-gray-200 text-gray-400 cursor-not-allowed",
        )}
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}
