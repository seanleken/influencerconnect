import { db } from "@/lib/db";
import type { Niche, SocialPlatform, CampaignStatus, Prisma } from "@prisma/client";

export const CAMPAIGNS_PAGE_SIZE = 12;

type GetCampaignsParams = {
  search?: string;
  niches?: Niche[];
  platforms?: SocialPlatform[];
  budgetMin?: number; // cents
  budgetMax?: number; // cents
  sort?: "newest" | "deadline" | "budget";
  page?: number;
  statusFilter?: CampaignStatus[];
};

function buildOrderBy(
  sort: string
): Prisma.CampaignOrderByWithRelationInput {
  if (sort === "deadline") return { deadline: "asc" };
  if (sort === "budget") return { budgetMax: "desc" };
  return { createdAt: "desc" };
}

export async function getCampaigns({
  search,
  niches,
  platforms,
  budgetMin,
  budgetMax,
  sort = "newest",
  page = 1,
  statusFilter = ["OPEN"],
}: GetCampaignsParams = {}) {
  const where: Prisma.CampaignWhereInput = {
    status: { in: statusFilter },
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(niches?.length && { niches: { hasSome: niches } }),
    ...(platforms?.length && { platforms: { hasSome: platforms } }),
    ...(budgetMin != null && { budgetMax: { gte: budgetMin } }),
    ...(budgetMax != null && { budgetMin: { lte: budgetMax } }),
  };

  const [campaigns, total] = await Promise.all([
    db.campaign.findMany({
      where,
      orderBy: buildOrderBy(sort),
      take: CAMPAIGNS_PAGE_SIZE,
      skip: (page - 1) * CAMPAIGNS_PAGE_SIZE,
      include: {
        companyProfile: { select: { companyName: true, logo: true } },
      },
    }),
    db.campaign.count({ where }),
  ]);

  return { campaigns, total };
}

export async function getCampaignById(id: string) {
  return db.campaign.findUnique({
    where: { id },
    include: {
      companyProfile: {
        select: {
          companyName: true,
          logo: true,
          userId: true,
          industry: true,
          website: true,
        },
      },
      _count: { select: { applications: true } },
    },
  });
}

export async function getCampaignsByCompany(companyProfileId: string) {
  return db.campaign.findMany({
    where: { companyProfileId },
    orderBy: { createdAt: "desc" },
    include: {
      companyProfile: { select: { companyName: true, logo: true } },
      _count: { select: { applications: true } },
    },
  });
}

type CampaignData = {
  title: string;
  description: string;
  requirements: string;
  niches: Niche[];
  platforms: SocialPlatform[];
  budgetMin: number; // cents
  budgetMax: number; // cents
  deliverables: string;
  deadline: Date;
  maxInfluencers: number;
  briefUrl?: string | null;
  status: CampaignStatus;
};

export async function createCampaign(
  companyProfileId: string,
  data: CampaignData
) {
  return db.campaign.create({ data: { companyProfileId, ...data } });
}

export async function updateCampaign(id: string, data: Partial<CampaignData>) {
  return db.campaign.update({ where: { id }, data });
}

export async function deleteCampaign(id: string) {
  return db.campaign.delete({ where: { id } });
}

export async function publishCampaign(id: string) {
  return db.campaign.update({
    where: { id },
    data: { status: "OPEN" },
  });
}
