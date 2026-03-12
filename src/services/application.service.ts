import { db } from "@/lib/db";
import type { ApplicationStatus } from "@prisma/client";

export async function getApplicationById(id: string) {
  return db.application.findUnique({
    where: { id },
    include: {
      campaign: {
        select: {
          id: true,
          title: true,
          companyProfileId: true,
          maxInfluencers: true,
          status: true,
        },
      },
      influencerProfile: {
        select: { id: true, userId: true, user: { select: { name: true, image: true } } },
      },
    },
  });
}

export async function getApplicationByInfluencerAndCampaign(
  influencerProfileId: string,
  campaignId: string
) {
  return db.application.findUnique({
    where: { campaignId_influencerProfileId: { campaignId, influencerProfileId } },
  });
}

export async function getApplicationsByCampaign(campaignId: string) {
  return db.application.findMany({
    where: { campaignId },
    orderBy: { createdAt: "desc" },
    include: {
      influencerProfile: {
        select: {
          id: true,
          bio: true,
          niches: true,
          rating: true,
          reviewCount: true,
          completedCampaigns: true,
          ratePerPost: true,
          user: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });
}

export async function getApplicationsByInfluencer(influencerProfileId: string) {
  return db.application.findMany({
    where: { influencerProfileId },
    orderBy: { createdAt: "desc" },
    include: {
      campaign: {
        select: {
          id: true,
          title: true,
          status: true,
          deadline: true,
          budgetMin: true,
          budgetMax: true,
          companyProfile: { select: { companyName: true, logo: true } },
        },
      },
    },
  });
}

export async function getAcceptedApplicationCount(campaignId: string) {
  return db.application.count({
    where: { campaignId, status: "ACCEPTED" },
  });
}

export async function createApplication(data: {
  campaignId: string;
  influencerProfileId: string;
  coverLetter: string;
  proposedRate: number;
}) {
  return db.application.create({ data });
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  return db.application.update({ where: { id }, data: { status } });
}
