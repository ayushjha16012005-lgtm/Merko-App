# Phase 2: Authentication & RBAC

## 1. Goal
Implement a secure, production-grade session authentication framework with strict Role-Based Access Control (RBAC) and automated refresh token rotation.

---

## 2. Features Completed
* **Customer Registration & Onboarding:** Secure profile setup with phone verification (Twilio SMS OTP).
* **Dual-Token Authentication Lifecycle:** JWT Access tokens (15-min) and Refresh tokens (7-day) stored in secure cookies.
* **Token Rotation (RTR):** Single-use refresh token tokens stored as SHA-256 hashes in Redis, rotated on every usage request.
* **Role Guards:** Scoped permissions authorizing API gateways: `CUSTOMER`, `ADMIN`, `SUPER_ADMIN`.
* **Rate Limiting Protection:** Auth routes rate-limited to 5 calls/minute; 3 OTP mismatches trigger a 15-minute lock.

---

## 3. Technical Implementation
* **Secure Cookie Storage:** Handled access tokens inside `httpOnly`, `Secure`, `SameSite=Strict` headers, preventing access from client-side JS (neutralizing XSS theft).
* **Redis Verification Store:** Cached active refresh UUID tokens as keys (`refresh:userId:tokenId`) inside Upstash Redis.
* **Controller Guards:** Added custom Express middleware interceptors (`authMiddleware`, `permissionGuard`) validating routes.

---

## 4. Challenges Solved
* **Token Replay Attacks:** Mitigated risk of compromised long-lived refresh tokens by implementing strict token rotation. If an old refresh token is reused, the API immediately deletes all associated sessions for that user from Redis, forcing a re-login.
* **OTP Spamming:** Prevented API server overload and SMS cost inflation by wrapping the OTP verification route with a Redis-backed sliding window rate limiter.

---

## 5. Deliverables
* `/apps/api/src/modules/auth/` — Session handlers and routes.
* `/apps/api/src/middleware/auth.ts` — Authentication verification guards.
* `/apps/api/src/middleware/rateLimiter.ts` — Redis rate limiting wrapper.
