import { prisma } from "./prisma.js";
import { startOfMonth, startOfNextMonth } from "./month.js";
import {
  calculateBalance,
  calculateBudgetByCategory,
  computeHealthScore,
} from "@financials/core";
import type { Transaction } from "@financials/shared";

export async function recalculateMonth(
  userId: string,
  referenceMonth: string
): Promise<void> {
  const rows = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonth(referenceMonth),
        lt: startOfNextMonth(referenceMonth),
      },
    },
  });

  // Converter Prisma.Decimal → number para as funções do core
  const tx = rows.map((t) => ({
    ...t,
    amount: Number(t.amount),
  })) as unknown as Transaction[];

  const balance = calculateBalance(tx);
  const budget = calculateBudgetByCategory(tx);
  const health = computeHealthScore(tx);

  await prisma.monthSummary.upsert({
    where: { userId_referenceMonth: { userId, referenceMonth } },
    create: {
      userId,
      referenceMonth,
      totalIncome: balance.totalIncome,
      totalExpenses: balance.totalExpenses,
      balance: balance.balance,
      healthScore: health.score,
      healthLevel: health.level,
      healthAlerts: health.alerts,
      budgetByCategory: JSON.parse(JSON.stringify(budget.byCategory)),
    },
    update: {
      totalIncome: balance.totalIncome,
      totalExpenses: balance.totalExpenses,
      balance: balance.balance,
      healthScore: health.score,
      healthLevel: health.level,
      healthAlerts: health.alerts,
      budgetByCategory: JSON.parse(JSON.stringify(budget.byCategory)),
    },
  });
}
