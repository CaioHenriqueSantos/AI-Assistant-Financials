import Fastify from "fastify";
import cors from "@fastify/cors";
import { transactionsRoutes } from "./routes/transactions.js";
import { recurringRoutes } from "./routes/recurring.js";
import { chatRoutes } from "./routes/chat.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { auth } from "./lib/auth.js";
import { requireAuth } from "./middleware/auth.js";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: "http://localhost:5173",
  credentials: true,
});

// Health check
app.get("/api/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

// Auth routes (Better Auth handler)
app.all("/api/auth/*", async (req, reply) => {
  const url = `http://localhost:3001${req.url}`;
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const request = new Request(url, {
    method: req.method,
    headers: req.headers as Record<string, string>,
    ...(hasBody && { body: JSON.stringify(req.body) }),
  });

  const response = await auth.handler(request);

  response.headers.forEach((value, key) => {
    reply.header(key, value);
  });

  reply.status(response.status);
  return reply.send(await response.text());
});

// Protege todas as rotas /api/* exceto /api/auth/* e /api/health
app.addHook("preHandler", async (req, reply) => {
  if (req.url.startsWith("/api/auth") || req.url === "/api/health") return;
  return requireAuth(req, reply);
});



// Routes
await app.register(transactionsRoutes, { prefix: "/api/transactions" });
await app.register(recurringRoutes, { prefix: "/api/recurring" });
await app.register(chatRoutes, { prefix: "/api/chat" });
await app.register(dashboardRoutes, { prefix: "/api/dashboard" });

const port = Number(process.env["PORT"] ?? 3001);

try {
  await app.listen({ port, host: "0.0.0.0" });
  console.log(`API rodando em http://localhost:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
