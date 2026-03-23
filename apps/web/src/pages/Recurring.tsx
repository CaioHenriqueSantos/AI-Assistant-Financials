import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { TransactionCategory, TransactionType, Frequency } from "@financials/shared";

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
  "HOUSING", "FOOD", "TRANSPORT", "HEALTH", "EDUCATION",
  "ENTERTAINMENT", "CLOTHING", "SALARY", "INVESTMENT", "OTHER",
];
const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  HOUSING: "Moradia", FOOD: "Alimentação", TRANSPORT: "Transporte", HEALTH: "Saúde",
  EDUCATION: "Educação", ENTERTAINMENT: "Lazer", CLOTHING: "Vestuário",
  SALARY: "Salário", INVESTMENT: "Investimento", OTHER: "Outros",
};
const FREQ_LABELS: Record<Frequency, string> = {
  DAILY: "Diário", WEEKLY: "Semanal", MONTHLY: "Mensal", YEARLY: "Anual",
};

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Recurring() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    amount: "",
    type: "EXPENSE" as TransactionType,
    category: "HOUSING" as TransactionCategory,
    frequency: "MONTHLY" as Frequency,
    nextDate: new Date().toISOString().split("T")[0] ?? "",
    active: true,
  });

  const { data: rules = [], isLoading } = useQuery<RecurringRule[]>({
    queryKey: ["recurring"],
    queryFn: () => fetch("/api/recurring").then((r) => r.json()),
  });

  const create = useMutation({
    mutationFn: (data: typeof form) =>
      fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, amount: Number(data.amount) }),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recurring"] });
      setForm({ name: "", amount: "", type: "EXPENSE", category: "HOUSING", frequency: "MONTHLY", nextDate: new Date().toISOString().split("T")[0] ?? "", active: true });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => fetch(`/api/recurring/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recurring"] }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Recorrências</h1>

      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <p className="text-sm font-medium text-gray-300 mb-4">Nova recorrência</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            className="col-span-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand-500"
            placeholder="Nome (ex: Aluguel, Salário)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="number"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand-500"
            placeholder="Valor (R$)"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <select
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-brand-500"
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value as Frequency })}
          >
            {(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"] as Frequency[]).map((f) => (
              <option key={f} value={f}>{FREQ_LABELS[f]}</option>
            ))}
          </select>
          <select
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-brand-500"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as TransactionType })}
          >
            <option value="EXPENSE">Despesa</option>
            <option value="INCOME">Receita</option>
          </select>
          <select
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-brand-500"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as TransactionCategory })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
          <div className="col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">Próxima data</label>
            <input
              type="date"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-brand-500"
              value={form.nextDate}
              onChange={(e) => setForm({ ...form, nextDate: e.target.value })}
            />
          </div>
        </div>
        <button
          onClick={() => create.mutate(form)}
          disabled={!form.name || !form.amount || create.isPending}
          className="mt-3 w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          {create.isPending ? "Salvando..." : "Adicionar recorrência"}
        </button>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <p className="text-gray-400">Carregando...</p>
        ) : rules.length === 0 ? (
          <p className="text-gray-500">Nenhuma recorrência cadastrada.</p>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{rule.name}</p>
                <p className="text-xs text-gray-400">
                  {CATEGORY_LABELS[rule.category]} · {FREQ_LABELS[rule.frequency]} · próxima: {new Date(rule.nextDate).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-semibold text-sm ${rule.type === "INCOME" ? "text-green-400" : "text-red-400"}`}>
                  {rule.type === "INCOME" ? "+" : "-"}{fmt(rule.amount)}
                </span>
                <button
                  onClick={() => remove.mutate(rule.id)}
                  className="text-gray-600 hover:text-red-400 text-xs transition-colors"
                >
                  remover
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
