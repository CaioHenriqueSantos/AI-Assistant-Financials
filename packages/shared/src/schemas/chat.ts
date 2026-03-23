import { z } from "zod";

export const ChatRoleSchema = z.enum(["user", "assistant"]);
export type ChatRole = z.infer<typeof ChatRoleSchema>;

export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  role: ChatRoleSchema,
  content: z.string(),
  toolCalls: z.unknown().nullable().default(null),
  createdAt: z.coerce.date(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const SendMessageSchema = z.object({
  message: z.string().min(1).max(2000),
});
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
