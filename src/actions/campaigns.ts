"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { campaignSchema } from "@/schemas/campaign";
import {
  createCampaign as dbCreateCampaign,
  updateCampaign as dbUpdateCampaign,
  deleteCampaign as dbDeleteCampaign,
  publishCampaign as dbPublishCampaign,
  getCampaignById,
} from "@/services/campaign.service";
import { getCompanyProfile } from "@/services/profile.service";

async function getCompanyProfileOrError(userId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role !== "COMPANY") return { error: "Unauthorized" };

  const profile = await getCompanyProfile(userId);
  if (!profile) return { error: "Complete your company profile first" };

  return { profile, session };
}

export async function createCampaign(formData: unknown, publish = false) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const check = await getCompanyProfileOrError(session.user.id);
  if ("error" in check) return { success: false, error: check.error };
  const { profile } = check;

  const result = campaignSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const {
    title,
    description,
    requirements,
    niches,
    platforms,
    budgetMin,
    budgetMax,
    deliverables,
    deadline,
    maxInfluencers,
  } = result.data;

  const campaign = await dbCreateCampaign(profile.id, {
    title,
    description,
    requirements,
    niches,
    platforms,
    budgetMin: budgetMin * 100, // dollars → cents
    budgetMax: budgetMax * 100,
    deliverables,
    deadline: new Date(deadline),
    maxInfluencers,
    status: publish ? "OPEN" : "DRAFT",
  });

  revalidatePath("/campaigns");
  revalidatePath("/dashboard");
  return { success: true, campaignId: campaign.id };
}

export async function updateCampaign(id: string, formData: unknown) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };
  if (session.user.role !== "COMPANY")
    return { success: false, error: "Unauthorized" };

  const campaign = await getCampaignById(id);
  if (!campaign) return { success: false, error: "Campaign not found" };

  const profile = await getCompanyProfile(session.user.id);
  if (!profile || campaign.companyProfileId !== profile.id)
    return { success: false, error: "Unauthorized" };

  const result = campaignSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const {
    title,
    description,
    requirements,
    niches,
    platforms,
    budgetMin,
    budgetMax,
    deliverables,
    deadline,
    maxInfluencers,
  } = result.data;

  await dbUpdateCampaign(id, {
    title,
    description,
    requirements,
    niches,
    platforms,
    budgetMin: budgetMin * 100,
    budgetMax: budgetMax * 100,
    deliverables,
    deadline: new Date(deadline),
    maxInfluencers,
  });

  revalidatePath(`/campaigns/${id}`);
  revalidatePath(`/campaigns/${id}/edit`);
  revalidatePath("/campaigns");
  return { success: true };
}

export async function deleteCampaign(id: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };
  if (session.user.role !== "COMPANY")
    return { success: false, error: "Unauthorized" };

  const campaign = await getCampaignById(id);
  if (!campaign) return { success: false, error: "Campaign not found" };

  const profile = await getCompanyProfile(session.user.id);
  if (!profile || campaign.companyProfileId !== profile.id)
    return { success: false, error: "Unauthorized" };

  if (campaign.status !== "DRAFT")
    return { success: false, error: "Only draft campaigns can be deleted" };

  await dbDeleteCampaign(id);

  revalidatePath("/campaigns");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function publishCampaign(id: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };
  if (session.user.role !== "COMPANY")
    return { success: false, error: "Unauthorized" };

  const campaign = await getCampaignById(id);
  if (!campaign) return { success: false, error: "Campaign not found" };

  const profile = await getCompanyProfile(session.user.id);
  if (!profile || campaign.companyProfileId !== profile.id)
    return { success: false, error: "Unauthorized" };

  if (campaign.status !== "DRAFT")
    return { success: false, error: "Only draft campaigns can be published" };

  await dbPublishCampaign(id);

  revalidatePath(`/campaigns/${id}`);
  revalidatePath("/campaigns");
  revalidatePath("/dashboard");
  return { success: true };
}
