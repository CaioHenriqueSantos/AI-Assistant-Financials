import type { FastifyRequest, FastifyReply } from "fastify";
import { auth } from "../lib/auth.js";

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  const session = await auth.api.getSession({
    headers: req.headers as Record<string, string>,
  });

  if (!session) {
    return reply.status(401).send({ error: "Não autenticado" });
  }

  req.userId = session.user.id;
}

declare module "fastify" {
  interface FastifyRequest {
    userId: string;
  }
}
