import { z } from "zod";

export const sendMessageSchema = z.object({
  conversationId: z.string().cuid("Invalid conversation ID"),
  content: z.string().max(5000).default(""),
  fileUrl: z.string().url().optional(),
}).refine((d) => d.content.trim().length > 0 || !!d.fileUrl, {
  message: "Message cannot be empty",
  path: ["content"],
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
