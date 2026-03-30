import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { TransactionCategory, TransactionType, Frequency } from "@financials/shared";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Trash2, Repeat } from "lucide-react";

interface RecurringRule {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  frequency: Frequency;
  nextDate: string;
}

const CATEGORIES: TransactionCategory[] = [
  "HOUSING","FOOD","TRANSPORT","HEALTH","EDUCATION",
  "ENTERTAINMENT","CLOTHING","SALARY","INVESTMENT","OTHER",
];
const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  HOUSING:"Moradia", FOOD:"Alimentação", TRANSPORT:"Transporte", HEALTH:"Saúde",
  EDUCATION:"Educação", ENTERTAINMENT:"Lazer", CLOTHING:"Vestuário",
  SALARY:"Salário", INVESTMENT:"Investimento", OTHER:"Outros",
};
const FREQ_LABELS: Record<Frequency, string> = {
  DAILY:"Diário", WEEKLY:"Semanal", MONTHLY:"Mensal", YEARLY:"Anual",
};

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function RecurringSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="pt-6 space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-20" /></CardContent></Card>
        <Card><CardContent className="pt-6 space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-20" /></CardContent></Card>
      </div>
      <Card>
        <CardHeader className="pb-3"><Skeleton className="h-5 w-36" /></CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    </div>
  );
}

export default function Recurring() {
  const qc = useQueryClient();
  const [amountDisplay, setAmountDisplay] = useState("");
  const [form, setForm] = useState({
    name: "",
    amount: "",
    type: "EXPENSE" as TransactionType,
    category: "HOUSING" as TransactionCategory,
    frequency: "MONTHLY" as Frequency,
    nextDate: new Date().toISOString().split("T")[0] ?? "",
    active: true,
  });

  const handleAmountChange = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (!digits) { setAmountDisplay(""); setForm(f => ({ ...f, amount: "" })); return; }
    const num = parseInt(digits, 10) / 100;
    setAmountDisplay(num.toLocaleString("pt-BR", { minimumFractionDigits: 2 }));
    setForm(f => ({ ...f, amount: num.toString() }));
  };

  const { data: rules = [], isLoading, isFetched } = useQuery<RecurringRule[]>({
    queryKey: ["recurring"],
    queryFn: () => apiFetch("/api/recurring").then((r) => r.json()),
  });

  const create = useMutation({
    mutationFn: (data: typeof form) =>
      apiFetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, amount: Number(data.amount) }),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recurring"] });
      setForm({ name: "", amount: "", type: "EXPENSE", category: "HOUSING", frequency: "MONTHLY", nextDate: new Date().toISOString().split("T")[0] ?? "", active: true });
      setAmountDisplay("");
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/recurring/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recurring"] }),
  });

  const expenses = rules.filter((r) => r.type === "EXPENSE");
  const income = rules.filter((r) => r.type === "INCOME");
  const totalExpenses = expenses.reduce((s, r) => s + r.amount, 0);
  const totalIncome = income.reduce((s, r) => s + r.amount, 0);

  if (isLoading && !isFetched) return <RecurringSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-400 [animation-fill-mode:both]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recorrências</h1>
        <p className="text-sm text-muted-foreground">Gerencie gastos e receitas fixos.</p>
      </div>

      {/* Summary */}
      {rules.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receitas fixas/mês</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold" style={{ color: "var(--finance-income)" }}>{fmt(totalIncome)}</p>
              <p className="text-xs text-muted-foreground mt-1">{income.length} recorrência{income.length !== 1 ? "s" : ""}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Despesas fixas/mês</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold" style={{ color: "var(--finance-expense)" }}>{fmt(totalExpenses)}</p>
              <p className="text-xs text-muted-foreground mt-1">{expenses.length} recorrência{expenses.length !== 1 ? "s" : ""}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Nova recorrência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            className="field"
            placeholder="Nome (ex: Aluguel, Salário)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              inputMode="numeric"
              className="field font-mono"
              placeholder="R$ 0,00"
              value={amountDisplay}
              onChange={(e) => handleAmountChange(e.target.value)}
            />
            <Select
              value={form.frequency}
              onValueChange={(v) => setForm({ ...form, frequency: v as Frequency })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["DAILY","WEEKLY","MONTHLY","YEARLY"] as Frequency[]).map((f) => (
                  <SelectItem key={f} value={f}>{FREQ_LABELS[f]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={form.type}
              onValueChange={(v) => setForm({ ...form, type: v as TransactionType })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPENSE">
                  <span className="text-[var(--finance-expense)]">● </span>Despesa
                </SelectItem>
                <SelectItem value="INCOME">
                  <span className="text-[var(--finance-income)]">● </span>Receita
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v as TransactionCategory })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Próxima data</label>
            <input
              type="date"
              className="field"
              value={form.nextDate}
              onChange={(e) => setForm({ ...form, nextDate: e.target.value })}
            />
          </div>
          <Button
            className="w-full"
            onClick={() => create.mutate(form)}
            disabled={!form.name || !form.amount || create.isPending}
          >
            {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {create.isPending ? "Salvando..." : "Adicionar recorrência"}
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      {rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Repeat className="h-8 w-8 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma recorrência cadastrada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule, i) => (
            <Card
              key={rule.id}
              className="py-4 animate-in fade-in slide-in-from-bottom-1 duration-300 [animation-fill-mode:both] hover:-translate-y-0.5 transition-transform"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <CardContent className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{rule.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {CATEGORY_LABELS[rule.category]} · {FREQ_LABELS[rule.frequency]} · próx. {new Date(rule.nextDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span
                    className="font-bold text-sm tabular-nums"
                    style={{ color: rule.type === "INCOME" ? "var(--finance-income)" : "var(--finance-expense)" }}
                  >
                    {rule.type === "INCOME" ? "+" : "−"}{fmt(rule.amount)}
                  </span>
                  <button
                    onClick={() => remove.mutate(rule.id)}
                    disabled={remove.isPending}
                    className="text-muted-foreground/50 hover:text-foreground transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
