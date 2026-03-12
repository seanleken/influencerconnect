"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Niche, SocialPlatform } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { createCampaign, updateCampaign } from "@/actions/campaigns";
import type { Campaign } from "@prisma/client";

const NICHE_LABELS: Record<Niche, string> = {
  FASHION: "Fashion", BEAUTY: "Beauty", TECH: "Tech", GAMING: "Gaming",
  FITNESS: "Fitness", FOOD: "Food", TRAVEL: "Travel", LIFESTYLE: "Lifestyle",
  EDUCATION: "Education", FINANCE: "Finance", ENTERTAINMENT: "Entertainment", OTHER: "Other",
};

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  INSTAGRAM: "Instagram", TIKTOK: "TikTok", YOUTUBE: "YouTube",
  TWITTER: "Twitter/X", LINKEDIN: "LinkedIn", OTHER: "Other",
};

interface Props {
  initialData?: Campaign | null;
}

function toDateInputValue(date: Date | string): string {
  return new Date(date).toISOString().split("T")[0];
}

export function CampaignForm({ initialData }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<"draft" | "publish" | "save" | null>(null);

  const isEdit = !!initialData;

  // Form state
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [requirements, setRequirements] = useState(initialData?.requirements ?? "");
  const [deliverables, setDeliverables] = useState(initialData?.deliverables ?? "");
  const [niches, setNiches] = useState<Niche[]>(initialData?.niches ?? []);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(initialData?.platforms ?? []);
  const [budgetMin, setBudgetMin] = useState(
    initialData?.budgetMin ? String(Math.round(initialData.budgetMin / 100)) : ""
  );
  const [budgetMax, setBudgetMax] = useState(
    initialData?.budgetMax ? String(Math.round(initialData.budgetMax / 100)) : ""
  );
  const [deadline, setDeadline] = useState(
    initialData?.deadline ? toDateInputValue(initialData.deadline) : ""
  );
  const [maxInfluencers, setMaxInfluencers] = useState(
    String(initialData?.maxInfluencers ?? 1)
  );

  function toggleNiche(niche: Niche) {
    setNiches((prev) =>
      prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]
    );
  }

  function togglePlatform(platform: SocialPlatform) {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  }

  function getFormData() {
    return {
      title,
      description,
      requirements,
      deliverables,
      niches,
      platforms,
      budgetMin: budgetMin ? parseInt(budgetMin) : 0,
      budgetMax: budgetMax ? parseInt(budgetMax) : 0,
      deadline,
      maxInfluencers: parseInt(maxInfluencers) || 1,
    };
  }

  function handleAction(action: "draft" | "publish" | "save") {
    setPendingAction(action);
    startTransition(async () => {
      if (action === "save" && initialData) {
        const result = await updateCampaign(initialData.id, getFormData());
        if (!result.success) {
          toast({ title: "Error", description: result.error, variant: "destructive" });
          setPendingAction(null);
          return;
        }
        toast({ title: "Campaign updated" });
        router.push(`/campaigns/${initialData.id}`);
      } else {
        const result = await createCampaign(getFormData(), action === "publish");
        if (!result.success) {
          toast({ title: "Error", description: result.error, variant: "destructive" });
          setPendingAction(null);
          return;
        }
        router.push(`/campaigns/${result.campaignId}`);
      }
    });
  }

  // Today's date as minimum for deadline input
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Campaign Title <span className="text-error-600">*</span></Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Summer Fashion Collection — Instagram Collaboration"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">
          Description <span className="text-error-600">*</span>
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your campaign, brand, and what you're looking to achieve..."
          rows={4}
          className="resize-none"
        />
      </div>

      {/* Requirements */}
      <div className="space-y-1.5">
        <Label htmlFor="requirements">
          Influencer Requirements <span className="text-error-600">*</span>
        </Label>
        <Textarea
          id="requirements"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="Minimum follower count, niche alignment, content style, audience demographics..."
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Deliverables */}
      <div className="space-y-1.5">
        <Label htmlFor="deliverables">
          Deliverables <span className="text-error-600">*</span>
        </Label>
        <Textarea
          id="deliverables"
          value={deliverables}
          onChange={(e) => setDeliverables(e.target.value)}
          placeholder="e.g. 2 Instagram feed posts, 3 Stories, 1 Reel — all with product tag and @mention..."
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Niches */}
      <div className="space-y-2">
        <Label>Content Niches <span className="text-error-600">*</span></Label>
        <p className="text-caption text-gray-500">What type of influencers are you looking for?</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
          {(Object.keys(NICHE_LABELS) as Niche[]).map((niche) => {
            const selected = niches.includes(niche);
            return (
              <button
                key={niche}
                type="button"
                onClick={() => toggleNiche(niche)}
                className={cn(
                  "px-3 py-2 rounded-lg border text-body-sm font-medium transition-all duration-150 text-left",
                  selected
                    ? "border-brand-600 bg-brand-50 text-brand-600"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                {NICHE_LABELS[niche]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Platforms */}
      <div className="space-y-2">
        <Label>Platforms <span className="text-error-600">*</span></Label>
        <p className="text-caption text-gray-500">Which platforms should the content be on?</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {(Object.keys(PLATFORM_LABELS) as SocialPlatform[]).map((platform) => {
            const selected = platforms.includes(platform);
            return (
              <button
                key={platform}
                type="button"
                onClick={() => togglePlatform(platform)}
                className={cn(
                  "px-4 py-2 rounded-lg border text-body-sm font-medium transition-all duration-150",
                  selected
                    ? "border-brand-600 bg-brand-50 text-brand-600"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                {PLATFORM_LABELS[platform]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Budget + Deadline + Max Influencers */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label>Budget Range (USD) <span className="text-error-600">*</span></Label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-body-sm pointer-events-none">$</span>
              <Input
                type="number"
                min="1"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="Min"
                className="pl-6"
              />
            </div>
            <span className="text-gray-400">–</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-body-sm pointer-events-none">$</span>
              <Input
                type="number"
                min="1"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="Max"
                className="pl-6"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="deadline">
            Application Deadline <span className="text-error-600">*</span>
          </Label>
          <Input
            id="deadline"
            type="date"
            min={today}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5 max-w-xs">
        <Label htmlFor="max-influencers">Max Influencers</Label>
        <Input
          id="max-influencers"
          type="number"
          min="1"
          max="100"
          value={maxInfluencers}
          onChange={(e) => setMaxInfluencers(e.target.value)}
        />
        <p className="text-caption text-gray-500">How many influencers can be accepted?</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        {isEdit ? (
          <Button
            type="button"
            disabled={isPending}
            onClick={() => handleAction("save")}
          >
            {pendingAction === "save" ? "Saving…" : "Save Changes"}
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => handleAction("draft")}
            >
              {pendingAction === "draft" ? "Saving…" : "Save as Draft"}
            </Button>
            <Button
              type="button"
              disabled={isPending}
              onClick={() => handleAction("publish")}
            >
              {pendingAction === "publish" ? "Publishing…" : "Publish Campaign"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
