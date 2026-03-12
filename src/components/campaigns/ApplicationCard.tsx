"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AvatarWithFallback } from "@/components/shared/AvatarWithFallback";
import { RatingStars } from "@/components/shared/RatingStars";
import { useToast } from "@/hooks/use-toast";
import { acceptApplication, rejectApplication } from "@/actions/applications";
import { StartConversationButton } from "@/components/shared/StartConversationButton";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ApplicationStatus, Niche } from "@prisma/client";

const NICHE_LABELS: Record<Niche, string> = {
  FASHION: "Fashion", BEAUTY: "Beauty", TECH: "Tech", GAMING: "Gaming",
  FITNESS: "Fitness", FOOD: "Food", TRAVEL: "Travel", LIFESTYLE: "Lifestyle",
  EDUCATION: "Education", FINANCE: "Finance", ENTERTAINMENT: "Entertainment", OTHER: "Other",
};

interface ApplicationCardProps {
  application: {
    id: string;
    coverLetter: string;
    proposedRate: number;
    status: ApplicationStatus;
    createdAt: Date;
    influencerProfile: {
      id: string;
      bio: string;
      niches: Niche[];
      rating: number;
      reviewCount: number;
      completedCampaigns: number;
      ratePerPost: number | null;
      user: { id: string; name: string; image: string | null };
    };
  };
  showActions?: boolean;
  campaignId?: string;
}

export function ApplicationCard({ application, showActions = false, campaignId }: ApplicationCardProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { influencerProfile } = application;

  function handleAccept() {
    startTransition(async () => {
      const result = await acceptApplication(application.id);
      if (!result.success) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Application accepted" });
      }
    });
  }

  function handleReject() {
    startTransition(async () => {
      const result = await rejectApplication(application.id);
      if (!result.success) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Application rejected" });
      }
    });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <AvatarWithFallback
            src={influencerProfile.user.image}
            name={influencerProfile.user.name}
            size="md"
          />
          <div>
            <p className="text-body-sm font-medium text-gray-950">
              {influencerProfile.user.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <RatingStars rating={influencerProfile.rating} size="sm" />
              <span className="text-caption text-gray-400">
                {influencerProfile.completedCampaigns} campaigns
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={application.status} />
        </div>
      </div>

      {/* Niches */}
      {influencerProfile.niches.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {influencerProfile.niches.slice(0, 4).map((niche) => (
            <span
              key={niche}
              className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-600 text-caption font-medium"
            >
              {NICHE_LABELS[niche]}
            </span>
          ))}
        </div>
      )}

      {/* Proposed rate */}
      <div className="flex items-center justify-between text-body-sm">
        <span className="text-gray-500">Proposed rate</span>
        <span className="font-mono font-medium text-gray-950">
          {formatCurrency(application.proposedRate)}
        </span>
      </div>

      {/* Cover letter */}
      <div>
        <p className="text-caption text-gray-400 mb-1.5">Cover letter</p>
        <p className="text-body-sm text-gray-700 whitespace-pre-wrap line-clamp-4">
          {application.coverLetter}
        </p>
      </div>

      {/* Meta */}
      <p className="text-caption text-gray-400">
        Applied {formatDate(application.createdAt)}
      </p>

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-gray-100">
        <StartConversationButton
          otherUserId={influencerProfile.user.id}
          campaignId={campaignId}
          className="flex-1"
        />
        {showActions && application.status === "PENDING" && (
          <>
            <Button
              size="sm"
              onClick={handleAccept}
              disabled={isPending}
              className="flex-1"
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReject}
              disabled={isPending}
              className="flex-1 text-error-600 hover:text-error-600 hover:bg-error-100 border-gray-200"
            >
              Reject
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
