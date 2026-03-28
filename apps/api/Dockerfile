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
RUN pnpm --filter @financials/api deploy /app/deploy
RUN cd /app/deploy && node_modules/.bin/prisma generate

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/deploy .
EXPOSE 3001
CMD ["node", "dist/server.js"]
