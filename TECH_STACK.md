# Technology Stack Details

The MERKO platform uses a modern, highly optimized stack designed for developer speed, absolute type-safety, and horizontal scaling.

---

## 💻 Languages & Runtime
* **Node.js** (v20.x): Runtime environment for API Gateway, background workers, and SSR servers.
* **TypeScript** (v5.x): Enforced strict compilation across all workspaces (apps and packages).

---

## 🏢 Frontend Monorepo Apps
* **Next.js** (v15.5.x): The foundational React framework for:
  * **Customer Storefront** (Static pre-rendering, ISR, and dynamic Client component views).
  * **Management Portal** (Single-page app structure with role-based routing).
* **Tailwind CSS & Shadcn UI:** Built-in design system tokens enabling consistent look and feel across both portal clients.
* **State Management:**
  * **Zustand** (v5.x): Ultra-lightweight client-side stores tracking cart items, local user session details, and UI layout toggles.
  * **TanStack Query** (v5.x): Server-side state synchronizer and cache manager (with automatic retry and refetch hooks).
* **Forms & Validation:** **React Hook Form** integrated with **Zod** schema validations.
* **Interactive Canvas:** **Fabric.js** (v6.x) for drawing customer customizations, text coordinates, and product boundary rendering.

---

## ⚙️ Backend API Engine
* **Express.js** (v4.21.x): Modular HTTP routing gateway.
* **Prisma ORM** (v5.22.x): Object-relational mapping tool compiling database queries and handling structural PostgreSQL migrations.
* **Background Jobs:** **Bull MQ** (v5.x) managed via **Upstash Redis** backend for transactional email, SMS queuing, and status-update fanout.
* **Logging & Observability:** Winston structured JSON logger integrated with Sentry error monitoring and Express correlation-id middlewares.

---

## 🗄️ Database & Storage Layer
* **PostgreSQL** (v16): Primary SQL relational store with GIN full-text indexes and row-level locking capabilities.
* **Redis** (v7): Key-value store utilized for API request rate-limiting, session refresh token blacklisting, and job queues.
* **Cloudinary:** Cloud-based media storage hosting product catalogs, user customization uploads, and generated print-ready PNG files.

---

## 🛠️ DevOps & Deployment
* **Containerization:** Docker multi-stage configurations packaging apps separately for target servers.
* **Orchestration:** Docker Compose launching local API, frontend, Redis, and Postgres environments.
* **Monorepo Build System:** **Turborepo** + **pnpm** resolving local dependency loops with package caching.
* **CI/CD Pipelines:** GitHub Actions running lint, typecheck, build verification, and automated drafting of repository releases.
