import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getCampaignById } from "@/services/campaign.service";
import { getCompanyProfile, getInfluencerProfile } from "@/services/profile.service";
import { getApplicationByInfluencerAndCampaign } from "@/services/application.service";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CampaignActions } from "@/components/campaigns/CampaignActions";
import { ApplicationForm } from "@/components/campaigns/ApplicationForm";
import { WithdrawApplicationButton } from "@/components/campaigns/WithdrawApplicationButton";
import { StartConversationButton } from "@/components/shared/StartConversationButton";
import {
  formatCurrencyRange,
  formatDate,
} from "@/lib/utils";
import {
  Calendar,
  DollarSign,
  Users,
  Globe,
  ChevronLeft,
  Pencil,
  ClipboardList,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import type { Niche, SocialPlatform } from "@prisma/client";

const NICHE_LABELS: Record<Niche, string> = {
  FASHION: "Fashion", BEAUTY: "Beauty", TECH: "Tech", GAMING: "Gaming",
  FITNESS: "Fitness", FOOD: "Food", TRAVEL: "Travel", LIFESTYLE: "Lifestyle",
  EDUCATION: "Education", FINANCE: "Finance", ENTERTAINMENT: "Entertainment", OTHER: "Other",
};

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  INSTAGRAM: "Instagram", TIKTOK: "TikTok", YOUTUBE: "YouTube",
  TWITTER: "Twitter/X", LINKEDIN: "LinkedIn", OTHER: "Other",
};

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const campaign = await getCampaignById(id);
  if (!campaign) notFound();

  // Determine ownership and application state
  let isOwner = false;
  let existingApplication = null;
  let influencerProfileId: string | null = null;

  if (session.user.role === "COMPANY") {
    const profile = await getCompanyProfile(session.user.id);
    isOwner = profile?.id === campaign.companyProfileId;
  } else if (session.user.role === "INFLUENCER") {
    const profile = await getInfluencerProfile(session.user.id);
    if (profile) {
      influencerProfileId = profile.id;
      existingApplication = await getApplicationByInfluencerAndCampaign(profile.id, campaign.id);
    }
  }

  return (
    <PageContainer>
    <div className="max-w-4xl">
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-1 text-body-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to campaigns
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <StatusBadge status={campaign.status} />
              {isOwner && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/campaigns/${id}/edit`}>
                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                    Edit
                  </Link>
                </Button>
              )}
            </div>
            <h1 className="text-h1 font-heading text-gray-950 mb-1">
              {campaign.title}
            </h1>
            <p className="text-body text-gray-500">
              by {campaign.companyProfile.companyName}
              {campaign.companyProfile.industry && (
                <span> · {campaign.companyProfile.industry}</span>
              )}
            </p>
          </div>

          {/* Description */}
          <section>
            <h2 className="text-h3 font-heading text-gray-950 mb-2">
              About this campaign
            </h2>
            <p className="text-body text-gray-700 whitespace-pre-wrap">
              {campaign.description}
            </p>
          </section>

          {/* Requirements */}
          <section>
            <h2 className="text-h3 font-heading text-gray-950 mb-2">
              Influencer requirements
            </h2>
            <p className="text-body text-gray-700 whitespace-pre-wrap">
              {campaign.requirements}
            </p>
          </section>

          {/* Deliverables */}
          <section>
            <h2 className="text-h3 font-heading text-gray-950 mb-2">
              Deliverables
            </h2>
            <p className="text-body text-gray-700 whitespace-pre-wrap">
              {campaign.deliverables}
            </p>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            {/* Budget */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-success-100 rounded-lg flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4 text-success-600" />
              </div>
              <div>
                <p className="text-caption text-gray-500">Budget</p>
                <p className="text-body-sm font-medium text-gray-950">
                  {formatCurrencyRange(campaign.budgetMin, campaign.budgetMax)}
                </p>
              </div>
            </div>

            {/* Deadline */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-warning-100 rounded-lg flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-warning-600" />
              </div>
              <div>
                <p className="text-caption text-gray-500">Deadline</p>
                <p className="text-body-sm font-medium text-gray-950">
                  {formatDate(campaign.deadline)}
                </p>
              </div>
            </div>

            {/* Max influencers */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-100 rounded-lg flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <p className="text-caption text-gray-500">Spots available</p>
                <p className="text-body-sm font-medium text-gray-950">
                  {campaign.maxInfluencers} influencer{campaign.maxInfluencers !== 1 ? "s" : ""}
                  {" "}
                  <span className="text-gray-400 font-normal">
                    · {campaign._count.applications} applied
                  </span>
                </p>
              </div>
            </div>

            {campaign.companyProfile.website && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-gray-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-caption text-gray-500">Website</p>
                  <a
                    href={campaign.companyProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-body-sm font-medium text-brand-600 hover:text-brand-700 truncate block"
                  >
                    {campaign.companyProfile.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              </div>
            )}
          {campaign.briefUrl && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-caption text-gray-500">Campaign Brief</p>
                  <a
                    href={campaign.briefUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-body-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    View brief
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Platforms */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-caption text-gray-500 mb-2">Platforms</p>
            <div className="flex flex-wrap gap-1.5">
              {campaign.platforms.map((platform) => (
                <span
                  key={platform}
                  className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-caption font-medium"
                >
                  {PLATFORM_LABELS[platform]}
                </span>
              ))}
            </div>
          </div>

          {/* Niches */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-caption text-gray-500 mb-2">Niches</p>
            <div className="flex flex-wrap gap-1.5">
              {campaign.niches.map((niche) => (
                <span
                  key={niche}
                  className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 text-caption font-medium"
                >
                  {NICHE_LABELS[niche]}
                </span>
              ))}
            </div>
          </div>

          {/* Owner actions */}
          {isOwner && (
            <>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/campaigns/${id}/applications`}>
                  <ClipboardList className="w-4 h-4 mr-2" />
                  View Applications ({campaign._count.applications})
                </Link>
              </Button>
              <CampaignActions
                campaignId={id}
                status={campaign.status}
                applicationCount={campaign._count.applications}
              />
            </>
          )}

          {/* Influencer apply section */}
          {session.user.role === "INFLUENCER" && (
            <>
              {!influencerProfileId ? (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 text-center">
                  <p className="text-body-sm text-gray-600 mb-3">
                    Complete your profile to apply to campaigns.
                  </p>
                  <Button size="sm" asChild>
                    <Link href="/profile">Complete Profile</Link>
                  </Button>
                </div>
              ) : existingApplication ? (
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-body-sm font-medium text-gray-800">Your application</p>
                    <StatusBadge status={existingApplication.status} />
                  </div>
                  <StartConversationButton
                    otherUserId={campaign.companyProfile.userId}
                    campaignId={campaign.id}
                    label="Message Company"
                    className="w-full"
                  />
                  {existingApplication.status === "PENDING" && (
                    <WithdrawApplicationButton applicationId={existingApplication.id} />
                  )}
                </div>
              ) : campaign.status === "OPEN" ? (
                <ApplicationForm campaignId={id} />
              ) : (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 text-center">
                  <p className="text-body-sm text-gray-500">This campaign is no longer accepting applications.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
    </PageContainer>
  );
}
