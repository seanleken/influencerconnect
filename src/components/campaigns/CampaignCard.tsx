import Link from "next/link";
import { Calendar, DollarSign, Users } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrencyRange, formatDate } from "@/lib/utils";
import type { Campaign, CompanyProfile, CampaignStatus, Niche, SocialPlatform } from "@prisma/client";

const NICHE_LABELS: Record<Niche, string> = {
  FASHION: "Fashion", BEAUTY: "Beauty", TECH: "Tech", GAMING: "Gaming",
  FITNESS: "Fitness", FOOD: "Food", TRAVEL: "Travel", LIFESTYLE: "Lifestyle",
  EDUCATION: "Education", FINANCE: "Finance", ENTERTAINMENT: "Entertainment", OTHER: "Other",
};

type CampaignWithCompany = Campaign & {
  companyProfile: Pick<CompanyProfile, "companyName" | "logo">;
};

interface CampaignCardProps {
  campaign: CampaignWithCompany;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const visibleNiches = campaign.niches.slice(0, 3);
  const extraNiches = campaign.niches.length - visibleNiches.length;

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="group block bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-caption text-gray-500 truncate pr-2">
          {campaign.companyProfile.companyName}
        </p>
        <StatusBadge status={campaign.status} />
      </div>

      <h3 className="text-h4 font-heading text-gray-950 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
        {campaign.title}
      </h3>

      <p className="text-body text-gray-500 line-clamp-2 mb-4">
        {campaign.description}
      </p>

      {/* Niches */}
      {visibleNiches.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {visibleNiches.map((niche) => (
            <span
              key={niche}
              className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 text-caption font-medium"
            >
              {NICHE_LABELS[niche]}
            </span>
          ))}
          {extraNiches > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-caption">
              +{extraNiches}
            </span>
          )}
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-4 text-caption text-gray-500 border-t border-gray-100 pt-3">
        <span className="flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5" />
          {formatCurrencyRange(campaign.budgetMin, campaign.budgetMax)}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(campaign.deadline)}
        </span>
        {campaign.maxInfluencers > 1 && (
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {campaign.maxInfluencers}
          </span>
        )}
      </div>
    </Link>
  );
}
