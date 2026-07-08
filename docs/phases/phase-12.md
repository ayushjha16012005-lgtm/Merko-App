# Phase 12: Production Deployment

## 1. Goal
Configure production hosting, enable database pooling and replicas, set up Cloudflare DNS routing, and integrate Sentry crash telemetry.

---

## 2. Features Completed
* **Railway Multi-Container Deploys:** API gateway, background workers, and Cron engines running on production Railway services.
* **Database Pooling & Replicas:** PgBouncer connection pooling and read-replica database routing.
* **Email & SMS Verification:** SPF/DKIM domain verification on SendGrid, and SMS templates approved on Twilio.
* **DNS & Edge Proxies:** Cloudflare routing with SSL/TLS **Full (Strict)** and DDoS security rules.
* **Observability Dashboard:** Sentry telemetry alerts and Railway monitors tracking API latency.

---

## 3. Technical Implementation
* **Connection Pooling:** Integrated PgBouncer in transaction mode to support up to 1,000 active app clients with a pool limit of 100 database connections:
  ```
  DATABASE_URL="postgresql://postgres:password@localhost:6432/merko?pgbouncer=true"
  ```
* **Telemetry Integrations:** Sentry SDK integrations added to the Express API and Next.js frontends to capture and log unhandled exceptions.

---

## 4. Challenges Solved
* **Database Connection Pool Exhaustion:** Resolved issues where server processes exhausted database connection limits during traffic spikes. Handled this by placing PgBouncer in transaction mode in front of PostgreSQL, reducing database connection count under load.
* **Stale Static Asset Servicing:** Prevented stale asset deliveries after updates by applying Cloudflare caching policies that automatically purge static caches on Vercel build deployments.

---

## 5. Deliverables
* `/docker-compose.prod.yml` — Production service orchestration.
* `/apps/api/src/utils/dbReplica.ts` — Read-replica database router.
* `/apps/api/sentry.server.config.ts` — Crash tracking configuration.
