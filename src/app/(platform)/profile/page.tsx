import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getInfluencerProfile,
  getCompanyProfile,
} from "@/services/profile.service";
import { InfluencerProfileForm } from "@/components/profile/InfluencerProfileForm";
import { CompanyProfileForm } from "@/components/profile/CompanyProfileForm";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/PageContainer";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id, role } = session.user;

  if (role === "INFLUENCER") {
    const profile = await getInfluencerProfile(id);

    return (
      <PageContainer>
        <div className="max-w-2xl">
          <div className="mb-8">
            <h1 className="text-h1 font-heading text-gray-950">
              {profile ? "Your Profile" : "Complete Your Profile"}
            </h1>
            <p className="text-body text-gray-500 mt-1">
              {profile
                ? "Keep your profile up to date to attract the right campaigns."
                : "Set up your profile to start discovering and applying to campaigns."}
            </p>
          </div>
          <Card>
            <CardContent className="p-6 sm:p-8">
              <InfluencerProfileForm profile={profile} userImage={profile?.user.image} />
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  if (role === "COMPANY") {
    const profile = await getCompanyProfile(id);

    return (
      <PageContainer>
        <div className="max-w-2xl">
          <div className="mb-8">
            <h1 className="text-h1 font-heading text-gray-950">
              {profile ? "Company Profile" : "Set Up Your Company"}
            </h1>
            <p className="text-body text-gray-500 mt-1">
              {profile
                ? "Keep your company profile up to date to attract the right influencers."
                : "Set up your company profile to start posting campaigns."}
            </p>
          </div>
          <Card>
            <CardContent className="p-6 sm:p-8">
              <CompanyProfileForm profile={profile} userImage={profile?.user.image} />
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  redirect("/dashboard");
}
