import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCompanyProfile } from "@/services/profile.service";
import { CampaignForm } from "@/components/campaigns/CampaignForm";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";

export default async function NewCampaignPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "COMPANY") redirect("/campaigns");

  const profile = await getCompanyProfile(session.user.id);
  if (!profile) redirect("/profile");

  return (
    <PageContainer>
    <div className="max-w-2xl">
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-1 text-body-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to campaigns
      </Link>

      <div className="mb-8">
        <h1 className="text-h1 font-heading text-gray-950">Create Campaign</h1>
        <p className="text-body text-gray-500 mt-1">
          Fill in the details to attract the right influencers.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <CampaignForm />
        </CardContent>
      </Card>
    </div>
    </PageContainer>
  );
}
