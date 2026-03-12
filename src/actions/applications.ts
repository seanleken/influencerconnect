"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { applicationSchema } from "@/schemas/application";
import { getInfluencerProfile, getCompanyProfile } from "@/services/profile.service";
import { getCampaignById } from "@/services/campaign.service";
import {
  createApplication,
  getApplicationById,
  getApplicationByInfluencerAndCampaign,
  getAcceptedApplicationCount,
  updateApplicationStatus,
} from "@/services/application.service";

export async function submitApplication(formData: unknown) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };
  if (session.user.role !== "INFLUENCER") return { success: false, error: "Unauthorized" };

  const profile = await getInfluencerProfile(session.user.id);
  if (!profile) return { success: false, error: "Complete your influencer profile first" };

  const result = applicationSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { campaignId, coverLetter, proposedRate } = result.data;

  const campaign = await getCampaignById(campaignId);
  if (!campaign) return { success: false, error: "Campaign not found" };
  if (campaign.status !== "OPEN") return { success: false, error: "This campaign is not accepting applications" };

  const existing = await getApplicationByInfluencerAndCampaign(profile.id, campaignId);
  if (existing) return { success: false, error: "You have already applied to this campaign" };

  const application = await createApplication({
    campaignId,
    influencerProfileId: profile.id,
    coverLetter,
    proposedRate: proposedRate * 100, // dollars → cents
  });

  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/applications");
  return { success: true, applicationId: application.id };
}

export async function withdrawApplication(applicationId: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };
  if (session.user.role !== "INFLUENCER") return { success: false, error: "Unauthorized" };

  const profile = await getInfluencerProfile(session.user.id);
  if (!profile) return { success: false, error: "Profile not found" };

  const application = await getApplicationById(applicationId);
  if (!application) return { success: false, error: "Application not found" };
  if (application.influencerProfile.userId !== session.user.id) {
    return { success: false, error: "Unauthorized" };
  }
  if (application.status !== "PENDING") {
    return { success: false, error: "Only pending applications can be withdrawn" };
  }

  await updateApplicationStatus(applicationId, "WITHDRAWN");

  revalidatePath(`/campaigns/${application.campaign.id}`);
  revalidatePath("/applications");
  return { success: true };
}

export async function acceptApplication(applicationId: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };
  if (session.user.role !== "COMPANY") return { success: false, error: "Unauthorized" };

  const profile = await getCompanyProfile(session.user.id);
  if (!profile) return { success: false, error: "Profile not found" };

  const application = await getApplicationById(applicationId);
  if (!application) return { success: false, error: "Application not found" };
  if (application.campaign.companyProfileId !== profile.id) {
    return { success: false, error: "Unauthorized" };
  }
  if (application.status !== "PENDING") {
    return { success: false, error: "Only pending applications can be accepted" };
  }

  const acceptedCount = await getAcceptedApplicationCount(application.campaign.id);
  if (acceptedCount >= application.campaign.maxInfluencers) {
    return { success: false, error: "Maximum number of influencers already accepted" };
  }

  await updateApplicationStatus(applicationId, "ACCEPTED");

  revalidatePath(`/campaigns/${application.campaign.id}/applications`);
  revalidatePath(`/campaigns/${application.campaign.id}`);
  return { success: true };
}

export async function rejectApplication(applicationId: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };
  if (session.user.role !== "COMPANY") return { success: false, error: "Unauthorized" };

  const profile = await getCompanyProfile(session.user.id);
  if (!profile) return { success: false, error: "Profile not found" };

  const application = await getApplicationById(applicationId);
  if (!application) return { success: false, error: "Application not found" };
  if (application.campaign.companyProfileId !== profile.id) {
    return { success: false, error: "Unauthorized" };
  }
  if (application.status !== "PENDING") {
    return { success: false, error: "Only pending applications can be rejected" };
  }

  await updateApplicationStatus(applicationId, "REJECTED");

  revalidatePath(`/campaigns/${application.campaign.id}/applications`);
  return { success: true };
}
