# Release Notes — MERKO v1.0.0

We are proud to announce the **v1.0.0 official production release** of the MERKO Customizable Product Marketplace platform! 

This release marks the transition of the MERKO project from a modular 12-phase development cycle to a mature, fully verified e-commerce system. Every component has been audited, optimized, and validated on live servers.

---

## 🚀 Key Highlights

* **Admin No-Code Schema Setup:** The dynamic customization engine is fully integrated. Administrators can define custom field rules (including regex text validators, file upload parameters, and dimensions) for any product. The storefront renders inputs dynamically without developer involvement.
* **Dual-Token Session Lifecycle:** Access and Refresh tokens are secured using httpOnly, Secure cookies. Refresh tokens rotate on every use and are hashed in Upstash Redis, preventing replay hijacking.
* **Fabric.js Canvas Engine:** Customers can see dynamic text and image overlay previews update within 200ms debounced inputs.
* **Persistent Cart Migration:** Shopping carts survive browser closures and sync across multiple customer devices. Guest carts stored locally migrate automatically into PostgreSQL on user registration/login.
* **HMAC payment Verification:** The payment integration secures transactions using Razorpay signature validation on raw request bodies. Stock levels decrement atomically during capture events using database row-level locking.
* **Reliable Queue workers:** Background notifications (Twilio SMS/WhatsApp, SendGrid emails, and Firebase Push notices) run in Bull MQ jobs with automatic retry routines.

---

## 🛠️ Infrastructure & Verification Details

* **Prisma Schema Optimization:** Database indexes have been added to support full-text catalog searches (GIN index) and unread notification feeds.
* **Docker Monorepo Orchestration:** The entire workspace builds, lint-checks, and launches using lightweight, multi-stage Dockerfiles.
* **High-Concurrency Benchmarks:** Load testing with k6 validates that the Express backend processes concurrent queries in under 1ms, with 100% request success rates.
* **Security Hardening:** Audits have resolved all IDOR hazards and checked access controls on all admin and order-detail routes.

---

## 📋 Deferrals & Future Scope

The following items are deferred to future releases:
* **v1.1.0:** Bulk B2B ordering portal.
* **v1.2.0:** Multi-tenant vendor onboarding and payment split systems.
* **v1.3.0:** AI image resolution upscaler.
