import type { Transaction } from "@financials/shared";
import { calculateBalance } from "./balance.js";
import { calculateBudgetByCategory } from "./budget.js";

export interface HealthScoreResult {
  score: number; // 0–100
  level: "critical" | "poor" | "fair" | "good" | "excellent";
  breakdown: {
    balanceScore: number;
    housingRatioScore: number;
    diversityScore: number;
  };
  alerts: string[];
}

export function computeHealthScore(transactions: Transaction[]): HealthScoreResult {
  const { totalIncome, totalExpenses, balance } = calculateBalance(transactions);
  const { byCategory } = calculateBudgetByCategory(transactions);
  const alerts: string[] = [];

  // 1. Balance score (0–40): saldo positivo é fundamental
  let balanceScore = 0;
  if (totalIncome > 0) {
    const savingsRate = balance / totalIncome;
    if (savingsRate >= 0.2) balanceScore = 40;
    else if (savingsRate >= 0.1) balanceScore = 30;
    else if (savingsRate >= 0) balanceScore = 20;
    else {
      balanceScore = 0;
      alerts.push("Seu saldo está negativo. Receitas não cobrem as despesas.");
    }
  }

  // 2. Housing ratio score (0–30): moradia <= 30% da renda é saudável
  let housingRatioScore = 30;
  const housing = byCategory.find((c) => c.category === "HOUSING");
  if (housing && totalIncome > 0) {
    const ratio = housing.total / totalIncome;
    if (ratio > 0.5) {
      housingRatioScore = 0;
      alerts.push(`Moradia consome ${Math.round(ratio * 100)}% da renda — acima de 50%.`);
    } else if (ratio > 0.4) {
      housingRatioScore = 10;
      alerts.push(`Moradia consome ${Math.round(ratio * 100)}% da renda — acima do recomendado (30%).`);
    } else if (ratio > 0.3) {
      housingRatioScore = 20;
    }
  }

  // 3. Diversity score (0–30): ter receitas e múltiplas categorias controladas
  let diversityScore = 0;
  if (totalIncome > 0) diversityScore += 15;
  if (byCategory.length >= 3) diversityScore += 15;
  else if (byCategory.length >= 1) diversityScore += 5;

  const score = balanceScore + housingRatioScore + diversityScore;

  let level: HealthScoreResult["level"];
  if (score >= 85) level = "excellent";
  else if (score >= 65) level = "good";
  else if (score >= 45) level = "fair";
  else if (score >= 25) level = "poor";
  else level = "critical";

  return {
    score,
    level,
    breakdown: { balanceScore, housingRatioScore, diversityScore },
    alerts,
  };
}
