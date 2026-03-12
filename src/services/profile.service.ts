import { db } from "@/lib/db";
import type { Niche, Prisma } from "@prisma/client";

export async function getInfluencerProfile(userId: string) {
  return db.influencerProfile.findUnique({ where: { userId } });
}

export async function getCompanyProfile(userId: string) {
  return db.companyProfile.findUnique({ where: { userId } });
}

type InfluencerProfileData = {
  bio: string;
  niches: Niche[];
  location?: string | null;
  ratePerPost?: number | null;
  ratePerStory?: number | null;
  ratePerVideo?: number | null;
  portfolioUrls?: string[];
  isAvailable: boolean;
  socialLinks?: Prisma.InputJsonValue;
};

type CompanyProfileData = {
  companyName: string;
  website?: string | null;
  industry: string;
  description: string;
  size?: string | null;
};

export async function upsertInfluencerProfile(
  userId: string,
  data: InfluencerProfileData
) {
  return db.influencerProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

export async function upsertCompanyProfile(
  userId: string,
  data: CompanyProfileData
) {
  return db.companyProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}
