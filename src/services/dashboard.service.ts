import { db } from "@/lib/db";

export async function getCompanyDashboardData(userId: string) {
  const [companyProfile, activeCampaignCount, pendingApplicationCount, recentConversations] =
    await Promise.all([
      db.companyProfile.findUnique({ where: { userId } }),
      db.campaign.count({
        where: {
          companyProfile: { userId },
          status: { in: ["OPEN", "IN_PROGRESS"] },
        },
      }),
      db.application.count({
        where: {
          campaign: { companyProfile: { userId } },
          status: "PENDING",
        },
      }),
      db.conversation.findMany({
        where: { participants: { some: { userId } } },
        orderBy: { updatedAt: "desc" },
        take: 3,
        include: {
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
          participants: {
            where: { userId: { not: userId } },
            include: { user: { select: { name: true, image: true } } },
          },
        },
      }),
    ]);

  return { companyProfile, activeCampaignCount, pendingApplicationCount, recentConversations };
}

export async function getInfluencerDashboardData(userId: string) {
  const [influencerProfile, activeApplicationCount, recentCampaigns] = await Promise.all([
    db.influencerProfile.findUnique({ where: { userId } }),
    db.application.count({
      where: {
        influencerProfile: { userId },
        status: { in: ["PENDING", "ACCEPTED"] },
      },
    }),
    db.campaign.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        companyProfile: { select: { companyName: true, logo: true } },
      },
    }),
  ]);

  return { influencerProfile, activeApplicationCount, recentCampaigns };
}
