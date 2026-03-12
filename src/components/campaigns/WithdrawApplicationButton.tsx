"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { withdrawApplication } from "@/actions/applications";

interface Props {
  applicationId: string;
}

export function WithdrawApplicationButton({ applicationId }: Props) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleWithdraw() {
    startTransition(async () => {
      const result = await withdrawApplication(applicationId);
      if (!result.success) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Application withdrawn" });
      }
    });
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleWithdraw}
      disabled={isPending}
      className="w-full text-error-600 hover:text-error-600 hover:bg-error-100 border-gray-200"
    >
      {isPending ? "Withdrawing…" : "Withdraw Application"}
    </Button>
  );
}
