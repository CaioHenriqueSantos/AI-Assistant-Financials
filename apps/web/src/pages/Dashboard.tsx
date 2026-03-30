import { useQuery } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface DashboardData {
  balance: { totalIncome: number; totalExpenses: number; balance: number };
  health: { score: number; level: string; alerts: string[] };
  budget: {
    byCategory: Array<{
      category: string;
      total: number;
      percentage: number;
    }>;
  };
  recentTransactions: Array<{
    id: string;
    description: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    category: string;
    date: string;
  }>;
}

const healthLabels: Record<string, string> = {
  excellent: "Excelente",
  good: "Bom",
  fair: "Regular",
  poor: "Preocupante",
  critical: "Crítico",
};

const healthDescriptions: Record<string, string> = {
  excellent: "Suas finanças estão em ótima forma",
  good: "Você está no caminho certo",
  fair: "Há espaço para melhorar",
  poor: "Atenção necessária nos gastos",
  critical: "Revisar finanças com urgência",
};

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtCompact = (v: number) =>
  new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 1,
  }).format(v);

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string;
  statusText: string;
  description: string;
  icon: React.ElementType;
  delay?: number;
  statusIcon?: ReactNode;
}

function KpiCard({
  title,
  value,
  statusText,
  description,
  icon: Icon,
  delay = 0,
  statusIcon,
}: KpiCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col justify-between",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        "animate-in fade-in slide-in-from-bottom-3 duration-500 [animation-fill-mode:both]"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <div className="border-t border-border pt-3">
          <div className="flex items-center justify-between gap-1">
            <p className="text-sm font-semibold leading-tight">{statusText}</p>
            {statusIcon ?? (
              <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function KpiCardSkeleton() {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-9 w-36" />
        <div className="border-t border-border pt-3 space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-44" />
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <CardHeader>
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-36" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-56 w-full" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-28" />
          </CardHeader>
          <CardContent className="space-y-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-1.5 w-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => apiFetch("/api/dashboard").then((r) => r.json()),
    retry: (count, err) => {
      if (err instanceof ApiError && err.status === 401) return false;
      return count < 2;
    },
  });

  if (isLoading) return <DashboardSkeleton />;

  if (error)
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar dashboard. Tente novamente.
        </AlertDescription>
      </Alert>
    );

  if (!data) return null;

  const { balance, health, budget, recentTransactions } = data;
  const isPositive = balance.balance >= 0;
  const categories = budget.byCategory.slice(0, 5);
  const chartData = budget.byCategory.slice(0, 7).map((cat) => ({
    name: cat.category.length > 11 ? cat.category.slice(0, 11) + "…" : cat.category,
    value: cat.total,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="animate-in fade-in slide-in-from-top-2 duration-400 [animation-fill-mode:both]"
      >
        <h1 className="text-2xl font-bold tracking-tight">Resumo mensal</h1>
        <p className="text-sm text-muted-foreground">
          Veja o resumo das suas finanças do mês atual.
        </p>
      </div>

      {/* Alerts */}
      {health.alerts.length > 0 && (
        <Alert className="animate-in fade-in duration-500 [animation-fill-mode:both]">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="space-y-1">
              {health.alerts.map((alert, i) => (
                <li key={i}>{alert}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Receitas"
          value={fmt(balance.totalIncome)}
          statusText="Total do mês"
          description="Todas as entradas registradas"
          icon={ArrowUpRight}
          delay={0}
        />
        <KpiCard
          title="Despesas"
          value={fmt(balance.totalExpenses)}
          statusText="Total do mês"
          description="Todos os gastos registrados"
          icon={ArrowDownRight}
          delay={75}
          statusIcon={<ArrowDownRight className="h-4 w-4 text-muted-foreground shrink-0" />}
        />
        <KpiCard
          title="Saldo"
          value={fmt(balance.balance)}
          statusText={isPositive ? "Saldo positivo" : "Saldo negativo"}
          description={
            isPositive
              ? "Receitas maiores que despesas"
              : "Despesas maiores que receitas"
          }
          icon={Wallet}
          delay={150}
          statusIcon={
            isPositive ? (
              <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-muted-foreground shrink-0" />
            )
          }
        />
        <KpiCard
          title="Saúde financeira"
          value={`${health.score}/100`}
          statusText={healthLabels[health.level] ?? health.level}
          description={
            healthDescriptions[health.level] ?? "Score de saúde calculado"
          }
          icon={Activity}
          delay={225}
        />
      </div>

      {/* Chart + Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Bar chart */}
        <Card
          className="lg:col-span-3 animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-fill-mode:both]"
          style={{ animationDelay: "300ms" }}
        >
          <CardHeader>
            <CardTitle>Gastos por categoria</CardTitle>
            <CardDescription>Top categorias do mês atual</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                Nenhum gasto registrado ainda.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={chartData}
                  margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => fmtCompact(v)}
                  />
                  <Tooltip
                    formatter={(value: number) => [fmt(value), "Gasto"]}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "var(--foreground)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                    cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                  />
                  <Bar
                    dataKey="value"
                    fill="var(--foreground)"
                    radius={[4, 4, 0, 0]}
                    opacity={0.85}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Category progress */}
        <Card
          className="lg:col-span-2 animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-fill-mode:both]"
          style={{ animationDelay: "375ms" }}
        >
          <CardHeader>
            <CardTitle>Distribuição</CardTitle>
            <CardDescription>% dos gastos por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhum gasto ainda.
              </p>
            ) : (
              <div className="space-y-5">
                {categories.map((cat, i) => (
                  <div
                    key={cat.category}
                    className="animate-in fade-in duration-300 [animation-fill-mode:both]"
                    style={{ animationDelay: `${400 + i * 60}ms` }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium truncate max-w-[120px]">
                        {cat.category}
                      </span>
                      <span className="text-sm font-bold tabular-nums">
                        {cat.percentage.toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(cat.percentage, 100)}
                      className="h-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {fmt(cat.total)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction history */}
      <Card
        className="animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-fill-mode:both]"
        style={{ animationDelay: "450ms" }}
      >
        <CardHeader>
          <CardTitle>Histórico de transações</CardTitle>
          <CardDescription>Últimas movimentações do mês</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {recentTransactions.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              Nenhuma transação registrada.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Descrição
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">
                    Categoria
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentTransactions.slice(0, 8).map((tx, i) => (
                  <tr
                    key={tx.id}
                    className={cn(
                      "transition-colors duration-150 hover:bg-muted/50",
                      "animate-in fade-in duration-300 [animation-fill-mode:both]"
                    )}
                    style={{ animationDelay: `${480 + i * 40}ms` }}
                  >
                    <td className="max-w-[160px] truncate px-6 py-3.5 font-medium">
                      {tx.description}
                    </td>
                    <td className="hidden px-4 py-3.5 text-muted-foreground sm:table-cell">
                      {tx.category}
                    </td>
                    <td className="hidden px-4 py-3.5 text-muted-foreground md:table-cell">
                      {new Date(tx.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-3.5 text-right font-bold tabular-nums">
                      {tx.type === "INCOME" ? "+" : "−"}
                      {fmt(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
