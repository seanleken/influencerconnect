import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getInfluencerProfile } from "@/services/profile.service";
import { getApplicationsByInfluencer } from "@/services/application.service";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency, formatCurrencyRange, formatDate } from "@/lib/utils";
import { ClipboardList, ChevronRight } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
type ApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

const STATUS_TABS: { label: string; value: ApplicationStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Withdrawn", value: "WITHDRAWN" },
];

export default async function MyApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "INFLUENCER") redirect("/dashboard");

  const profile = await getInfluencerProfile(session.user.id);
  if (!profile) redirect("/profile");

  const allApplications = await getApplicationsByInfluencer(profile.id);

  const activeStatus = (status ?? "ALL") as ApplicationStatus | "ALL";
  const filtered =
    activeStatus === "ALL"
      ? allApplications
      : allApplications.filter((a) => (a.status as string) === (activeStatus as string));

  const counts: Record<string, number> = {
    ALL: allApplications.length,
    PENDING: allApplications.filter((a) => a.status === "PENDING").length,
    ACCEPTED: allApplications.filter((a) => a.status === "ACCEPTED").length,
    REJECTED: allApplications.filter((a) => a.status === "REJECTED").length,
    WITHDRAWN: allApplications.filter((a) => a.status === "WITHDRAWN").length,
  };

  return (
    <PageContainer>
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-h1 font-heading text-gray-950">My Applications</h1>
        <p className="text-body text-gray-500 mt-1">
          Track your campaign applications and their status.
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        {STATUS_TABS.map((tab) => {
          const isActive = activeStatus === tab.value;
          const count = counts[tab.value] ?? 0;
          return (
            <Link
              key={tab.value}
              href={tab.value === "ALL" ? "/applications" : `/applications?status=${tab.value}`}
              className={`px-4 py-2.5 text-body-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                isActive
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`ml-1.5 text-caption px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-brand-100 text-brand-600" : "bg-gray-100 text-gray-500"
                  }`}
                >
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
              ? "Browse open campaigns and apply to ones that match your niche."
              : "No applications with this status."
          }
          actionLabel={activeStatus === "ALL" ? "Browse Campaigns" : undefined}
          actionHref={activeStatus === "ALL" ? "/campaigns" : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((application) => (
            <Link
              key={application.id}
              href={`/campaigns/${application.campaign.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-caption text-gray-500 truncate">
                      {application.campaign.companyProfile.companyName}
                    </p>
                    <StatusBadge status={application.campaign.status} />
                  </div>
                  <p className="text-body-sm font-medium text-gray-950 truncate">
                    {application.campaign.title}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-caption text-gray-400">
                    <span>
                      Budget:{" "}
                      <span className="font-mono text-gray-600">
                        {formatCurrencyRange(
                          application.campaign.budgetMin,
                          application.campaign.budgetMax
                        )}
                      </span>
                    </span>
                    <span>·</span>
                    <span>
                      Your rate:{" "}
                      <span className="font-mono text-gray-600">
                        {formatCurrency(application.proposedRate)}
                      </span>
                    </span>
                    <span>·</span>
                    <span>Deadline {formatDate(application.campaign.deadline)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={application.status} />
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
    </PageContainer>
  );
}
