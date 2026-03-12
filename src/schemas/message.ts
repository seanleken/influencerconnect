import { z } from "zod";

export const sendMessageSchema = z.object({
  conversationId: z.string().cuid("Invalid conversation ID"),
  content: z.string().min(1, "Message cannot be empty").max(5000),
  fileUrl: z.string().url().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
