import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { TransactionCategory, TransactionType } from "@financials/shared";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Trash2 } from "lucide-react";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
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

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Transactions() {
  const qc = useQueryClient();
  const [amountDisplay, setAmountDisplay] = useState("");
  const [form, setForm] = useState({
    description: "",
    amount: "",
    type: "EXPENSE" as TransactionType,
    category: "OTHER" as TransactionCategory,
    date: new Date().toISOString().split("T")[0] ?? "",
  });

  const handleAmountChange = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (!digits) { setAmountDisplay(""); setForm(f => ({ ...f, amount: "" })); return; }
    const num = parseInt(digits, 10) / 100;
    setAmountDisplay(num.toLocaleString("pt-BR", { minimumFractionDigits: 2 }));
    setForm(f => ({ ...f, amount: num.toString() }));
  };

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: () => apiFetch("/api/transactions?period=current_month").then((r) => r.json()),
  });

  const create = useMutation({
    mutationFn: (data: typeof form) =>
      apiFetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, amount: Number(data.amount) }),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setForm({ description: "", amount: "", type: "EXPENSE", category: "OTHER", date: new Date().toISOString().split("T")[0] ?? "" });
      setAmountDisplay("");
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/transactions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-400 [animation-fill-mode:both]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Lançamentos</h1>
        <p className="text-sm text-muted-foreground">Registre entradas e saídas do mês.</p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Novo lançamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            className="field"
            placeholder="Descrição"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              inputMode="numeric"
              className="field font-mono"
              placeholder="R$ 0,00"
              value={amountDisplay}
              onChange={(e) => handleAmountChange(e.target.value)}
            />
            <input
              type="date"
              className="field"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <select
              className="field"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as TransactionType })}
            >
              <option value="EXPENSE">Despesa</option>
              <option value="INCOME">Receita</option>
            </select>
            <select
              className="field"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as TransactionCategory })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </div>
          <Button
            className="w-full"
            onClick={() => create.mutate(form)}
            disabled={!form.description || !form.amount || create.isPending}
          >
            {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {create.isPending ? "Salvando..." : "Adicionar lançamento"}
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="overflow-hidden p-0 gap-0">
        <CardHeader className="px-6 py-4">
          <CardTitle className="text-base">Histórico do mês</CardTitle>
        </CardHeader>
        {isLoading ? (
          <div className="px-6 pb-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : transactions.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-muted-foreground">Nenhum lançamento este mês.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-foreground/[0.06]">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Descrição</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">Categoria</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">Data</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Valor</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/[0.06]">
              {transactions.map((tx) => (
                <tr key={tx.id} className="transition-colors hover:bg-foreground/[0.03]">
                  <td className="max-w-[160px] truncate px-6 py-3.5 font-medium">{tx.description}</td>
                  <td className="hidden px-4 py-3.5 text-muted-foreground sm:table-cell">{CATEGORY_LABELS[tx.category]}</td>
                  <td className="hidden px-4 py-3.5 text-muted-foreground md:table-cell">{new Date(tx.date).toLocaleDateString("pt-BR")}</td>
                  <td className="px-6 py-3.5 text-right font-bold tabular-nums">
                    {tx.type === "INCOME" ? "+" : "−"}{fmt(tx.amount)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => remove.mutate(tx.id)}
                      disabled={remove.isPending}
                      className="text-muted-foreground/50 hover:text-foreground transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
