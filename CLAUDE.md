# Financials IA — Contexto do Projeto

## O que é esse projeto
Assistente financeiro inteligente com IA (Claude) para uso pessoal/familiar.
O diferencial: a IA nunca inventa dados — ela usa MCP tools para consultar dados reais do banco antes de responder.

## Stack
- **Frontend:** Vite + React SPA (`apps/web`)
- **Backend:** Node.js + TypeScript + Fastify (`apps/api`)
- **Banco:** PostgreSQL via Prisma ORM
- **IA:** Claude API (claude-sonnet-4-6) com MCP tools
- **Monorepo:** pnpm workspaces + Turborepo
- **Infra (produção):** Ubuntu 22.04 + Coolify + Docker

## Estrutura do monorepo
```
projeto-cai/
├── apps/
│   ├── api/          → Fastify + Prisma + Claude
│   └── web/          → Vite + React SPA
├── packages/
│   ├── shared/       → Tipos e schemas Zod compartilhados
│   ├── core/         → Motor financeiro puro (sem I/O)
│   └── mcp/          → Tools do Claude (ponte IA ↔ banco)
├── docker-compose.yml
└── .env              → variáveis de ambiente (não commitado)
```

## Como subir o ambiente de desenvolvimento

### 1. Banco de dados (Docker)
```bash
docker compose up -d db
```

### 2. API
```bash
pnpm --filter @financials/api dev
# Roda em http://localhost:3001
```

### 3. Frontend
```bash
pnpm --filter @financials/web dev
# Roda em http://localhost:5173
```

### Se mudar algo nos packages (shared, core, mcp), rebuildar antes:
```bash
pnpm --filter @financials/shared build
pnpm --filter @financials/core build
pnpm --filter @financials/mcp build
```

## Estado atual do projeto
- [x] Monorepo configurado (pnpm + Turborepo)
- [x] Banco de dados PostgreSQL rodando no Docker
- [x] Migrations do Prisma aplicadas (todas as tabelas criadas)
- [x] API Fastify rodando (`GET /api/health` funcionando)
- [x] Packages shared, core e mcp compilando sem erros
- [x] Frontend Vite + React rodando em localhost:5173
- [x] Chat com IA funcionando end-to-end (Groq + LLaMA 3.3 70b)
- [x] MCP tools executando com dados reais do banco
- [x] Tela de Lançamentos funcionando
- [x] Tela de Recorrências (criar/listar regras recorrentes)
- [x] Dashboard com dados reais e gráficos (design guide v1)
- [x] Autenticação multi-usuário com Better Auth + Google OAuth funcionando
- [x] Middleware de auth protegendo todas as rotas
- [x] Dados isolados por usuário (transactions, recurring, chat)
- [x] Seed atualizado com userId real
- [x] Deploy em produção (Coolify + Docker) — api.cdevlog.com + app.cdevlog.com
- [x] Prisma migrations rodando em produção
- [x] Google OAuth funcionando em produção
- [x] Arquitetura single-host: browser fala só com app.cdevlog.com, nginx faz proxy para API
- [x] **Frontend redesign com design guide v1:**
  - Layout Shell responsivo (Sidebar desktop, Bottom Nav mobile)
  - Tema light/dark/system gerenciado com Zustand
  - Login page simplificada com Google OAuth
  - Dashboard com KPI cards, alertas inteligentes, gráficos placeholder
  - Transactions page com tabela, filtros e CRUD
  - Recurring page com resumo de comprometimento
  - Settings page com tema + logout
  - Chat page com interface de conversação
  - Componentes UI: Card, Alert, Badge, Skeleton, Input, Textarea, DropdownMenu
  - Formatação monetária em pt-BR com cores semânticas (verde=receita, vermelho=despesa)
  - **Arquitetura limpa:** Utilitários (.ts) separados de componentes React (.tsx)
- [x] Erros de linting corrigidos (variáveis não utilizadas removidas)
- [x] **Design system completo com shadcn/ui implementado:**
  - Biblioteca completa de componentes (Button, Card, Alert, Badge, Input, etc.)
  - Sistema de temas com variáveis CSS para light/dark mode
  - ThemeProvider com next-themes (substituiu Zustand)
  - Tailwind config atualizado com mapeamentos completos e animações
  - Fonte Inter Variable
- [x] **Redesign v2 — design system monocromático + glassmorphism:**
  - Glassmorphism: `--card` semi-transparente + `backdrop-blur-md` em light e dark
  - Fundo levemente cinza (light) e mais escuro (dark) para o glass ser visível
  - Bordas `foreground/8%` — preto suave no light, branco suave no dark (zero azul)
  - Button com `React.forwardRef` (fix DropdownMenu/ThemeToggle)
  - `--sidebar-primary` corrigido (era azul em dark mode)
  - Sidebar: `w-56`, texto `text-xs`, sem tooltips, glass backdrop
  - Dashboard: 4 KPI cards iguais, bar chart Recharts monocromático, tabela de transações, progress bars por categoria
  - Transactions: Card form + tabela com ícone Trash2
  - Recurring: cards resumo receita/despesa fixos + lista animada
  - Chat: bubbles invertidas (user = bg-foreground), glass card para assistente, sugestões centralizadas
  - Animações staggered em todos os componentes (fade-in + slide-in-from-bottom)
  - recharts instalado; shadcn components: card, badge, progress

## Rotas da API
```
GET  /api/health
GET  /api/transactions
POST /api/transactions
DEL  /api/transactions/:id
GET  /api/recurring
POST /api/recurring
DEL  /api/recurring/:id
POST /api/chat
GET  /api/chat/history
GET  /api/dashboard
```

## MCP Tools disponíveis para o Claude
| Tool | O que faz |
|---|---|
| `get_balance` | Saldo do período (receitas - despesas) |
| `get_transactions` | Lista transações com filtros |
| `get_budget_by_category` | Gastos por categoria com % |
| `get_recurring` | Lista de gastos/receitas recorrentes |
| `get_health_score` | Score 0–100 de saúde financeira |
| `get_cashflow_forecast` | Projeção de saldo futuro |

## Arquitetura de produção
- **Single-host público:** browser fala apenas com `app.cdevlog.com`
- **nginx** no container web faz proxy de `/api/*` para `api.cdevlog.com` (interno)
- **Auth (Better Auth):** `BETTER_AUTH_URL=https://app.cdevlog.com` — callbacks OAuth passam pelo proxy
- **Cookies:** same-origin (sem cross-subdomain), setados em `app.cdevlog.com`
- **CORS:** necessário apenas para `https://app.cdevlog.com`
- **Decisão:** não usar subdomínios separados para auth — tudo passa pelo proxy para manter cookies same-origin

## Padrões de tratamento de erro no frontend
- **`apiFetch` (src/lib/api.ts):** wrapper centralizado sobre `fetch`. Lança `ApiError` em respostas não-ok. Todas as chamadas à API devem usar `apiFetch`, nunca `fetch` direto.
- **Queries (TanStack Query):** usar `error` do `useQuery` para exibir mensagem ao usuário. Desabilitar retry em 401.
- **Mutations:** tratar erro no `onError` ou via try/catch. Exibir feedback visual ao usuário.
- **Login:** mostrar mensagem de erro na tela, não só no console. Usar estado `loading` para feedback durante o fluxo OAuth.
- **Regra geral:** nunca acessar propriedades de dados da API sem verificar se existem. O `if (!data) return null` deve vir antes de qualquer renderização de dados.

## Variáveis de ambiente necessárias (.env)
```env
DATABASE_URL="postgresql://financials:financials@localhost:5432/financials_db"
GROQ_API_KEY="gsk_..."
PORT=3001
NODE_ENV=development
```

## Variáveis de ambiente em produção (Coolify)
**API:**
- `DATABASE_URL`, `GROQ_API_KEY`, `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `BETTER_AUTH_URL=https://app.cdevlog.com`
- `CORS_ORIGIN=https://app.cdevlog.com`

**Frontend:** nenhuma env var necessária (tudo relativo via proxy)

## Perfil do dev
Frontend-heavy, aprendendo backend, MCP e arquitetura SaaS.
Prefere comandos manuais com explicações claras do que automações silenciosas.
Claude atua como: arquiteto + desenvolvedor + revisor técnico + tutor.

## Instrução fixa — fim de sessão
Ao final de cada conversa, Claude deve avaliar se a sessão foi relevante e, se sim, atualizar este arquivo.

**Sessão relevante** (atualizar CLAUDE.md):
- Feature concluída ou parcialmente implementada
- Bug resolvido
- Decisão arquitetural tomada
- Nova tabela, rota ou pacote criado
- Qualquer item do checklist "Estado atual" que pode ser marcado

**Sessão não relevante** (não precisa atualizar):
- Apenas dúvidas conceituais
- Leitura de código sem alterações
- Tentativas revertidas sem resultado

## Próximas ações (para próximas sessões)
1. **Frontend - Polimentos:**
   - Instalar Sonner para toasts de feedback (criar/deletar transação)
   - Settings page (tema + logout + info do usuário)
   - Testar responsividade em mobile real
   - Ajustar glassmorphism se necessário após ver em produção
2. **API - Melhorias:**
   - Rate limiting para chat
   - Validar respostas do Claude (segurança)
3. **Deploy:**
   - Monitorar performance em produção
   - Adicionar PWA (offline support)
