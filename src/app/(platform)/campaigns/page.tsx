import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Megaphone, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { CampaignFilters } from "@/components/campaigns/CampaignFilters";
import { Pagination } from "@/components/shared/Pagination";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  getCampaigns,
  getCampaignsByCompany,
  CAMPAIGNS_PAGE_SIZE,
} from "@/services/campaign.service";
import { getCompanyProfile } from "@/services/profile.service";
import type { Niche, SocialPlatform } from "@prisma/client";
import { PageContainer } from "@/components/layout/PageContainer";

type SearchParams = Promise<{ [key: string]: string | undefined }>;

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const search = params.q;
  const sort = (params.sort ?? "newest") as "newest" | "deadline" | "budget";
  const page = parseInt(params.page ?? "1") || 1;
  const niches = params.niches?.split(",").filter(Boolean) as Niche[] | undefined;
  const platforms = params.platforms?.split(",").filter(Boolean) as SocialPlatform[] | undefined;
  const budgetMin = params.budgetMin ? parseInt(params.budgetMin) * 100 : undefined;
  const budgetMax = params.budgetMax ? parseInt(params.budgetMax) * 100 : undefined;

  const isCompany = session.user.role === "COMPANY";

  // Fetch company's own campaigns (all statuses) in parallel with public browse
  const [{ campaigns, total }, companyProfile] = await Promise.all([
    getCampaigns({ search, niches, platforms, budgetMin, budgetMax, sort, page }),
    isCompany ? getCompanyProfile(session.user.id) : Promise.resolve(null),
  ]);

  const myCampaigns = companyProfile
    ? await getCampaignsByCompany(companyProfile.id)
    : [];

  const totalPages = Math.ceil(total / CAMPAIGNS_PAGE_SIZE);

  const filterParams: Record<string, string> = {};
  if (search) filterParams.q = search;
  if (params.sort) filterParams.sort = params.sort;
  if (params.niches) filterParams.niches = params.niches;
  if (params.platforms) filterParams.platforms = params.platforms;
  if (params.budgetMin) filterParams.budgetMin = params.budgetMin;
  if (params.budgetMax) filterParams.budgetMax = params.budgetMax;

  return (
    <PageContainer>
    <div className="space-y-10">
      {/* My Campaigns — company only */}
      {isCompany && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h2 font-heading text-gray-950">My Campaigns</h2>
            <Button asChild>
              <Link href="/campaigns/new">
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Link>
            </Button>
          </div>

          {myCampaigns.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <p className="text-body text-gray-500 mb-3">
                You haven&apos;t created any campaigns yet.
              </p>
              <Button asChild size="sm">
                <Link href="/campaigns/new">Create your first campaign</Link>
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Browse open campaigns */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-h2 font-heading text-gray-950">
              {isCompany ? "Browse Campaigns" : "Campaigns"}
            </h2>
            <p className="text-body text-gray-500 mt-0.5">
              {total > 0
                ? `${total} open campaign${total === 1 ? "" : "s"}`
                : "No campaigns found"}
            </p>
          </div>
          {!isCompany && (
            /* Influencer gets the page title + count only — no button */
            <span />
          )}
        </div>

        <Suspense>
          <CampaignFilters />
        </Suspense>

        {campaigns.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            heading="No campaigns found"
            description="Try adjusting your filters or check back later for new opportunities."
          />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              basePath="/campaigns"
              searchParams={filterParams}
            />
          </>
        )}
      </section>
    </div>
    </PageContainer>
  );
}
