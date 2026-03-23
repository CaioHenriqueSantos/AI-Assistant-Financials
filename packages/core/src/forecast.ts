import type { Transaction, RecurringRule } from "@financials/shared";
import { calculateBalance } from "./balance.js";

export interface ForecastDay {
  date: string; // ISO date
  projectedBalance: number;
  events: Array<{ name: string; amount: number; type: "INCOME" | "EXPENSE" }>;
}

export interface ForecastResult {
  currentBalance: number;
  days: ForecastDay[];
  lowestBalance: number;
  lowestDate: string;
}

export function forecastCashflow(
  transactions: Transaction[],
  recurringRules: RecurringRule[],
  daysAhead = 30
): ForecastResult {
  const { balance: currentBalance } = calculateBalance(transactions);
  const days: ForecastDay[] = [];
  let runningBalance = currentBalance;
  let lowestBalance = currentBalance;
  let lowestDate = new Date().toISOString().split("T")[0] ?? "";

  const now = new Date();

  for (let i = 1; i <= daysAhead; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0] ?? "";

    const events: ForecastDay["events"] = [];

    for (const rule of recurringRules) {
      if (!rule.active) continue;
      const next = new Date(rule.nextDate);
      if (
        rule.frequency === "MONTHLY" &&
        next.getDate() === date.getDate()
      ) {
        events.push({ name: rule.name, amount: rule.amount, type: rule.type });
        if (rule.type === "INCOME") runningBalance += rule.amount;
        else runningBalance -= rule.amount;
      }
    }

    if (runningBalance < lowestBalance) {
      lowestBalance = runningBalance;
      lowestDate = dateStr;
    }

    days.push({ date: dateStr, projectedBalance: runningBalance, events });
  }

  return { currentBalance, days, lowestBalance, lowestDate };
}
