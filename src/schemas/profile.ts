import { z } from "zod";
import { Niche, SocialPlatform } from "@prisma/client";

export const socialLinkSchema = z.object({
  platform: z.nativeEnum(SocialPlatform),
  url: z.string().optional().or(z.literal("")),
  handle: z.string().optional(),
  followerCount: z.coerce.number().int().min(0).optional().nullable(),
});

export const influencerProfileSchema = z.object({
  bio: z.string().min(10, "Bio must be at least 10 characters").max(1000),
  niches: z.array(z.nativeEnum(Niche)).min(1, "Select at least one niche"),
  location: z.string().optional(),
  ratePerPost: z.coerce.number().int().min(0).optional().nullable(),
  ratePerStory: z.coerce.number().int().min(0).optional().nullable(),
  ratePerVideo: z.coerce.number().int().min(0).optional().nullable(),
  portfolioUrls: z.array(z.string().url("Invalid portfolio URL")).optional(),
  isAvailable: z.boolean().default(true),
  socialLinks: z.array(socialLinkSchema).optional(),
});

export const companyProfileSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(200),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  industry: z.string().min(1, "Industry is required"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000),
  size: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]).optional(),
});

export type InfluencerProfileInput = z.infer<typeof influencerProfileSchema>;
export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
