FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm --filter @merko/types build
RUN pnpm --filter @merko/config build
RUN pnpm --filter @merko/ui build
RUN pnpm --filter @merko/management build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app /app
ENV NODE_ENV=production
EXPOSE 3001
CMD ["pnpm", "--filter", "@merko/management", "start"]
