import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Repeat,
  MessageSquare,
  LogOut,
  Settings,
} from "lucide-react";
import { signOut, useSession } from "@/lib/auth";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Lançamentos", icon: ArrowLeftRight },
  { to: "/recurring", label: "Recorrências", icon: Repeat },
  { to: "/chat", label: "Chat IA", icon: MessageSquare },
];

function UserMenu() {
  const { data: session } = useSession();
  const user = session?.user;
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-1.5 gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden lg:inline text-sm font-medium truncate max-w-[120px]">
            {user?.name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <NavLink to="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </NavLink>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-56 border-r border-foreground/[0.06] bg-sidebar backdrop-blur-md text-sidebar-foreground">
      <div className="h-14 flex items-center px-4">
        <span className="text-sm font-semibold tracking-tight text-foreground/70">
          Financials
        </span>
      </div>
      <nav className="flex-1 flex flex-col gap-0.5 px-3 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors duration-150",
                isActive
                  ? "bg-foreground/8 text-foreground"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0 opacity-70" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border/50 p-3 flex items-center justify-between">
        <UserMenu />
        <ThemeToggle />
      </div>
    </aside>
  );
}

function MobileHeader() {
  return (
    <header className="lg:hidden flex items-center justify-between h-14 px-4 border-b border-border bg-background">
      <span className="text-lg font-bold tracking-tight">Financials</span>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}

function BottomNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {navItems.map((item) => {
        const isActive =
          item.to === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.to);

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full"
          >
            <item.icon
              className={cn(
                "h-5 w-5 transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-medium transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export function AppShell() {
  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 lg:py-8 pb-20 lg:pb-8">
          <div className="mx-auto max-w-5xl w-full">
            <Outlet />
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
