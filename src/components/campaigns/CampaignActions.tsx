"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Megaphone, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { publishCampaign, deleteCampaign } from "@/actions/campaigns";
import type { CampaignStatus } from "@prisma/client";

interface Props {
  campaignId: string;
  status: CampaignStatus;
  applicationCount: number;
}

export function CampaignActions({ campaignId, status, applicationCount }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  function handlePublish() {
    startTransition(async () => {
      const result = await publishCampaign(campaignId);
      if (!result.success) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
        return;
      }
      toast({ title: "Campaign published", description: "Influencers can now apply." });
    });
  }

  function handleDelete() {
    if (!confirm("Delete this draft campaign? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteCampaign(campaignId);
      if (!result.success) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
        return;
      }
      router.push("/campaigns");
    });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2">
      <p className="text-caption text-gray-500 mb-3">Campaign actions</p>

      <Button asChild variant="outline" className="w-full justify-start">
        <Link href={`/campaigns/${campaignId}/applications`}>
          <Users className="w-4 h-4 mr-2" />
          View applications
          {applicationCount > 0 && (
            <span className="ml-auto bg-brand-100 text-brand-600 text-caption font-medium rounded-full px-1.5 py-0.5">
              {applicationCount}
            </span>
          )}
        </Link>
      </Button>

      {status === "DRAFT" && (
        <>
          <Button
            className="w-full justify-start"
            disabled={isPending}
            onClick={handlePublish}
          >
            <Megaphone className="w-4 h-4 mr-2" />
            {isPending ? "Publishing…" : "Publish campaign"}
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start text-error-600 hover:text-error-600 hover:bg-error-100 border-error-200"
            disabled={isPending}
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete draft
          </Button>
        </>
      )}
    </div>
  );
}
