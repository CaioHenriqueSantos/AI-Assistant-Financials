import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";


interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export default function Chat() {
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const [optimisticMsg, setOptimisticMsg] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: history = [] } = useQuery<ChatMessage[]>({
    queryKey: ["chat-history"],
    queryFn: () => fetch("/api/chat/history").then((r) => r.json()),
  });

  const send = useMutation({
    mutationFn: (message: string) =>
      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat-history"] });
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleSend = () => {
    if (!input.trim() || send.isPending) return;
    const msg = input.trim();
    setInput("");
    setOptimisticMsg(msg);
    send.mutate(msg, {
      onSuccess: () => {
        setOptimisticMsg(null);
        qc.invalidateQueries({ queryKey: ["chat-history"] });
      },
    });
  };


  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "Qual meu saldo esse mês?",
    "Como estão meus gastos por categoria?",
    "Minha saúde financeira está boa?",
    "O que posso melhorar nas minhas finanças?",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <h1 className="text-2xl font-bold mb-4">Assistente IA</h1>

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {history.length === 0 && !send.isPending ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm mb-6">
              Olá! Sou o Financials IA. Como posso te ajudar hoje?
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); }}
                  className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-2 rounded-full transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          history.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${msg.role === "user"
                  ? "bg-brand-600 text-white"
                  : "bg-gray-800 text-gray-100"
                  }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        {optimisticMsg && (
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap bg-brand-600 text-white">
              {optimisticMsg}
            </div>
          </div>
        )}

        {send.isPending && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl px-4 py-3 text-sm text-gray-400">
              Analisando seus dados...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3 items-end">
        <textarea
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand-500 resize-none"
          placeholder="Pergunte sobre suas finanças..."
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || send.isPending}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
