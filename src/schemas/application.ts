import { z } from "zod";

export const applicationSchema = z.object({
  campaignId: z.string().cuid("Invalid campaign ID"),
  coverLetter: z.string().min(50, "Cover letter must be at least 50 characters").max(2000),
  proposedRate: z.coerce.number().int().min(100, "Minimum rate is $1"),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
