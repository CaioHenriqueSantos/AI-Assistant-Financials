import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { CreateRecurringRuleSchema } from "@financials/shared";

export async function recurringRoutes(app: FastifyInstance) {
  // GET /api/recurring
  app.get("/", async (req, reply) => {
    const { type } = req.query as { type?: string };
    const where: Record<string, unknown> = { active: true, userId: req.userId };
    if (type) where["type"] = type;

    const rules = await prisma.recurringRule.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return reply.send(rules);
  });

  // POST /api/recurring
  app.post("/", async (req, reply) => {
    const parsed = CreateRecurringRuleSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    const rule = await prisma.recurringRule.create({
      data: { ...parsed.data, userId: req.userId }
    });
    return reply.status(201).send(rule);
  });

  // DELETE /api/recurring/:id (soft delete)
  app.delete("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    await prisma.recurringRule.update({
      where: { id, userId: req.userId },
      data: { active: false },
    });
    return reply.status(204).send();
  });
}
