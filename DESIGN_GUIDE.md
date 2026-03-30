# Financials IA — Guia de Design & Usabilidade

> Referência de design para o frontend. Última atualização: sessão de redesign v2.

---

## Identidade Visual

### Filosofia
Interface financeira **séria sem ser fria**. O dinheiro gera ansiedade — o design transmite **controle, clareza e calma**. Nada de excesso visual. Cada pixel tem função.

### Paleta — Regra Absoluta
**O sistema é 100% monocromático.** Cores aparecem SOMENTE em referências numéricas quando estritamente necessário. Tudo mais é preto, branco e cinza.

| Elemento | Cor permitida |
|---|---|
| UI em geral (cards, bordas, ícones, textos) | Apenas `foreground`, `muted-foreground`, `border` — nunca coloridos |
| Valores numéricos (opcional) | Pode usar `+` / `−` para diferenciar, sem cor |
| Alertas de saúde / estado crítico | `destructive` do sistema (apenas quando necessário) |

**Regra de ouro:** se a tela tiver qualquer cor além de preto/branco/cinza fora de um número ou alerta crítico, está errado.

### Glassmorphism — Sistema de Superfície
O sistema usa glassmorphism em cards e sidebar:

| Modo | Background da página | Card | Sidebar |
|---|---|---|---|
| Light | `oklch(0.93 0 0)` (cinza suave) | `oklch(1 0 0 / 0.75)` + `backdrop-blur-md` | `oklch(1 0 0 / 0.6)` + `backdrop-blur-md` |
| Dark | `oklch(0.1 0 0)` (quase preto) | `oklch(1 0 0 / 0.06)` + `backdrop-blur-md` | `oklch(1 0 0 / 0.04)` + `backdrop-blur-md` |

**Por que funciona:** o fundo levemente cinza (light) ou escuro (dark) cria profundidade para o glass ser visível. Cards ficam "flutuando" sobre o fundo.

### Bordas
- **Light mode:** `foreground/8%` → borda preta suave
- **Dark mode:** `foreground/8%` → borda branca suave
- **Nunca:** borda azul, borda colorida, `ring` colorido
- Sidebar usa `foreground/6%` (ainda mais sutil)

### Tipografia
| Elemento | Tamanho | Peso |
|---|---|---|
| Título de página | `text-2xl` | `font-bold tracking-tight` |
| Título de card | `text-base` | `font-medium` |
| Subtítulo de card | `text-sm` | `text-muted-foreground` |
| Valor monetário grande | `text-3xl` | `font-bold tracking-tight` |
| Valor monetário médio | `text-xl` ou `text-2xl` | `font-bold` |
| Corpo | `text-sm` | `font-normal` |
| Labels/captions | `text-xs` | `font-medium text-muted-foreground` |
| Sidebar nav | `text-xs` | `font-medium` |

### Ícones
Lucide, 16px (`h-4 w-4`) em geral, 20px (`h-5 w-5`) em nav. `opacity-70` em ícones decorativos da sidebar.

---

## Temas (3 modos)

### Implementação
`next-themes` com `attribute="class"` + `defaultTheme="system"`. ThemeProvider no topo da árvore (antes do QueryClientProvider).

### Toggle
`DropdownMenu` com 3 opções: Sun (Claro), Moon (Escuro), Monitor (Sistema). Ícone exibido reflete o `resolvedTheme`, não o selecionado.

### Cuidados
- **Gráficos:** usar `var(--foreground)` como fill — funciona automaticamente nos dois modos
- **Glassmorphism dark:** `opacity` muito baixa (6%) para não clarear demais o card no fundo escuro
- **Skeletons:** visíveis mas sutis em ambos os temas
- **`suppressHydrationWarning`** no `<html>` para evitar flash do next-themes

---

## Layout Principal (AppShell)

### Desktop (≥ 1024px) — Sidebar
- Largura: `w-56` (não colapsa — simplicidade acima de tudo)
- Fundo: glass `bg-sidebar backdrop-blur-md`
- Borda direita: `border-r border-foreground/[0.06]`
- Logo: `text-sm font-semibold text-foreground/70`
- Nav items: `text-xs font-medium`, gap `gap-0.5`, padding `px-3 py-2`
- Item ativo: `bg-foreground/8 text-foreground`
- Item inativo: `text-muted-foreground hover:bg-foreground/5 hover:text-foreground`
- Ícones: `h-4 w-4 opacity-70`
- Footer: `border-t border-foreground/[0.06]` + `UserMenu` + `ThemeToggle`

### Mobile (< 1024px)
- `MobileHeader`: logo + ThemeToggle + UserMenu
- `BottomNav`: 4 ícones fixo no bottom, `h-16`
- Main: `pb-20` para não ficar atrás do BottomNav

---

## Cards — Estrutura Padrão

Todos os cards **devem ter o mesmo tamanho** quando em grid. Usar `grid` com `items-stretch`.

### Card KPI (Dashboard)
```
[titulo pequeno muted]     [ícone 16px muted]
[valor grande bold]
─────────────────────────────────
[status text semibold]     [seta ícone]
[descrição xs muted]
```
- `CardHeader`: `flex flex-row items-start justify-between space-y-0 pb-2`
- Valor: `text-3xl font-bold tracking-tight`
- Separador: `border-t border-border pt-3` dentro de `CardContent`

### Card Lista (Recurring)
- `py-4` no card, `CardContent` com flex justify-between
- Hover: `hover:-translate-y-0.5 transition-transform`

---

## Animações de Entrada / Saída

### Entrada (mount)
Usar `animate-in fade-in slide-in-from-bottom-[N] duration-[Xms] [animation-fill-mode:both]` com `style={{ animationDelay }}`.

Padrões de delay:
- Header da página: `0ms`
- Cards KPI: `0ms`, `75ms`, `150ms`, `225ms`
- Seções abaixo: `300ms`, `375ms`
- Itens de lista: `i * 40ms` (stagger)
- Linhas de tabela: `480ms + i * 40ms`

### Interações (hover)
- Cards: `hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`
- Linhas de tabela: `hover:bg-foreground/[0.03] transition-colors`
- Botões destrutivos (trash): `text-muted-foreground/50 hover:text-foreground transition-colors`

---

## Tela de Login

- Fundo: `min-h-dvh bg-background`
- Card centralizado com `animate-in fade-in duration-500`
- Botão Google: `variant="outline" size="lg"` com `GoogleIcon` SVG
- Estados: loading (Loader2 + "Conectando..."), erro (Alert destructive)

---

## Dashboard

### Hierarquia visual
1. **4 KPI Cards** — mesma altura, grid `grid-cols-2 lg:grid-cols-4`
2. **Alertas** — `Alert` com ícone `AlertTriangle` se houver alertas de saúde
3. **Gráfico + Distribuição** — `lg:grid-cols-5`, chart ocupa `lg:col-span-3`, progress bars `lg:col-span-2`
4. **Tabela de transações** — full width, últimas 8

### Gráfico de barras (Recharts)
- `fill="var(--foreground)"` `opacity={0.85}` — monocromático
- `XAxis`, `YAxis` com `tick={{ fill: "var(--muted-foreground)" }}`
- `Tooltip` com `contentStyle` usando `var(--card)`, `var(--border)`, `var(--foreground)`
- `cursor={{ fill: "var(--muted)", opacity: 0.5 }}`

### Progress bars por categoria
- `Progress` com `h-1.5`
- Nome truncado com `max-w-[120px]`
- Percentual com `font-bold tabular-nums`
- Valor em `text-xs text-muted-foreground`

### Tabela de transações
- Cabeçalho: `text-xs font-medium uppercase tracking-wider text-muted-foreground`
- Divisores: `divide-y divide-foreground/[0.06]`
- Valor: `font-bold tabular-nums` com prefixo `+` ou `−`
- Colunas responsivas: Categoria `hidden sm:table-cell`, Data `hidden md:table-cell`

---

## Lançamentos

- Formulário em `Card` com `CardHeader + CardTitle`
- Inputs: `border border-foreground/[0.08] bg-background focus:ring-1 focus:ring-foreground/20`
- Grid 2-col para valor/data e tipo/categoria
- Botão submit: `Button` full-width com `Loader2` quando pending
- Tabela: mesma estrutura do Dashboard, com ícone `Trash2` para remover
- Remove button: `text-muted-foreground/50 hover:text-foreground`

---

## Recorrências

- 2 cards resumo no topo (quando há dados): Receitas fixas / Despesas fixas
- Formulário em Card
- Lista com stagger animation
- Empty state: ícone `Repeat` centralizado

---

## Chat

### Mensagens
- **Usuário:** `bg-foreground text-background rounded-br-sm` (invertido)
- **Assistente:** `bg-card backdrop-blur-md border border-foreground/[0.08] rounded-bl-sm`
- `max-w-[80%]`, `whitespace-pre-wrap leading-relaxed`

### Empty state
- Ícone `Sparkles` em card glass centralizado
- Sugestões como pills: `border border-foreground/[0.08] bg-card backdrop-blur-md rounded-full`

### Input area
- `border-t border-foreground/[0.06]` separando do chat
- Textarea com glass: `bg-card backdrop-blur-md border border-foreground/[0.08]`
- Botão send: `Button size="icon"` com ícone `Send`

---

## Estados Obrigatórios

| Estado | Implementação |
|---|---|
| Loading | `Skeleton` por seção (nunca tela inteira) |
| Empty | Ícone + mensagem + CTA quando lista vazia |
| Error | `Alert variant="destructive"` com `AlertTriangle` |
| Pending mutation | `Loader2 animate-spin` no botão, botão `disabled` |

---

## Checklist de Qualidade

- [ ] Nenhuma cor fora de preto/branco/cinza (exceto alertas críticos)
- [ ] Glassmorphism visível em light E dark mode
- [ ] Cards com mesma altura no mesmo grid
- [ ] Animações staggered na entrada de cada seção
- [ ] Hover em cards e linhas de tabela
- [ ] Skeleton para cada dado assíncrono
- [ ] Empty state para cada lista
- [ ] Valores monetários em pt-BR (R$ 1.234,56)
- [ ] Sidebar: texto pequeno, sem cor de destaque, sem borda azul
- [ ] `+` / `−` para diferenciar receita/despesa sem cor
