import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

const suggestions = [
  "Qual meu saldo esse mês?",
  "Como estão meus gastos por categoria?",
  "Minha saúde financeira está boa?",
  "O que posso melhorar nas minhas finanças?",
];

export default function Chat() {
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const [optimisticMsg, setOptimisticMsg] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: history = [] } = useQuery<ChatMessage[]>({
    queryKey: ["chat-history"],
    queryFn: () => apiFetch("/api/chat/history").then((r) => r.json()),
  });

  const send = useMutation({
    mutationFn: (message: string) =>
      apiFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      }).then((r) => r.json()),
    onSuccess: () => {
      setOptimisticMsg(null);
      qc.invalidateQueries({ queryKey: ["chat-history"] });
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, optimisticMsg]);

  const handleSend = () => {
    if (!input.trim() || send.isPending) return;
    const msg = input.trim();
    setInput("");
    setOptimisticMsg(msg);
    send.mutate(msg);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = history.length === 0 && !send.isPending && !optimisticMsg;

  return (
    <div className="flex flex-col h-[calc(100dvh-120px)] lg:h-[calc(100dvh-80px)]">
      {/* Header */}
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Assistente IA</h1>
        <p className="text-sm text-muted-foreground">Pergunte sobre suas finanças.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center pb-8">
            <div className="rounded-full border border-foreground/[0.08] bg-card backdrop-blur-md p-4">
              <Sparkles className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">Como posso te ajudar hoje?</p>
              <p className="text-xs text-muted-foreground mt-1">Tenho acesso aos seus dados financeiros em tempo real.</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-sm">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-xs border border-foreground/[0.08] bg-card backdrop-blur-md hover:bg-foreground/[0.04] px-3 py-2 rounded-full transition-colors text-muted-foreground hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {history.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex animate-in fade-in slide-in-from-bottom-1 duration-300",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed",
                    msg.role === "user"
                      ? "bg-foreground text-background rounded-br-sm"
                      : "bg-card backdrop-blur-md border border-foreground/[0.08] text-foreground rounded-bl-sm"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {optimisticMsg && (
              <div className="flex justify-end animate-in fade-in duration-200">
                <div className="max-w-[80%] rounded-2xl rounded-br-sm px-4 py-3 text-sm bg-foreground text-background opacity-70">
                  {optimisticMsg}
                </div>
              </div>
            )}

            {send.isPending && (
              <div className="flex justify-start animate-in fade-in duration-200">
                <div className="bg-card backdrop-blur-md border border-foreground/[0.08] rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Analisando seus dados...
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 pt-3 border-t border-foreground/[0.06]">
        <div className="flex gap-2 items-end">
          <textarea
            className="flex-1 rounded-xl border border-foreground/[0.08] bg-card backdrop-blur-md px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 resize-none transition-colors"
            placeholder="Pergunte sobre suas finanças..."
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || send.isPending}
            className="h-[42px] w-[42px] shrink-0"
          >
            {send.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
