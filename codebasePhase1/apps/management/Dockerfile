FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages ./packages
COPY apps/management ./apps/management
COPY tsconfig.json ./
RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm --filter @merko/types build
RUN pnpm --filter @merko/config build
RUN pnpm --filter @merko/ui build
RUN pnpm --filter @merko/management build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app /app
EXPOSE 3001
CMD ["pnpm", "--filter", "@merko/management", "start"]
