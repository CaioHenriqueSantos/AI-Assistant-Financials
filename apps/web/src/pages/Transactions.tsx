import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { TransactionCategory, TransactionType } from "@financials/shared";
import { apiFetch } from "@/lib/api";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
}

const CATEGORIES: TransactionCategory[] = [
  "HOUSING", "FOOD", "TRANSPORT", "HEALTH", "EDUCATION",
  "ENTERTAINMENT", "CLOTHING", "SALARY", "INVESTMENT", "OTHER",
];

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  HOUSING: "Moradia",
  FOOD: "Alimentação",
  TRANSPORT: "Transporte",
  HEALTH: "Saúde",
  EDUCATION: "Educação",
  ENTERTAINMENT: "Lazer",
  CLOTHING: "Vestuário",
  SALARY: "Salário",
  INVESTMENT: "Investimento",
  OTHER: "Outros",
};

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Transactions() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    description: "",
    amount: "",
    type: "EXPENSE" as TransactionType,
    category: "OTHER" as TransactionCategory,
    date: new Date().toISOString().split("T")[0] ?? "",
  });

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
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/transactions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Lançamentos</h1>

      {/* Formulário */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <p className="text-sm font-medium text-gray-300 mb-4">Novo lançamento</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            className="col-span-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand-500"
            placeholder="Descrição"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            type="number"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand-500"
            placeholder="Valor (R$)"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <input
            type="date"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-brand-500"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
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
        </div>
        <button
          onClick={() => create.mutate(form)}
          disabled={!form.description || !form.amount || create.isPending}
          className="mt-3 w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          {create.isPending ? "Salvando..." : "Adicionar lançamento"}
        </button>
      </div>

      {/* Lista */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {isLoading ? (
          <p className="text-gray-400 p-5">Carregando...</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-500 p-5">Nenhum lançamento este mês.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
                <th className="text-left px-5 py-3">Descrição</th>
                <th className="text-left px-5 py-3">Categoria</th>
                <th className="text-left px-5 py-3">Data</th>
                <th className="text-right px-5 py-3">Valor</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-5 py-3 font-medium">{tx.description}</td>
                  <td className="px-5 py-3 text-gray-400">{CATEGORY_LABELS[tx.category]}</td>
                  <td className="px-5 py-3 text-gray-400">{new Date(tx.date).toLocaleDateString("pt-BR")}</td>
                  <td className={`px-5 py-3 text-right font-semibold ${tx.type === "INCOME" ? "text-green-400" : "text-red-400"}`}>
                    {tx.type === "INCOME" ? "+" : "-"}{fmt(tx.amount)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => remove.mutate(tx.id)}
                      className="text-gray-600 hover:text-red-400 text-xs transition-colors"
                    >
                      remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
