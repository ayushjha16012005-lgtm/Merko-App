# Project Structure

This document details the layout of the MERKO monorepo workspace. The codebase uses **pnpm workspaces** and **Turborepo** to share configuration, types, and UI components across the API service and the frontend portals.

---

## 🏢 Monorepo Root Directory

```
merko-monorepo/
├── .github/                   ← CI/CD configurations, workflows, and issue/PR templates
│   ├── ISSUE_TEMPLATE/        ← GitHub issue templates (bug reports, feature requests)
│   └── workflows/             ← GitHub Actions CI and Release pipelines
├── docs/                      ← Technical manuals, schemas, and 12-phase completion reports
│   ├── images/                ← System screen asset placeholders
│   └── phases/                ← Detailed chronological development logs (phase-01.md to phase-12.md)
├── apps/
│   ├── api/                   ← Express.js backend backend workspace
│   ├── customer/              ← Next.js 15 customer storefront portal
│   └── management/            ← Next.js 15 admin administration portal
├── packages/
│   ├── config/                ← Shared environment validation schemas, constants, and lint rules
│   ├── types/                 ← Shared TypeScript definitions, DTO schemas, and database interfaces
│   └── ui/                    ← Shared React design system (buttons, inputs, layouts)
├── docker-compose.yml         ← Orchestration schema for local services (Postgres, Redis, Apps)
├── package.json               ← Root package configuration defining workspace scopes and pipeline triggers
├── pnpm-workspace.yaml        ← Scope definitions binding apps/ and packages/ directories
├── turbo.json                 ← Turborepo build caching and pipeline dependency map
└── tsconfig.json              ← Global TypeScript configuration shared by workspaces
```

---

## ⚙️ Backend Architecture Layout (`apps/api`)

The API service follows a modular domain structure, grouping routes, controllers, services, repositories, and validation schemas by resource.

```
apps/api/
├── src/
│   ├── index.ts               ← Application entry point & Express startup configuration
│   ├── middleware/            ← Express pipeline interceptors (auth, rateLimit, error, correlationId)
│   ├── modules/               ← Scoped feature modules
│   │   ├── auth/              ← Login, registration, token refresh, and OTP service
│   │   ├── products/          ← Product CRUD, variant logic, search, and category listing
│   │   ├── customization/     ← Dynamic field schema setup & print-ready canvas preview builders
│   │   ├── cart/              ← Persistent shopping cart store
│   │   ├── orders/            ← Atomic checkout pipelines and transaction managers
│   │   ├── payments/          ← Razorpay verification, webhooks, and refund jobs
│   │   └── notifications/     ← Bull MQ handlers for FCM, SMS, and email queues
│   └── utils/                 ← Database, Redis connection wrappers, and error classes
├── prisma/
│   ├── schema.prisma          ← PostgreSQL database model definitions
│   └── migrations/            ← Prisma DB migration history folder
├── Dockerfile                 ← Multi-stage production container build rules
└── package.json               ← Local dependencies and run tasks
```

---

## 💻 Frontend Client Layout (`apps/customer` & `apps/management`)

Both Next.js frontends follow the standard App Router structure, consuming shared package UI modules.

```
apps/customer/ (or apps/management/)
├── src/
│   ├── app/                   ← Next.js page layout and routing files
│   │   ├── (auth)/            ← Scoped login, signup, and reset pages
│   │   ├── products/          ← Storefront catalog grids and PDP templates
│   │   ├── profile/           ← Saved user addresses and order history lists
│   │   ├── layout.tsx         ← Base HTML document and root context wrapper
│   │   └── page.tsx           ← Home view template
│   ├── components/            ← Local UI components (header, sidebar, cart drawers)
│   ├── hooks/                 ← Client-side query fetch wrappers (TanStack Query hooks)
│   ├── store/                 ← Zustand state store modules (cart, profile user cache)
│   └── providers/             ← React Query, theme, and authentication context providers
├── public/                    ← Static assets, icons, manifest
├── Dockerfile                 ← Production client deployment rules
└── package.json               ← Local workspace configuration
```
