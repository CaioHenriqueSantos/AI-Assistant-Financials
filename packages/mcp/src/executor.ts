import {
  calculateBalance,
  calculateBudgetByCategory,
  computeHealthScore,
  forecastCashflow,
} from "@financials/core";
import type { Transaction, RecurringRule } from "@financials/shared";

export interface ToolDependencies {
  getTransactions: (filters: { period: string; category?: string; type?: string }) => Promise<Transaction[]>;
  getRecurringRules: (filters: { type?: string }) => Promise<RecurringRule[]>;
}

/**
 * Executa uma tool financeira e retorna o resultado como string JSON.
 * Esta função é chamada pela rota /api/chat após o assistente solicitar uma tool.
 */
export async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  deps: ToolDependencies
): Promise<string> {
  switch (toolName) {
    case "get_balance": {
      const period = String(toolInput["period"] ?? "current_month");
      const transactions = await deps.getTransactions({ period });
      const result = calculateBalance(transactions);
      return JSON.stringify(result);
    }

    case "get_transactions": {
      const period = String(toolInput["period"] ?? "current_month");
      const category = toolInput["category"] ? String(toolInput["category"]) : undefined;
      const type = toolInput["type"] ? String(toolInput["type"]) : undefined;
      const transactions = await deps.getTransactions({
        period,
        ...(category !== undefined && { category }),
        ...(type !== undefined && { type }),
      });
      return JSON.stringify({ count: transactions.length, transactions });
    }

    case "get_budget_by_category": {
      const period = String(toolInput["period"] ?? "current_month");
      const transactions = await deps.getTransactions({ period });
      const result = calculateBudgetByCategory(transactions);
      return JSON.stringify(result);
    }

    case "get_recurring": {
      const type = toolInput["type"] ? String(toolInput["type"]) : undefined;
      const rules = await deps.getRecurringRules({
        ...(type !== undefined && { type }),
      });
      return JSON.stringify({ count: rules.length, rules });
    }

    case "get_health_score": {
      const period = String(toolInput["period"] ?? "current_month");
      const transactions = await deps.getTransactions({ period });
      const result = computeHealthScore(transactions);
      return JSON.stringify(result);
    }

    case "get_cashflow_forecast": {
      const daysAhead = Math.min(Number(toolInput["days_ahead"] ?? 30), 90);
      const [transactions, rules] = await Promise.all([
        deps.getTransactions({ period: "all" }),
        deps.getRecurringRules({}),
      ]);
      const result = forecastCashflow(transactions, rules, daysAhead);
      // Retorna só o resumo (não todos os dias, para não poluir o contexto)
      return JSON.stringify({
        currentBalance: result.currentBalance,
        lowestBalance: result.lowestBalance,
        lowestDate: result.lowestDate,
        daysProjected: daysAhead,
      });
    }

    default:
      return JSON.stringify({ error: `Tool desconhecida: ${toolName}` });
  }
}
