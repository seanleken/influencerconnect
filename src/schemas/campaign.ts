import { z } from "zod";
import { Niche, SocialPlatform } from "@prisma/client";

// Budget fields are in dollars (form input). Actions convert to cents for storage.
export const campaignSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(20, "Description must be at least 20 characters"),
  requirements: z.string().min(10, "Requirements must be at least 10 characters"),
  niches: z.array(z.nativeEnum(Niche)).min(1, "Select at least one niche"),
  platforms: z.array(z.nativeEnum(SocialPlatform)).min(1, "Select at least one platform"),
  budgetMin: z.coerce.number().int().min(1, "Minimum budget is $1"),
  budgetMax: z.coerce.number().int().min(1, "Maximum budget is $1"),
  deliverables: z.string().min(10, "Deliverables must be at least 10 characters"),
  deadline: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date > new Date();
  }, { message: "Deadline must be a future date" }),
  maxInfluencers: z.coerce.number().int().min(1).max(100).default(1),
}).refine((data) => data.budgetMax >= data.budgetMin, {
  message: "Maximum budget must be at least the minimum",
  path: ["budgetMax"],
});

export type CampaignInput = z.infer<typeof campaignSchema>;
