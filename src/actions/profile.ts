"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  influencerProfileSchema,
  companyProfileSchema,
} from "@/schemas/profile";
import {
  upsertInfluencerProfile,
  upsertCompanyProfile,
} from "@/services/profile.service";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function saveInfluencerProfile(formData: unknown) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };
  if (session.user.role !== "INFLUENCER")
    return { success: false, error: "Unauthorized" };

  const result = influencerProfileSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const {
    bio,
    niches,
    location,
    ratePerPost,
    ratePerStory,
    ratePerVideo,
    portfolioUrls,
    isAvailable,
    socialLinks,
    image,
    mediaKitUrl,
  } = result.data;

  await Promise.all([
    upsertInfluencerProfile(session.user.id, {
      bio,
      niches,
      location: location || null,
      ratePerPost: ratePerPost != null ? ratePerPost * 100 : null,
      ratePerStory: ratePerStory != null ? ratePerStory * 100 : null,
      ratePerVideo: ratePerVideo != null ? ratePerVideo * 100 : null,
      portfolioUrls: portfolioUrls ?? [],
      isAvailable,
      socialLinks: (socialLinks ?? []) as Prisma.InputJsonValue,
      mediaKitUrl: mediaKitUrl ?? null,
    }),
    image !== undefined
      ? db.user.update({ where: { id: session.user.id }, data: { image: image || null } })
      : Promise.resolve(),
  ]);

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function saveCompanyProfile(formData: unknown) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };
  if (session.user.role !== "COMPANY")
    return { success: false, error: "Unauthorized" };

  const result = companyProfileSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { companyName, website, industry, description, size, image, logo } = result.data;

  await Promise.all([
    upsertCompanyProfile(session.user.id, {
      companyName,
      website: website || null,
      industry,
      description,
      size: size ?? null,
      logo: logo ?? null,
    }),
    image !== undefined
      ? db.user.update({ where: { id: session.user.id }, data: { image: image || null } })
      : Promise.resolve(),
  ]);

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true };
}
