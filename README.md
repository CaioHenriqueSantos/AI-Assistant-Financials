# Financials IA

Assistente financeiro inteligente com IA.

---

## ✨ Funcionalidades

- Dashboard com resumo financeiro e score de saúde
- Lançamento de receitas e despesas por categoria
- Recorrências e projeção de fluxo de caixa
- Chat com assistente IA baseado em dados reais

---

## 📦 Pré-requisitos

- Node.js v18+
- pnpm
- Docker Desktop

---

## 🚀 Instalação

```bash
git clone https://github.com/seu-usuario/financials-ia.git
cd financials-ia
pnpm install
cp .env.example .env
# Preencha o .env com suas chaves
```

---

## 🎯 Rodando

```bash
# Banco de dados
docker compose up -d db

# Migrations
pnpm --filter @financials/api db:migrate

# Tudo junto
pnpm dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

---
