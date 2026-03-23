import type { Transaction, TransactionCategory } from "@financials/shared";

export interface CategoryBudget {
  category: TransactionCategory;
  total: number;
  percentage: number;
  count: number;
}

export interface BudgetResult {
  totalExpenses: number;
  byCategory: CategoryBudget[];
}

export function calculateBudgetByCategory(transactions: Transaction[]): BudgetResult {
  const expenses = transactions.filter((tx) => tx.type === "EXPENSE");
  const totalExpenses = expenses.reduce((sum, tx) => sum + tx.amount, 0);

  const categoryMap = new Map<TransactionCategory, { total: number; count: number }>();

  for (const tx of expenses) {
    const existing = categoryMap.get(tx.category) ?? { total: 0, count: 0 };
    categoryMap.set(tx.category, {
      total: existing.total + tx.amount,
      count: existing.count + 1,
    });
  }

  const byCategory: CategoryBudget[] = Array.from(categoryMap.entries()).map(
    ([category, data]) => ({
      category,
      total: data.total,
      percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
      count: data.count,
    })
  );

  byCategory.sort((a, b) => b.total - a.total);

  return { totalExpenses, byCategory };
}
