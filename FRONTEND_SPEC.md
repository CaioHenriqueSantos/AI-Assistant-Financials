# Financials IA — Frontend Specification

> Última atualização: redesign v2 (glassmorphism + monocromático)

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Roteamento | React Router v6 |
| UI | shadcn/ui (Radix UI + Tailwind 3) |
| Gráficos | Recharts 3 |
| Server state | TanStack Query v5 |
| Tema | next-themes (light/dark/system) |
| Ícones | Lucide React |
| Fonte | Inter Variable (`@fontsource-variable/inter`) |

---

## CSS Variables — Atual (oklch)

```css
/* Light */
--background: oklch(0.93 0 0);       /* cinza suave para glass ser visível */
--card: oklch(1 0 0 / 0.75);         /* branco 75% — glass */
--popover: oklch(1 0 0 / 0.9);
--border: oklch(0 0 0 / 0.09);       /* borda preta suave */
--input: oklch(0 0 0 / 0.06);
--ring: oklch(0 0 0 / 0.2);
--sidebar: oklch(1 0 0 / 0.6);       /* glass mais transparente */
--sidebar-primary: oklch(0.205 0 0); /* neutro — sem azul */

/* Dark */
--background: oklch(0.1 0 0);        /* mais escuro para glass ser visível */
--card: oklch(1 0 0 / 0.06);         /* branco 6% — glass sutil */
--popover: oklch(0.15 0 0 / 0.95);
--border: oklch(1 0 0 / 0.1);        /* borda branca suave */
--sidebar: oklch(1 0 0 / 0.04);
--sidebar-primary: oklch(0.922 0 0); /* neutro — sem azul */
```

---

## Componentes shadcn Instalados

```
button, card, badge, progress, skeleton, alert,
dropdown-menu, avatar, separator, scroll-area,
sheet, tooltip
```

Pendentes para próximas sessões: `input`, `select`, `sonner`, `alert-dialog`, `tabs`

---

## Regras de Design

1. **100% monocromático** — zero cores fora de preto/branco/cinza
2. **Glassmorphism** — `Card` usa `backdrop-blur-md` + `bg-card` semi-transparente
3. **Bordas** — `border-foreground/[0.08]` (preto light / branco dark)
4. **Sem borda azul** — `--sidebar-primary` e `--ring` são neutros
5. **Inputs** nativos estilizados com `border-foreground/[0.08] bg-background focus:ring-foreground/20`
6. **Valores monetários** — `font-bold tabular-nums`, prefixo `+` / `−`
7. **Animações** — `animate-in fade-in slide-in-from-bottom` com stagger por delay

---

## Componentes Customizados

### `card.tsx` (modificado)
```
backdrop-blur-md bg-card border border-foreground/[0.08] shadow-sm rounded-xl
```
Substituiu `ring-1 ring-foreground/10` por border explícito.

### `button.tsx` (modificado)
Adicionado `React.forwardRef` — necessário para `DropdownMenuTrigger asChild`.

### `ThemeProvider.tsx`
```tsx
<NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
```

### `AppShell.tsx`
- Sidebar: `w-56 backdrop-blur-md`, nav `text-xs`, sem Tooltip/Separator
- MobileHeader: logo + ThemeToggle + UserMenu
- BottomNav: 4 itens, active via `useLocation()`

---

## Páginas Implementadas

### Dashboard (`/`)
- 4 KPI cards iguais: `grid-cols-2 lg:grid-cols-4`
- Alertas: `Alert` com `AlertTriangle`
- `lg:grid-cols-5`: BarChart (col-span-3) + Progress bars (col-span-2)
- Tabela de transações recentes full-width
- Recharts BarChart monocromático: `fill="var(--foreground)"`

### Transactions (`/transactions`)
- Card com form (grid 2-col)
- Tabela com `Trash2` para remover
- `apiFetch` em todos os calls (sem `fetch` direto)

### Recurring (`/recurring`)
- 2 cards resumo (receitas/despesas fixas) quando há dados
- Card com form
- Lista animada com stagger

### Chat (`/chat`)
- `h-[calc(100dvh-120px)]` para ocupar altura disponível
- Mensagem usuário: `bg-foreground text-background`
- Mensagem IA: `bg-card backdrop-blur-md border border-foreground/[0.08]`
- Empty state com `Sparkles` + sugestões pill
- Send com `Button size="icon"` + ícone `Send`

### Login (`/login`)
- Card centralizado + Google OAuth
- `Alert` para erros, `Loader2` no loading

---

## Rotas

```tsx
/login           → Login (sem AppShell)
/                → Dashboard (dentro AppShell)
/transactions    → Transactions
/recurring       → Recurring
/chat            → Chat
/settings        → Settings (pendente)
```

---

## Responsividade

| Breakpoint | Layout |
|---|---|
| `< 1024px` | Header topo + BottomNav fixo, `pb-20` no main |
| `≥ 1024px` | Sidebar esquerda `w-56`, `pb-8` no main |

Colunas responsivas na tabela: Categoria `hidden sm:table-cell`, Data `hidden md:table-cell`

---

## Pendente (próximas sessões)

- [ ] Settings page (tema + logout + perfil)
- [ ] Sonner toasts (feedback de CRUD)
- [ ] `shadcn add input select` para forms mais robustos
- [ ] AlertDialog para confirmação de delete
- [ ] Testar glassmorphism em produção (ajustar opacidades se necessário)
