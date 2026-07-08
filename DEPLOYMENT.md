# Deployment & Environment Reference

This document provides guidelines for deploying the MERKO platform to staging and production environments.

---

## 🌎 Deployment Environments

* **Frontend (apps/customer & apps/management):** Hosted on **Vercel** with global Edge caching and automatic preview deploys linked to pull requests.
* **Backend Engine (apps/api & background workers):** Deployed to **Railway** inside isolated Docker containers.
* **Database & Cache:** PostgreSQL and Redis instances hosted on managed platforms (AWS RDS / Upstash Redis) with PgBouncer connection pooling.
* **CDN & DNS:** Cloudflare manages DNS, enforces SSL/TLS, and caches static uploads from Cloudinary.

---

## 🔑 Environment Variables Reference

| Variable Name | Environment Scopes | Description / Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | API, Workers | Connection string targeting PostgreSQL pooler (PgBouncer). |
| `REDIS_URL` | API, Workers | Connection URI targeting Upstash Redis. |
| `JWT_SECRET` | API | HS256 secret key signature. |
| `RAZORPAY_KEY_ID` | API, Customer | Public client key for Razorpay checkout. |
| `RAZORPAY_KEY_SECRET`| API | Private key used to sign and verify webhooks. |
| `CLOUDINARY_URL` | API | Private API upload connection string. |
| `SENDGRID_API_KEY` | Workers | Transmits email notifications. |
| `TWILIO_AUTH_TOKEN` | Workers | Twilio API authentication for WhatsApp templates. |
| `NEXT_PUBLIC_API_URL`| Customer, Admin | Target API endpoint for frontend client Axios calls. |

---

## 🚀 Execution & Command Guide

### Run Production Build Locally
```bash
# Clean previous builds
pnpm clean

# Run compilation across the monorepo workspace
pnpm build
```

### Apply Database Migrations
Always run dry-run tests of Prisma schemas before modifying production databases.
```bash
# Push migration file directly to db
npx prisma migrate deploy --schema=./apps/api/prisma/schema.prisma
```

### Docker Launch (Production Sandbox)
```bash
# Launch Docker images in background
docker compose -f docker-compose.prod.yml up --build -d
```

For staging validation procedures, refer to the complete [Deployment Documentation](docs/deployment.md).
