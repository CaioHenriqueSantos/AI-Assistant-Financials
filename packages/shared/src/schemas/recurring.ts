import { z } from "zod";
import { TransactionCategorySchema, TransactionTypeSchema } from "./transaction.js";

export const FrequencySchema = z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]);
export type Frequency = z.infer<typeof FrequencySchema>;

export const RecurringRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  amount: z.number().positive(),
  type: TransactionTypeSchema,
  category: TransactionCategorySchema,
  frequency: FrequencySchema,
  nextDate: z.coerce.date(),
  active: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type RecurringRule = z.infer<typeof RecurringRuleSchema>;

export const CreateRecurringRuleSchema = RecurringRuleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateRecurringRuleInput = z.infer<typeof CreateRecurringRuleSchema>;
