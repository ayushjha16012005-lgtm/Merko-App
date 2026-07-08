# Phase 6: Payments

## 1. Goal
Integrate Razorpay payment services, handle transactional webhooks securely, and protect inventory balances from race conditions during concurrent checkouts.

---

## 2. Features Completed
* **Razorpay Server SDK Integration:** Server-side order token generation.
* **Webhook Signature Verification:** HMAC-SHA256 signature verification validating Razorpay incoming events.
* **Event Handlers:** Auto-updating order states on payment capture, failure, and refund events.
* **Concurrency Protection:** Database row-level locks preventing double-sell oversells.
* **Refund Pipeline:** Admin-initiated customer refunds routed via background queues.

---

## 3. Technical Implementation
* **Raw Body Buffer Access:** Intercepted webhook requests using a custom Express configuration, saving the raw request buffer to check signatures before the JSON parser alters the content.
* **Row-Level Locking:** Verified inventory availability using `SELECT FOR UPDATE` queries inside Prisma transaction blocks during payment capture:
  ```typescript
  const variant = await tx.$queryRaw`
    SELECT * FROM "ProductVariant" WHERE id = ${variantId} LIMIT 1 FOR UPDATE
  `;
  ```

---

## 4. Challenges Solved
* **Validation of Webhook Signatures:** Resolved signature validation failures caused by standard Express JSON parsers altering request body spacing. Created a custom middleware to capture the raw payload buffer before parsing occurs.
* **Double Processing of Events:** Handled Razorpay webhook retry delivery checks by adding an idempotency lookup step on the `Payment` table, returning a `200 OK` for already-processed events.

---

## 5. Deliverables
* `/apps/api/src/modules/payments/` — Payment controller routes and service layers.
* `/apps/api/src/middleware/rawBody.ts` — Webhook raw buffer interceptor.
* `prisma/migrations/*` — Payment logging transaction records.
