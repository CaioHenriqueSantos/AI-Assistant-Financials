import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import { useSession, signOut } from "@/lib/auth";
import Dashboard from "@/pages/Dashboard.tsx";
import Transactions from "@/pages/Transactions.tsx";
import Recurring from "@/pages/Recurring.tsx";
import Chat from "@/pages/Chat.tsx";
import Login from "@/pages/Login.tsx";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/transactions", label: "Lançamentos" },
  { to: "/recurring", label: "Recorrências" },
  { to: "/chat", label: "Assistente IA" },
];

export default function App() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <p className="text-gray-400 text-sm">Carregando...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-8">
        <span className="font-bold text-brand-500 text-lg tracking-tight">Financials IA</span>
        <nav className="flex gap-6 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? "text-brand-500" : "text-gray-400 hover:text-gray-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{session.user.name}</span>
          <button
            onClick={() => signOut()}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/recurring" element={<Recurring />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </main>
    </div>
  );
}
