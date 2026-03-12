"use client";

import { useState, useRef, useTransition } from "react";
import { Send, Paperclip, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { sendMessage } from "@/actions/messages";
import { useToast } from "@/hooks/use-toast";

function isImageUrl(url: string) {
  return /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url);
}

interface ChatInputProps {
  conversationId: string;
}

export function ChatInput({ conversationId }: ChatInputProps) {
  const [text, setText] = useState("");
  const [attachedFile, setAttachedFile] = useState<{ url: string; name: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const canSend = (text.trim().length > 0 || !!attachedFile) && !isPending && !uploading;

  const handleSend = () => {
    if (!canSend) return;

    const trimmed = text.trim();
    setText("");
    inputRef.current?.style.setProperty("height", "auto");
    const file = attachedFile;
    setAttachedFile(null);

    startTransition(async () => {
      const result = await sendMessage({
        conversationId,
        content: trimmed,
        fileUrl: file?.url,
      });
      if (!result.success) {
        toast({ title: "Failed to send", description: result.error, variant: "destructive" });
        setText(trimmed);
        if (file) setAttachedFile(file);
      }
    });

    inputRef.current?.focus();
  };

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ title: "File too large", description: "Max 5 MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const res = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, folder: "attachment" }),
      });
      if (!res.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, publicUrl } = await res.json();
      await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      setAttachedFile({ url: publicUrl, name: file.name });
    } catch {
      toast({ title: "Upload failed", description: "Please try again", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Attached file preview */}
      {attachedFile && (
        <div className="flex items-center gap-2 px-4 pt-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 text-body-sm text-gray-700 max-w-xs">
            {isImageUrl(attachedFile.url) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={attachedFile.url} alt="" className="w-6 h-6 rounded object-cover" />
            ) : (
              <FileText className="w-4 h-4 shrink-0 text-gray-400" />
            )}
            <span className="truncate">{attachedFile.name}</span>
          </div>
          <button type="button" onClick={() => setAttachedFile(null)} className="text-gray-400 hover:text-error-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 p-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || isPending}
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
        >
          <Paperclip className="w-4 h-4" />
        </button>

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
          disabled={!canSend}
          className={cn(
            "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
            canSend
              ? "bg-brand-600 text-white hover:bg-brand-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed",
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
