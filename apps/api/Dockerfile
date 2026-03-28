FROM node:22-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/core/package.json ./packages/core/
COPY packages/mcp/package.json ./packages/mcp/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @financials/api exec prisma generate
RUN pnpm --filter @financials/shared build
RUN pnpm --filter @financials/core build
RUN pnpm --filter @financials/mcp build
RUN pnpm --filter @financials/api build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Root node_modules (pnpm virtual store + workspace symlinks)
COPY --from=builder /app/node_modules ./node_modules

# API app + its own node_modules (pnpm symlinks para deps da api)
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

# Packages compilados (alvo dos symlinks do workspace)
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/core/package.json ./packages/core/package.json
COPY --from=builder /app/packages/mcp/dist ./packages/mcp/dist
COPY --from=builder /app/packages/mcp/package.json ./packages/mcp/package.json

EXPOSE 3001
CMD ["node", "apps/api/dist/server.js"]
