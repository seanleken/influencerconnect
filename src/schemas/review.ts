import { z } from "zod";

export const reviewSchema = z.object({
  applicationId: z.string().cuid("Invalid application ID"),
  revieweeId: z.string().cuid("Invalid reviewee ID"),
  rating: z.coerce.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().min(10, "Comment must be at least 10 characters").max(1000),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
