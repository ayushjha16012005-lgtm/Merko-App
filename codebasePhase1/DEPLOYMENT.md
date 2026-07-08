# MERKO Production Deployment Guide

This guide outlines the steps to deploy the MERKO monorepo (Customer App, Management Admin, API, PostgreSQL, Redis) using the provided `docker-compose.yml` for a production environment.

## Prerequisites
- A remote Linux server (Ubuntu 22.04 LTS recommended)
- **Docker** and **Docker Compose** installed.
- Git installed.
- Domain names pointing to your server's IP address (e.g., `merko.com`, `admin.merko.com`, `api.merko.com`).
- Reverse Proxy (Nginx, Traefik, or Caddy) to route traffic to the respective containers and terminate SSL.

## 1. Clone the Repository
SSH into your production server and clone the repository.
```bash
git clone https://github.com/your-org/merko.git
cd merko
```

## 2. Configure Environment Variables
Copy the production environment example and fill in the required secure keys.
```bash
cp .env.production.example .env
nano .env
```
Ensure you generate a secure `JWT_SECRET` and configure the database passwords.

## 3. Start the Infrastructure (Database & Cache)
Before starting the applications, spin up the databases.
```bash
docker-compose up -d postgres redis
```

## 4. Run Database Migrations & Seeding
We need to apply Prisma migrations to the production database. 

1. Install `pnpm` globally if not available, or use `npx`:
```bash
# If you have Node.js installed locally on the host:
npx prisma migrate deploy --schema=./apps/api/prisma/schema.prisma
```
*(Alternatively, you can run this command inside the `merko-api` container once it starts).*

2. To seed the database with catalog data:
```bash
npx tsx ./apps/api/prisma/seed.ts
```

## 5. Build and Deploy Applications
Start the API, Customer, and Management apps. The `docker-compose` setup will build the images.
```bash
docker-compose up -d --build api customer management
```

## 6. Configure Reverse Proxy
Map your domains to the respective internal Docker ports:
- `api.merko.com` -> `http://localhost:4000`
- `merko.com` -> `http://localhost:3000`
- `admin.merko.com` -> `http://localhost:3001`

### Example Nginx Configuration for Customer App
```nginx
server {
    listen 80;
    server_name merko.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 7. Monitoring & Logs
You can view logs for any service to ensure it's running smoothly.
```bash
docker-compose logs -f api
docker-compose logs -f customer
```

## Continuous Integration
MERKO is configured with GitHub Actions (`.github/workflows/ci.yml`) which automatically lints, typechecks, and builds the codebase on pushes to `main`. 
