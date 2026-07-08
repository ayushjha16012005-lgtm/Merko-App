# Phase 1: Architecture & Foundation

## 1. Goal
Establish a high-performance, strictly typed monorepo infrastructure designed for parallel frontend portal development and scaling API microservices.

---

## 2. Features Completed
* **Workspace Isolation:** Monorepo architecture separating backend API services and frontend portals using **pnpm workspaces**.
* **Task Pipelines:** Turborepo builds orchestrating compilation caching, ESLint quality passes, and TypeScript checks.
* **Backend Skeleton:** Express.js API shell integrated with Prisma ORM, Winston logging middleware, and global error catchers.
* **Frontend Shells:** Initial client interfaces for the Customer Storefront and Admin Management Portal utilizing Next.js 15.
* **Orchestration:** Multi-stage Docker files and Docker Compose configurations for local databases (PostgreSQL, Redis).

---

## 3. Technical Implementation
* **Monorepo Configuration:** Scoped project domains defined in `pnpm-workspace.yaml` and compiled using Turborepo pipelines in `turbo.json`.
* **Prisma Schema initialization:** Provisioned core tables (`User`, `Address`, `ActivityLog`) with Postgres enum mappings (`UserRole`).
* **Structured Logger:** Integrated Pino HTTP logging to append unique Correlation IDs (`x-correlation-id`) inside incoming request headers.
* **Component Libraries:** Built shared React components in `packages/ui` styled with Tailwind CSS tokens.

---

## 4. Challenges Solved
* **TypeScript Path Aliases (`@/*`):** Resolving module compilation errors when importing shared local library types in next.js/express apps by defining explicit path maps inside the root `tsconfig.json`.
* **Turborepo Caching Hazards:** Ensuring that style updates inside the `@merko/ui` package invalidated the pre-rendered Next.js asset cache by mapping UI files to output targets in `turbo.json`.

---

## 5. Deliverables
* `/apps/api/` — Node/Express API service.
* `/apps/customer/` — Next.js storefront client.
* `/apps/management/` — Next.js admin dashboard client.
* `/packages/config/`, `/packages/types/`, `/packages/ui/` — Shared libraries.
* `/docker-compose.yml` — Container configs.
