"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startConversation } from "@/actions/messages";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface StartConversationButtonProps {
  otherUserId: string;
  campaignId?: string;
  label?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function StartConversationButton({
  otherUserId,
  campaignId,
  label = "Message",
  variant = "outline",
  size = "sm",
  className,
}: StartConversationButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await startConversation(otherUserId, campaignId);
      if (!result.success) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      } else {
        router.push(`/messages/${result.conversationId}`);
      }
    });
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isPending}
      className={cn(className)}
    >
      <MessageSquare className="w-4 h-4 mr-1.5" />
      {isPending ? "Opening…" : label}
    </Button>
  );
}
