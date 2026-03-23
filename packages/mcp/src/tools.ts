/**
 * Definição das tools financeiras disponíveis para o assistente IA.
 * Cada tool descreve sua função e parâmetros em JSON Schema.
 */

export const FINANCIAL_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "get_balance",
      description: "Retorna o saldo atual do usuário com total de receitas e despesas do período informado.",
      parameters: {
        type: "object",
        properties: {
          period: {
            type: "string",
            enum: ["current_month", "last_month", "last_3_months", "all"],
            description: "Período para calcular o saldo.",
          },
        },
        required: ["period"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_transactions",
      description: "Lista as transações do usuário com filtros opcionais de período e categoria.",
      parameters: {
        type: "object",
        properties: {
          period: {
            type: "string",
            enum: ["current_month", "last_month", "last_3_months", "all"],
          },
          category: { type: "string", description: "Filtrar por categoria específica (opcional)." },
          type: { type: "string", enum: ["INCOME", "EXPENSE"], description: "Filtrar por tipo (opcional)." },
        },
        required: ["period"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_budget_by_category",
      description: "Retorna os gastos agrupados por categoria com percentuais em relação ao total.",
      parameters: {
        type: "object",
        properties: {
          period: { type: "string", enum: ["current_month", "last_month", "last_3_months", "all"] },
        },
        required: ["period"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_recurring",
      description: "Lista todas as regras de receitas e despesas recorrentes cadastradas.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["INCOME", "EXPENSE"], description: "Filtrar por tipo (opcional)." },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_health_score",
      description: "Calcula e retorna o score de saúde financeira (0–100) com alertas.",
      parameters: {
        type: "object",
        properties: {
          period: { type: "string", enum: ["current_month", "last_month", "last_3_months", "all"] },
        },
        required: ["period"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_cashflow_forecast",
      description: "Projeta o saldo futuro com base nas recorrências cadastradas.",
      parameters: {
        type: "object",
        properties: {
          days_ahead: { type: "number", description: "Quantos dias à frente projetar (padrão: 30, máximo: 90)." },
        },
      },
    },
  },
];
