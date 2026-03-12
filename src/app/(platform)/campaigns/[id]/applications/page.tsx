import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getCampaignById } from "@/services/campaign.service";
import { getCompanyProfile } from "@/services/profile.service";
import { getApplicationsByCampaign } from "@/services/application.service";
import { ApplicationCard } from "@/components/campaigns/ApplicationCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ChevronLeft, ClipboardList } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
type ApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

const STATUS_TABS: { label: string; value: ApplicationStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Rejected", value: "REJECTED" },
];

export default async function CampaignApplicationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ id }, { status }] = await Promise.all([params, searchParams]);

  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "COMPANY") redirect(`/campaigns/${id}`);

  const [campaign, profile] = await Promise.all([
    getCampaignById(id),
    getCompanyProfile(session.user.id),
  ]);

  if (!campaign) notFound();
  if (!profile || campaign.companyProfileId !== profile.id) redirect(`/campaigns/${id}`);

  const allApplications = await getApplicationsByCampaign(id);

  const activeStatus = (status as ApplicationStatus | undefined) ?? "ALL";
  const filtered =
    activeStatus === "ALL"
      ? allApplications
      : allApplications.filter((a) => a.status === activeStatus);

  const counts = {
    ALL: allApplications.length,
    PENDING: allApplications.filter((a) => a.status === "PENDING").length,
    ACCEPTED: allApplications.filter((a) => a.status === "ACCEPTED").length,
    REJECTED: allApplications.filter((a) => a.status === "REJECTED").length,
  };

  return (
    <PageContainer>
    <div className="max-w-4xl">
      <Link
        href={`/campaigns/${id}`}
        className="inline-flex items-center gap-1 text-body-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to campaign
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <StatusBadge status={campaign.status} />
        </div>
        <h1 className="text-h1 font-heading text-gray-950">{campaign.title}</h1>
        <p className="text-body text-gray-500 mt-1">
          {allApplications.length} application{allApplications.length !== 1 ? "s" : ""} · {campaign.maxInfluencers} spot{campaign.maxInfluencers !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {STATUS_TABS.map((tab) => {
          const isActive = activeStatus === tab.value;
          const count = counts[tab.value as keyof typeof counts] ?? 0;
          return (
            <Link
              key={tab.value}
              href={tab.value === "ALL" ? `/campaigns/${id}/applications` : `/campaigns/${id}/applications?status=${tab.value}`}
              className={`px-4 py-2.5 text-body-sm font-medium transition-colors border-b-2 -mb-px ${
                isActive
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`ml-1.5 text-caption px-1.5 py-0.5 rounded-full ${isActive ? "bg-brand-100 text-brand-600" : "bg-gray-100 text-gray-500"}`}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          heading={activeStatus === "ALL" ? "No applications yet" : `No ${activeStatus.toLowerCase()} applications`}
          description={
            activeStatus === "ALL"
              ? "Applications will appear here once influencers start applying."
              : "No applications with this status."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              showActions={application.status === "PENDING"}
              campaignId={id}
            />
          ))}
        </div>
      )}
    </div>
    </PageContainer>
  );
}
