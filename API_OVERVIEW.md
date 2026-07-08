# API Architecture Overview

This document provides a technical overview of the MERKO platform's RESTful API architecture.

---

## 🛡️ Design Principles

* **Resource-Based Routing:** All URL patterns represent resources and map directly to standard HTTP verbs.
* **API Versioning:** Versioning is implemented in the path prefix: `/api/v1/`.
* **Centralized Security:** Scopes, role validation (RBAC), and authentication (JWT verification) are enforced via route middleware before request parameters reach business controllers.
* **Standard Response Envelope:** Every JSON response conforms to a predictable model envelope:
  ```json
  {
    "success": true,
    "data": {},
    "error": null,
    "meta": {
      "timestamp": "2026-07-08T11:15:00.000Z",
      "correlationId": "uuid-v4-correlation-id"
    }
  }
  ```

---

## 🔑 Authentication & Session Flow

The API enforces session verification using a **dual-token JWT lifecycle** stored inside secure cookies:

1. **Access Token:** Short-lived JWT (15-minute expiry) signed with `HS256`. Transmitted via httpOnly, Secure, SameSite=Strict cookies. Used to verify identity on every request.
2. **Refresh Token:** Long-lived UUID string (7-day expiry) stored inside a distinct cookie with path restriction `/api/v1/auth/refresh`. Maps to a SHA-256 hashed signature inside Upstash Redis cache.
3. **Rotation Mechanism:** When a user refreshes their token via `/api/v1/auth/refresh`, the old refresh token is immediately deleted from Redis, and a new pair is issued to prevent token replay attacks.

---

## 📈 Endpoint Mindmap

```
/api/v1
  ├── /auth
  │     ├── POST /register             ← Register new user
  │     ├── POST /login                ← Email login
  │     ├── POST /otp/send             ← Send SMS OTP
  │     ├── POST /otp/verify           ← Verify SMS OTP
  │     ├── POST /refresh              ← Refresh session
  │     └── POST /logout               ← Revoke session
  ├── /products
  │     ├── GET /                      ← Paginated product search & catalog
  │     ├── GET /:slug                 ← Product detail
  │     ├── GET /:id/schema            ← Product custom field schema
  │     └── POST / [Admin]             ← Create new catalog product
  ├── /cart
  │     ├── GET /                      ← Get user cart items
  │     ├── POST /items                ← Add item to cart
  │     └── PUT /items/:id             ← Update quantity / customization
  ├── /orders
  │     ├── POST /                     ← Atomic checkout transaction
  │     ├── GET /                      ← Get paginated order history
  │     └── POST /:id/cancel           ← Cancel order before production
  └── /payments
        ├── POST /create-order         ← Initialize Razorpay transaction
        └── POST /webhook              ← HMAC-SHA256 signature verification webhook
```

For detailed request payloads, authentication requirements, and response structures, please refer to the complete [API Documentation](docs/api.md).
