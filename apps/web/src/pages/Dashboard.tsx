import { useQuery } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";

interface DashboardData {
  balance: { totalIncome: number; totalExpenses: number; balance: number };
  health: { score: number; level: string; alerts: string[] };
  budget: { byCategory: Array<{ category: string; total: number; percentage: number }> };
  recentTransactions: Array<{
    id: string;
    description: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    category: string;
    date: string;
  }>;
}

const levelColors: Record<string, string> = {
  excellent: "text-green-400",
  good: "text-brand-500",
  fair: "text-yellow-400",
  poor: "text-orange-400",
  critical: "text-red-500",
};

const levelLabels: Record<string, string> = {
  excellent: "Excelente",
  good: "Bom",
  fair: "Regular",
  poor: "Preocupante",
  critical: "Crítico",
};

export default function Dashboard() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => apiFetch("/api/dashboard").then((r) => r.json()),
    retry: (count, err) => {
      if (err instanceof ApiError && err.status === 401) return false;
      return count < 2;
    },
  });

  if (isLoading) return <p className="text-gray-400">Carregando...</p>;
  if (error) return <p className="text-red-400">Erro ao carregar dashboard.</p>;
  if (!data) return null;

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Cards de saldo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Receitas</p>
          <p className="text-2xl font-bold text-green-400">{fmt(data.balance.totalIncome)}</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Despesas</p>
          <p className="text-2xl font-bold text-red-400">{fmt(data.balance.totalExpenses)}</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Saldo</p>
          <p
            className={`text-2xl font-bold ${
              data.balance.balance >= 0 ? "text-brand-500" : "text-red-500"
            }`}
          >
            {fmt(data.balance.balance)}
          </p>
        </div>
      </div>

      {/* Health score */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Saúde financeira</p>
        <div className="flex items-baseline gap-3">
          <span className={`text-4xl font-bold ${levelColors[data.health.level] ?? ""}`}>
            {data.health.score}
          </span>
          <span className="text-gray-400 text-sm">/ 100</span>
          <span className={`text-sm font-medium ${levelColors[data.health.level] ?? ""}`}>
            {levelLabels[data.health.level] ?? data.health.level}
          </span>
        </div>
        {data.health.alerts.length > 0 && (
          <ul className="mt-3 space-y-1">
            {data.health.alerts.map((alert, i) => (
              <li key={i} className="text-sm text-yellow-400 flex gap-2">
                <span>⚠</span> {alert}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Gastos por categoria */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Gastos por categoria</p>
        <div className="space-y-2">
          {data.budget.byCategory.slice(0, 6).map((cat) => (
            <div key={cat.category} className="flex items-center gap-3">
              <span className="text-sm text-gray-300 w-28 shrink-0">{cat.category}</span>
              <div className="flex-1 bg-gray-800 rounded-full h-2">
                <div
                  className="bg-brand-500 h-2 rounded-full"
                  style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                />
              </div>
              <span className="text-sm text-gray-400 w-12 text-right">{cat.percentage.toFixed(0)}%</span>
              <span className="text-sm text-gray-300 w-24 text-right">{fmt(cat.total)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transações recentes */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Transações recentes</p>
        <div className="space-y-2">
          {data.recentTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{tx.description}</p>
                <p className="text-xs text-gray-500">{tx.category} · {new Date(tx.date).toLocaleDateString("pt-BR")}</p>
              </div>
              <span
                className={`text-sm font-semibold ${
                  tx.type === "INCOME" ? "text-green-400" : "text-red-400"
                }`}
              >
                {tx.type === "INCOME" ? "+" : "-"}{fmt(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
