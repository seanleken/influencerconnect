import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCompanyDashboardData, getInfluencerDashboardData } from "@/services/dashboard.service";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Megaphone, Users, MessageSquare, Plus, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageContainer } from "@/components/layout/PageContainer";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user!;
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  if (user.role === "COMPANY") {
    const { companyProfile, activeCampaignCount, pendingApplicationCount, recentConversations } =
      await getCompanyDashboardData(user.id);

    if (!companyProfile) {
      return (
        <PageContainer>
        <div className="space-y-6">
          <div>
            <h1 className="text-h1 font-heading text-gray-950">{greeting}, {user.name}</h1>
            <p className="text-body text-gray-500 mt-1">{formatDate(now)}</p>
          </div>
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <p className="text-h4 font-heading text-gray-950 mb-1">Complete your company profile</p>
              <p className="text-body text-gray-600 mb-3">Set up your profile to start posting campaigns and finding influencers.</p>
              <Button asChild size="sm">
                <Link href="/profile">Set up profile</Link>
              </Button>
            </div>
          </div>
        </div>
        </PageContainer>
      );
    }

    return (
      <PageContainer>
      <div className="space-y-8">
        <div>
          <h1 className="text-h1 font-heading text-gray-950">
            {greeting}, {user.name}
          </h1>
          <p className="text-body text-gray-500 mt-1">{formatDate(now)}</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-gray-500">Active Campaigns</p>
                  <p className="text-display font-heading text-gray-950 mt-1">{activeCampaignCount}</p>
                </div>
                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-brand-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-gray-500">Pending Applications</p>
                  <p className="text-display font-heading text-gray-950 mt-1">{pendingApplicationCount}</p>
                </div>
                <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-warning-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-gray-500">Total Campaigns</p>
                  <p className="text-display font-heading text-gray-950 mt-1">
                    {companyProfile.campaignsPosted}
                  </p>
                </div>
                <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-success-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick action */}
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href="/campaigns/new">
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/influencers">Browse Influencers</Link>
          </Button>
        </div>

        {/* Recent messages */}
        {recentConversations.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-h4">Recent Messages</CardTitle>
              <Link href="/messages" className="text-body-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="divide-y divide-gray-100">
              {recentConversations.map((convo) => {
                const other = convo.participants[0];
                const lastMsg = convo.messages[0];
                return (
                  <Link
                    key={convo.id}
                    href={`/messages/${convo.id}`}
                    className="flex items-center gap-3 py-3 hover:bg-gray-50 -mx-6 px-6 transition-colors"
                  >
                    <MessageSquare className="w-8 h-8 text-gray-300 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-medium text-gray-800">{other?.user.name}</p>
                      <p className="text-caption text-gray-500 truncate">{lastMsg?.content}</p>
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
      </PageContainer>
    );
  }

  // Influencer dashboard
  const { influencerProfile, activeApplicationCount, recentCampaigns } =
    await getInfluencerDashboardData(user.id);

  if (!influencerProfile) {
    return (
      <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-h1 font-heading text-gray-950">{greeting}, {user.name}</h1>
          <p className="text-body text-gray-500 mt-1">{formatDate(now)}</p>
        </div>
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <p className="text-h4 font-heading text-gray-950 mb-1">Complete your influencer profile</p>
            <p className="text-body text-gray-600 mb-3">Set up your profile to start discovering campaigns and connecting with brands.</p>
            <Button asChild size="sm">
              <Link href="/profile">Set up profile</Link>
            </Button>
          </div>
        </div>
      </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
    <div className="space-y-8">
      <div>
        <h1 className="text-h1 font-heading text-gray-950">
          {greeting}, {user.name}
        </h1>
        <p className="text-body text-gray-500 mt-1">{formatDate(now)}</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500">Active Applications</p>
                <p className="text-display font-heading text-gray-950 mt-1">{activeApplicationCount}</p>
              </div>
              <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-brand-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500">Completed Campaigns</p>
                <p className="text-display font-heading text-gray-950 mt-1">
                  {influencerProfile.completedCampaigns}
                </p>
              </div>
              <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-success-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500">Rating</p>
                <p className="text-display font-heading text-gray-950 mt-1">
                  {influencerProfile.rating > 0 ? influencerProfile.rating.toFixed(1) : "—"}
                </p>
              </div>
              <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discover campaigns */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h2 font-heading text-gray-950">Available Campaigns</h2>
          <Link href="/campaigns" className="text-body-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
            Browse all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {recentCampaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/campaigns/${campaign.id}`}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-caption text-gray-500">{campaign.companyProfile.companyName}</p>
                <StatusBadge status={campaign.status} />
              </div>
              <h3 className="text-h3 text-gray-950 mb-1 line-clamp-1">{campaign.title}</h3>
              <p className="text-body text-gray-600 line-clamp-2">{campaign.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-caption text-gray-500">
                  Deadline: {formatDate(campaign.deadline)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
    </PageContainer>
  );
}
