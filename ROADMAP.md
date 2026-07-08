# Product & Engineering Roadmap

This document outlines the milestones, priorities, and long-term roadmap for the MERKO Customizable Product Marketplace platform.

---

## 🎯 Completed Milestones (v1.0.0 Release)
* **Architecture foundation:** Monorepo with Turborepo, pnpm workspaces, and Docker orchestration.
* **Core Security & Auth:** JWT access/refresh token rotation, httpOnly cookie sessions, SMS OTP, and RBAC middleware.
* **Product Catalog:** Variant pricing, categories, dynamic field builder, and Redis caching.
* **Customization Engine:** Live preview canvas, image overlays, and dynamic form renderers.
* **Transaction Pipeline:** Persistent shopping cart, Razorpay payment verification, and order processing.
* **Operational Management:** Admin portal dashboard, order pipelines, coupon systems, and Winston audit logs.
* **Enterprise Features:** Background job execution (Bull MQ), transactional notifications (SMS, Email, Push), and end-to-end integration testing.

---

## 🚀 Near-Term Goals (v1.1.0 - Next 3 Months)

### Bulk B2B Ordering Portal
* **Goal:** Enable corporate clients to place bulk orders (e.g., 500+ ID cards or T-shirts) via spreadsheet upload.
* **Technical details:**
  * Bulk CSV/XLSX parser service using ExcelJS.
  * Tiered volume discount schemas configured per product variants.
  * Draft orders workflow where sales admins approve pricing surcharges.

### Print-on-Demand Partner API
* **Goal:** Allow external print shops to fetch and fulfill orders directly via public API endpoints.
* **Technical details:**
  * API Key generation and management interface within the Super Admin portal.
  * Webhook subscription management for print shops to listen to `order.production_ready` events.
  * Scoped OAuth flows limiting partners to read-only access on order preview configurations.

---

## 📈 Mid-Term Goals (v1.2.0 - Next 6 Months)

### Multi-Tenant Vendor Marketplace
* **Goal:** Allow third-party printers to list their products, configure their customization schemas, and receive orders.
* **Technical details:**
  * Database schema modification to support vendor/tenant scoping.
  * Vendor onboarding portal (registration, KYC validation, bank payout verification).
  * Automated payment split routines routing marketplace fees and vendor payouts on checkout.

### AI Design Upscaler & Generator
* **Goal:** Integrate AI tools to upscale customer-uploaded images to 300+ DPI print-ready formats.
* **Technical details:**
  * integration with Replicate or self-hosted Stable Diffusion/ESRGAN microservice.
  * Auto-generation of design suggestions based on product context using Google Gemini API.
  * Automated background layout check warning customers of low-resolution text boundaries.

---

## 🛡️ Future & Infrastructure Scaling (v2.0.0 - Next 12 Months)

* **Multi-Region Database Read-Replicas:** Provision regional Postgres read replicas via AWS Aurora or Railway Enterprise to keep catalog query times under 50ms worldwide.
* **Native Mobile Apps (Flutter/React Native):** Launch iOS and Android applications sharing the same shared Zustand/types core logic.
* **Kafka Event-Stream Migration:** Transition from Bull MQ Redis queues to Apache Kafka for event distribution when processing rate exceeds 10,000 notifications/minute.
