import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import {
  calculateBalance,
  calculateBudgetByCategory,
  computeHealthScore,
} from "@financials/core";
import type { Transaction } from "@financials/shared";

export async function dashboardRoutes(app: FastifyInstance) {
  // GET /api/dashboard
  app.get("/", async (req, reply) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const transactions = await prisma.transaction.findMany({
      where: { date: { gte: startOfMonth }, userId: req.userId },
      orderBy: { date: "desc" },
    });

    const tx = transactions as Transaction[];

    return reply.send({
      balance: calculateBalance(tx),
      budget: calculateBudgetByCategory(tx),
      health: computeHealthScore(tx),
      recentTransactions: tx.slice(0, 10),
    });
  });
}
