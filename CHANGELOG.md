# Changelog

All notable changes to the MERKO platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-06-27

This marks the official release of the MERKO platform. The platform is audited, secured, and validated for production deploy across all 12 development phases.

### Added
- Complete automated end-to-end integration and load tests.
- PgBouncer configuration for database connection pooling.
- Production-ready Docker Compose orchestration.
- PostgreSQL read-replica data mapping.
- Twilio WhatsApp templates approval workflow.
- Continuous deployment workflows via GitHub Actions.

## [0.9.0] - 2026-05-15
### Added
- Dedicated notification background processing service using Bull MQ.
- HTML transactional email templates for SendGrid.
- Push notification support via Firebase FCM.
- Twilio SMS integrations for authentication OTP.

## [0.8.0] - 2026-04-10
### Added
- Admin dashboard KPI telemetry (Revenue, conversion funnels).
- Product, order, and user management views.
- Coupon generation engine (Flat, percentage, shipping discounts).
- CSV and PDF reports export.

## [0.7.0] - 2026-03-01
### Added
- Live design preview engine using Fabric.js / HTML5 canvas.
- Cloudinary server-side photo transformations.
- Print-ready SVG/PDF export engine.
- Atomic order placement transaction wrapper.
- Order lifecycle states: PENDING, PAYMENT_CONFIRMED, IN_PRODUCTION, QUALITY_CHECK, SHIPPED, DELIVERED.

## [0.6.0] - 2026-02-05
### Added
- Razorpay payment gateway integration.
- Webhook signature verification middleware (HMAC-SHA256).
- Server-side stock decrement with row-locking during capture.

## [0.5.0] - 2025-12-18
### Added
- Persistent cart system (DB-backed).
- Anonymous cart localStorage-to-database migration flow on login.
- Promo coupon validation engine.

## [0.4.0] - 2025-11-01
### Added
- Dynamic customization field schema and builder engine.
- Dynamic input components parser (`FieldRenderer`).
- Custom canvas-bounding box configuration per product fields.

## [0.3.0] - 2025-09-10
### Added
- Product catalog CRUD operations (Admin).
- Category parent/child relationships.
- Product variants configuration.
- Full-text search index (GIN index on PostgreSQL).
- Caching logic via Upstash Redis.

## [0.2.0] - 2025-08-01
### Added
- User registration and login APIs.
- JWT Access and Refresh token lifecycle with httpOnly cookies.
- Redis-based Refresh token rotation and verification.
- Twilio SMS OTP logic.
- Role-based Access Control (RBAC) authorization middleware.

## [0.1.0] - 2025-06-09
### Added
- Monorepo folder layout using pnpm workspaces.
- Turborepo orchestration and caching pipeline.
- Express.js API shell with centralized logging (Pino HTTP) and error interceptors.
- PostgreSQL integration with Prisma ORM setup.
- Next.js 15 apps (`customer` and `management`).
- Multi-stage docker files.
