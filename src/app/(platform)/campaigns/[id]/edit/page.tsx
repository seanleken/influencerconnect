import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getCampaignById } from "@/services/campaign.service";
import { getCompanyProfile } from "@/services/profile.service";
import { CampaignForm } from "@/components/campaigns/CampaignForm";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "COMPANY") redirect(`/campaigns/${id}`);

  const [campaign, profile] = await Promise.all([
    getCampaignById(id),
    getCompanyProfile(session.user.id),
  ]);

  if (!campaign) notFound();
  if (!profile || campaign.companyProfileId !== profile.id) redirect(`/campaigns/${id}`);

  return (
    <PageContainer>
    <div className="max-w-2xl">
      <Link
        href={`/campaigns/${id}`}
        className="inline-flex items-center gap-1 text-body-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to campaign
      </Link>

      <div className="mb-8">
        <h1 className="text-h1 font-heading text-gray-950">Edit Campaign</h1>
        <p className="text-body text-gray-500 mt-1 truncate">{campaign.title}</p>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <CampaignForm initialData={campaign} />
        </CardContent>
      </Card>
    </div>
    </PageContainer>
  );
}
