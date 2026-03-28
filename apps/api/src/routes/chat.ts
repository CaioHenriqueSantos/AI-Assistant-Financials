import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { groq } from "../lib/groq.js";
import { FINANCIAL_TOOLS, executeTool } from "@financials/mcp";
import { SendMessageSchema } from "@financials/shared";
import type { Transaction, RecurringRule } from "@financials/shared";
import type Groq from "groq-sdk";
import { sanitizeUserMessage } from "../lib/ai-guard.js";

const SYSTEM_PROMPT = `Você é o Financials IA, um assistente financeiro pessoal inteligente e empático.

Sua missão é ajudar o usuário a entender sua situação financeira, identificar problemas e criar planos de ação claros.

Regras importantes:
- SEMPRE use as tools disponíveis para buscar dados reais antes de responder sobre finanças
- NUNCA invente números ou faça suposições sem consultar os dados
- Responda em português, de forma clara e direta
- Seja objetivo nas análises e ações sugeridas
- Use valores reais dos dados para embasar qualquer recomendação`;

export async function chatRoutes(app: FastifyInstance) {
  // GET /api/chat/history
  app.get("/history", async (req, reply) => {
    const messages = await prisma.chatMessage.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "asc" },
      take: 100,
    });
    return reply.send(messages);
  });


  // POST /api/chat
  app.post("/", {
    config: {
      rateLimit: {
        max: 30,
        timeWindow: "1 minute",
      },
    },
    handler: async (req, reply) => {
    const parsed = SendMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    const message = sanitizeUserMessage(parsed.data.message);

    await prisma.chatMessage.create({
      data: { role: "user", content: message, userId: req.userId },
    });

    const history = await prisma.chatMessage.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const deps = {
      getTransactions: async (filters: { period: string; category?: string; type?: string }) => {
        const where: Record<string, unknown> = { userId: req.userId };
        if (filters.type) where["type"] = filters.type;
        if (filters.category) where["category"] = filters.category;

        if (filters.period !== "all") {
          const now = new Date();
          const from = new Date();
          if (filters.period === "current_month") from.setDate(1);
          else if (filters.period === "last_month") {
            from.setMonth(from.getMonth() - 1);
            from.setDate(1);
            now.setDate(0);
          } else if (filters.period === "last_3_months") {
            from.setMonth(from.getMonth() - 3);
          }
          where["date"] = { gte: from, lte: now };
        }

        return prisma.transaction.findMany({ where, orderBy: { date: "desc" } }) as Promise<Transaction[]>;
      },
      getRecurringRules: async (filters: { type?: string }) => {
        const where: Record<string, unknown> = { active: true, userId: req.userId };
        if (filters.type) where["type"] = filters.type;
        return prisma.recurringRule.findMany({ where }) as Promise<RecurringRule[]>;
      },
    };

    let currentMessages: Groq.Chat.ChatCompletionMessageParam[] = history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    let continueLoop = true;
    let assistantContent = "";
    let toolCallsLog: unknown[] = [];

    while (continueLoop) {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1024,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...currentMessages],
        tools: FINANCIAL_TOOLS,
        tool_choice: "auto",
      });

      const choice = response.choices[0];
      if (!choice) { continueLoop = false; continue; }

      if (choice.finish_reason === "tool_calls" && choice.message.tool_calls) {
        const toolCalls = choice.message.tool_calls;
        toolCallsLog = [...toolCallsLog, ...toolCalls];

        currentMessages = [...currentMessages, choice.message];

        const toolResults: Groq.Chat.ChatCompletionToolMessageParam[] = await Promise.all(
          toolCalls.map(async (toolCall) => {
            const result = await executeTool(
              toolCall.function.name,
              JSON.parse(toolCall.function.arguments),
              deps
            );
            return {
              role: "tool" as const,
              tool_call_id: toolCall.id,
              content: result,
            };
          })
        );

        currentMessages = [...currentMessages, ...toolResults];
      } else {
        assistantContent = choice.message.content ?? "";
        continueLoop = false;
      }
    }

    const saved = await prisma.chatMessage.create({
      data: {
        role: "assistant",
        content: assistantContent,
        ...(toolCallsLog.length > 0 ? { toolCalls: JSON.parse(JSON.stringify(toolCallsLog)) } : {}),
        userId: req.userId,
      },
    });

    return reply.send({ message: saved.content, id: saved.id });
    },
  });
}
