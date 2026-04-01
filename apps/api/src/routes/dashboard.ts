import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import {
  calculateBalance,
  calculateBudgetByCategory,
  computeHealthScore,
} from "@financials/core";
import type { Transaction } from "@financials/shared";
import { toReferenceMonth, startOfMonth, startOfNextMonth } from "../lib/month.js";

export async function dashboardRoutes(app: FastifyInstance) {
  // GET /api/dashboard
  app.get("/", async (req, reply) => {
    const currentMonth = toReferenceMonth(new Date());

    // Se o mês atual não tem transações, usar o mês mais recente com dados
    const currentMonthCount = await prisma.transaction.count({
      where: {
        userId: req.userId,
        date: { gte: startOfMonth(currentMonth), lt: startOfNextMonth(currentMonth) },
      },
    });

    let refMonth = currentMonth;
    if (currentMonthCount === 0) {
      const lastTx = await prisma.transaction.findFirst({
        where: { userId: req.userId },
        orderBy: { date: "desc" },
        select: { date: true },
      });
      if (lastTx) refMonth = toReferenceMonth(new Date(lastTx.date));
    }

    // Buscar as transações recentes sempre (não é agregado, não vai para o summary)
    const recentRows = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
        date: {
          gte: startOfMonth(refMonth),
          lt: startOfNextMonth(refMonth),
        },
      },
      orderBy: { date: "desc" },
      take: 10,
    });

    const recentTransactions = recentRows.map((t) => ({
      ...t,
      amount: Number(t.amount),
    }));

    // Caminho rápido: ler do read model
    const summary = await prisma.monthSummary.findUnique({
      where: { userId_referenceMonth: { userId: req.userId, referenceMonth: refMonth } },
    });

    if (summary) {
      return reply.send({
        balance: {
          totalIncome: Number(summary.totalIncome),
          totalExpenses: Number(summary.totalExpenses),
          balance: Number(summary.balance),
        },
        health: {
          score: summary.healthScore,
          level: summary.healthLevel,
          alerts: summary.healthAlerts as string[],
        },
        budget: { byCategory: summary.budgetByCategory },
        recentTransactions,
      });
    }

    // Fallback: cálculo ao vivo (mês sem summary — primeiro acesso ou dado legado)
    const rows = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
        date: {
          gte: startOfMonth(refMonth),
          lt: startOfNextMonth(refMonth),
        },
      },
    });

    const tx = rows.map((t) => ({
      ...t,
      amount: Number(t.amount),
    })) as unknown as Transaction[];

    return reply.send({
      balance: calculateBalance(tx),
      budget: calculateBudgetByCategory(tx),
      health: computeHealthScore(tx),
      recentTransactions,
    });
  });
}
