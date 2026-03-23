import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { CreateTransactionSchema } from "@financials/shared";

export async function transactionsRoutes(app: FastifyInstance) {
  // GET /api/transactions
  app.get("/", async (req, reply) => {
    const { period, category, type } = req.query as Record<string, string | undefined>;

    const where: Record<string, unknown> = {};

    if (type) where["type"] = type;
    if (category) where["category"] = category;

    if (period && period !== "all") {
      const now = new Date();
      const from = new Date();
      if (period === "current_month") from.setDate(1);
      else if (period === "last_month") {
        from.setMonth(from.getMonth() - 1);
        from.setDate(1);
        now.setDate(0); // último dia do mês passado
      } else if (period === "last_3_months") {
        from.setMonth(from.getMonth() - 3);
      }
      where["date"] = { gte: from, lte: now };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return reply.send(transactions);
  });

  // POST /api/transactions
  app.post("/", async (req, reply) => {
    const parsed = CreateTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    const transaction = await prisma.transaction.create({
      data: {
        ...parsed.data,
        date: parsed.data.date,
      },
    });

    return reply.status(201).send(transaction);
  });

  // DELETE /api/transactions/:id
  app.delete("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    await prisma.transaction.delete({ where: { id } });
    return reply.status(204).send();
  });
}
