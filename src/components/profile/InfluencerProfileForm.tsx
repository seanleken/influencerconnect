"use client";

import { useState, useTransition } from "react";
import { Niche, SocialPlatform } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { saveInfluencerProfile } from "@/actions/profile";
import { Plus, Trash2 } from "lucide-react";
import { FileUpload } from "@/components/shared/FileUpload";
import type { InfluencerProfile } from "@prisma/client";
import type { User } from "@prisma/client";

const NICHE_LABELS: Record<Niche, string> = {
  FASHION: "Fashion",
  BEAUTY: "Beauty",
  TECH: "Tech",
  GAMING: "Gaming",
  FITNESS: "Fitness",
  FOOD: "Food",
  TRAVEL: "Travel",
  LIFESTYLE: "Lifestyle",
  EDUCATION: "Education",
  FINANCE: "Finance",
  ENTERTAINMENT: "Entertainment",
  OTHER: "Other",
};

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
  TWITTER: "Twitter/X",
  LINKEDIN: "LinkedIn",
  OTHER: "Other",
};

type SocialLinkState = {
  platform: SocialPlatform;
  url: string;
  handle: string;
  followerCount: string;
};

interface Props {
  profile: InfluencerProfile | null;
  userImage?: string | null;
}

function parseSocialLinks(raw: unknown): SocialLinkState[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: unknown) => {
    const i = item as Record<string, unknown>;
    return {
      platform: (i.platform as SocialPlatform) ?? "INSTAGRAM",
      url: (i.url as string) ?? "",
      handle: (i.handle as string) ?? "",
      followerCount: i.followerCount != null ? String(i.followerCount) : "",
    };
  });
}

export function InfluencerProfileForm({ profile, userImage }: Props) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [image, setImage] = useState<string | null>(userImage ?? null);
  const [mediaKitUrl, setMediaKitUrl] = useState<string | null>(profile?.mediaKitUrl ?? null);
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [niches, setNiches] = useState<Niche[]>(profile?.niches ?? []);
  const [location, setLocation] = useState(profile?.location ?? "");
  const [isAvailable, setIsAvailable] = useState(
    profile?.isAvailable ?? true
  );
  const [ratePerPost, setRatePerPost] = useState(
    profile?.ratePerPost != null
      ? String(Math.round(profile.ratePerPost / 100))
      : ""
  );
  const [ratePerStory, setRatePerStory] = useState(
    profile?.ratePerStory != null
      ? String(Math.round(profile.ratePerStory / 100))
      : ""
  );
  const [ratePerVideo, setRatePerVideo] = useState(
    profile?.ratePerVideo != null
      ? String(Math.round(profile.ratePerVideo / 100))
      : ""
  );
  const [socialLinks, setSocialLinks] = useState<SocialLinkState[]>(
    parseSocialLinks(profile?.socialLinks)
  );
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>(
    profile?.portfolioUrls ?? []
  );

  function toggleNiche(niche: Niche) {
    setNiches((prev) =>
      prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]
    );
  }

  function addSocialLink() {
    setSocialLinks((prev) => [
      ...prev,
      { platform: "INSTAGRAM", url: "", handle: "", followerCount: "" },
    ]);
  }

  function updateSocialLink(
    index: number,
    field: keyof SocialLinkState,
    value: string
  ) {
    setSocialLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link))
    );
  }

  function removeSocialLink(index: number) {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function addPortfolioUrl() {
    setPortfolioUrls((prev) => [...prev, ""]);
  }

  function updatePortfolioUrl(index: number, value: string) {
    setPortfolioUrls((prev) => prev.map((url, i) => (i === index ? value : url)));
  }

  function removePortfolioUrl(index: number) {
    setPortfolioUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const cleanPortfolioUrls = portfolioUrls.filter((url) => url.trim() !== "");
    const cleanSocialLinks = socialLinks.map((link) => ({
      platform: link.platform,
      url: link.url.trim() || undefined,
      handle: link.handle.trim() || undefined,
      followerCount: link.followerCount
        ? parseInt(link.followerCount)
        : undefined,
    }));

    startTransition(async () => {
      const result = await saveInfluencerProfile({
        bio,
        niches,
        location: location.trim() || undefined,
        ratePerPost: ratePerPost ? parseInt(ratePerPost) : undefined,
        ratePerStory: ratePerStory ? parseInt(ratePerStory) : undefined,
        ratePerVideo: ratePerVideo ? parseInt(ratePerVideo) : undefined,
        portfolioUrls: cleanPortfolioUrls,
        isAvailable,
        socialLinks: cleanSocialLinks,
        image,
        mediaKitUrl,
      });

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Profile saved",
        description: "Your profile has been updated.",
      });
    });
  }

  const rateFields: Array<{
    key: string;
    label: string;
    value: string;
    setter: (v: string) => void;
  }> = [
    { key: "post", label: "Per Post", value: ratePerPost, setter: setRatePerPost },
    { key: "story", label: "Per Story", value: ratePerStory, setter: setRatePerStory },
    { key: "video", label: "Per Video", value: ratePerVideo, setter: setRatePerVideo },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Avatar */}
      <div className="space-y-2">
        <Label>Profile Photo</Label>
        <FileUpload
          folder="avatar"
          accept="image/jpeg,image/png,image/webp"
          maxSizeBytes={2 * 1024 * 1024}
          currentUrl={image}
          onUpload={(url) => setImage(url || null)}
          label="Upload photo"
        />
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="bio">
            Bio <span className="text-error-600">*</span>
          </Label>
          <span className="text-caption text-gray-400">{bio.length}/1000</span>
        </div>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell brands about yourself, your content style, and what makes you unique..."
          rows={4}
          maxLength={1000}
          className="resize-none"
        />
      </div>

      {/* Niches */}
      <div className="space-y-2">
        <Label>
          Content Niches <span className="text-error-600">*</span>
        </Label>
        <p className="text-caption text-gray-500">
          Select all that apply to your content
        </p>
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

      {/* Location & Availability */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. New York, US"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Availability</Label>
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              role="switch"
              aria-checked={isAvailable}
              onClick={() => setIsAvailable((prev: boolean) => !prev)}
              className={cn(
                "inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
                isAvailable ? "bg-brand-600" : "bg-gray-300"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200",
                  isAvailable ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
            <span className="text-body text-gray-700">
              {isAvailable ? "Available for campaigns" : "Not available"}
            </span>
          </div>
        </div>
      </div>

      {/* Rates */}
      <div className="space-y-2">
        <Label>Rates (USD)</Label>
        <p className="text-caption text-gray-500">
          Set your starting rates to help brands understand your pricing
        </p>
        <div className="grid sm:grid-cols-3 gap-4 mt-2">
          {rateFields.map(({ key, label, value, setter }) => (
            <div key={key} className="space-y-1.5">
              <Label
                htmlFor={`rate-${key}`}
                className="text-body-sm text-gray-600"
              >
                {label}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-body-sm pointer-events-none">
                  $
                </span>
                <Input
                  id={`rate-${key}`}
                  type="number"
                  min="0"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder="0"
                  className="pl-6"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-2">
        <Label>Social Media</Label>
        <p className="text-caption text-gray-500">
          Add your profiles so brands can discover your reach
        </p>
        <div className="space-y-3 mt-2">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex gap-2 items-center">
              <div className="w-36 shrink-0">
                <Select
                  value={link.platform}
                  onValueChange={(val) =>
                    updateSocialLink(index, "platform", val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(PLATFORM_LABELS) as SocialPlatform[]).map(
                      (p) => (
                        <SelectItem key={p} value={p}>
                          {PLATFORM_LABELS[p]}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Input
                value={link.handle}
                onChange={(e) =>
                  updateSocialLink(index, "handle", e.target.value)
                }
                placeholder="@handle"
                className="w-28 shrink-0"
              />
              <Input
                value={link.url}
                onChange={(e) =>
                  updateSocialLink(index, "url", e.target.value)
                }
                placeholder="Profile URL"
                className="flex-1"
              />
              <Input
                type="number"
                min="0"
                value={link.followerCount}
                onChange={(e) =>
                  updateSocialLink(index, "followerCount", e.target.value)
                }
                placeholder="Followers"
                className="w-28 shrink-0"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSocialLink(index)}
                className="text-gray-400 hover:text-error-600 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSocialLink}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add social link
          </Button>
        </div>
      </div>

      {/* Portfolio URLs */}
      <div className="space-y-2">
        <Label>Portfolio / Work Examples</Label>
        <p className="text-caption text-gray-500">
          Links to your best work — posts, videos, past campaigns
        </p>
        <div className="space-y-2 mt-2">
          {portfolioUrls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => updatePortfolioUrl(index, e.target.value)}
                placeholder="https://..."
                type="url"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removePortfolioUrl(index)}
                className="text-gray-400 hover:text-error-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPortfolioUrl}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add portfolio link
          </Button>
        </div>
      </div>

      {/* Media Kit */}
      <div className="space-y-2">
        <Label>Media Kit</Label>
        <p className="text-caption text-gray-500">Upload a PDF showcasing your audience stats and past work</p>
        <FileUpload
          folder="media-kit"
          accept="application/pdf"
          maxSizeBytes={10 * 1024 * 1024}
          currentUrl={mediaKitUrl}
          onUpload={(url) => setMediaKitUrl(url || null)}
          label="Upload media kit PDF"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2 border-t border-gray-100">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : profile ? "Save changes" : "Complete profile"}
        </Button>
      </div>
    </form>
  );
}
