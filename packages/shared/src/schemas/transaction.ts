import { z } from "zod";

export const TransactionTypeSchema = z.enum(["INCOME", "EXPENSE"]);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const TransactionCategorySchema = z.enum([
  "HOUSING",       // moradia
  "FOOD",          // alimentação
  "TRANSPORT",     // transporte
  "HEALTH",        // saúde
  "EDUCATION",     // educação
  "ENTERTAINMENT", // lazer
  "CLOTHING",      // vestuário
  "SALARY",        // salário
  "INVESTMENT",    // investimento
  "OTHER",         // outros
]);
export type TransactionCategory = z.infer<typeof TransactionCategorySchema>;

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive(),
  type: TransactionTypeSchema,
  category: TransactionCategorySchema,
  description: z.string().min(1).max(255),
  date: z.coerce.date(),
  isRecurring: z.boolean().default(false),
  recurringRuleId: z.string().uuid().nullable().default(null),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Transaction = z.infer<typeof TransactionSchema>;

export const CreateTransactionSchema = TransactionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
