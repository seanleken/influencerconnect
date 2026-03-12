import { z } from "zod";
import { Niche, SocialPlatform } from "@prisma/client";

export const campaignSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(20, "Description must be at least 20 characters"),
  requirements: z.string().min(10, "Requirements must be at least 10 characters"),
  niches: z.array(z.nativeEnum(Niche)).min(1, "Select at least one niche"),
  platforms: z.array(z.nativeEnum(SocialPlatform)).min(1, "Select at least one platform"),
  budgetMin: z.coerce.number().int().min(100, "Minimum budget is $1"),
  budgetMax: z.coerce.number().int().min(100, "Maximum budget is $1"),
  deliverables: z.string().min(10, "Deliverables must be at least 10 characters"),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid deadline date",
  }),
  maxInfluencers: z.coerce.number().int().min(1).max(100).default(1),
}).refine((data) => data.budgetMax >= data.budgetMin, {
  message: "Maximum budget must be greater than minimum budget",
  path: ["budgetMax"],
});

export type CampaignInput = z.infer<typeof campaignSchema>;
