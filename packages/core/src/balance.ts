import type { Transaction } from "@financials/shared";

export interface BalanceResult {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export function calculateBalance(transactions: Transaction[]): BalanceResult {
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const tx of transactions) {
    if (tx.type === "INCOME") {
      totalIncome += tx.amount;
    } else {
      totalExpenses += tx.amount;
    }
  }

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
  };
}
