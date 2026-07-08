# Deployment Manual & Staging Runbook

This document details the configuration, deployment pipeline, and database migrations required to host the MERKO platform in production environments.

---

## 1. Local Development Orchestration

We use Docker Compose to run PostgreSQL and Redis instances for local testing.

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: merko-postgres-dev
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: merko_dev
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d merko_dev"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: merko-redis-dev
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

Launch services:
```bash
docker compose up -d
```

---

## 2. Environment Variables Specification

The backend and frontend apps load configuration keys from local environmental variables:

### 2.1 Backend Engine (`apps/api`)
* `DATABASE_URL`: Connection string targeting PgBouncer transaction pooler.
  * Form: `postgresql://<user>:<pwd>@<host>:5432/<db>?pgbouncer=true&connection_limit=20`
* `REDIS_URL`: Endpoint of the managed Upstash instance.
  * Form: `rediss://default:<token>@<host>:<port>`
* `JWT_SECRET`: HS256 secret string verifying user cookies.
* `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Sandbox or Production payment gateway keys.
* `CLOUDINARY_URL`: Shared image bucket credentials.
* `SENDGRID_API_KEY`: API token managing email dispatch.
* `TWILIO_ACCOUNT_SID` & `TWILIO_AUTH_TOKEN`: WhatsApp SMS gateway.

### 2.2 Frontend Client (`apps/customer` & `apps/management`)
* `NEXT_PUBLIC_API_URL`: Root path of API gateway controllers (e.g., `https://api.merko.in/api/v1`).
* `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Client public identifier loaded by checkout JS overlays.

---

## 3. Prisma Migrations Execution

Database migrations must compile and deploy atomically within CI pipelines.

```bash
# Validate Prisma schema for consistency
pnpm --filter @merko/api prisma validate

# Create a local development migration mapping schema changes
pnpm --filter @merko/api prisma migrate dev --name name_of_migration

# Deploy pending migrations inside target CD systems (Railway release command)
pnpm --filter @merko/api prisma migrate deploy
```

---

## 4. Production Build & Deployment Checklist

### 4.1 Deployment Runbook (Railway + Vercel)
1. **Database Provisioning:** Create a managed PostgreSQL 16 database. Add PgBouncer inside connection routes.
2. **Environment secrets:** Configure API parameters inside Railway project variables. Set the target build trigger command:
   ```bash
   pnpm run build && pnpm --filter @merko/api prisma migrate deploy
   ```
3. **Queue Activation:** Launch a separate container instance inside Railway running:
   ```bash
   pnpm --filter @merko/api run start:worker
   ```
4. **Vercel Project Setup:** Add `apps/customer` and `apps/management` as separate Next.js projects inside Vercel. Bind `NEXT_PUBLIC_API_URL` to point to the active Railway API Gateway.
5. **DNS Mapping:** Set Cloudflare rules pointing to Vercel/Railway hosts. Enable SSL/TLS **Full (Strict)**.

### 4.2 Pre-Flight Checklist
* [ ] DB Connection check completes under 100ms.
* [ ] SSL certificates verified and active on all subdomains.
* [ ] Sentry alert configurations validated and linked to Slack alert channels.
* [ ] Razorpay webhook HMAC key signature matching test webhooks.
* [ ] SendGrid domain authentication records (SPF, DKIM, DMARC) verified.
* [ ] Uptime monitoring tool targeting `/api/v1/health` dashboard.
