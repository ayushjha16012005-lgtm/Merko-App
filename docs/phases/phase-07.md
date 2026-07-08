# Phase 7: Order Management

## 1. Goal
Build the transactional ordering schemas, order lifecycle transitions, shipping tracking systems, and automated customer refund triggers on cancellation.

---

## 2. Features Completed
* **Atomic Order Creation:** Single-query database transaction writing orders, items, and payments.
* **Fulfillment Pipeline:** Structured transitions: `PENDING` → `PAYMENT_CONFIRMED` → `IN_PRODUCTION` → `QUALITY_CHECK` → `SHIPPED` → `DELIVERED`.
* **Cancellation Safeguards:** API route policies blocking order cancellations once production has started.
* **Logistics Integration:** Admin interface to save courier tracking numbers (e.g., BlueDart tracking links).
* **Automated Cancellation Refunds:** Cancelling an order before production automatically schedules a refund task in the payment queue.

---

## 3. Technical Implementation
* **Transaction Wrapper:** Wrapped checkout database updates in a Prisma `$transaction` query to ensure database state integrity:
  ```typescript
  await prisma.$transaction([
    prisma.order.create({...}),
    prisma.cart.update({...}),
    prisma.productVariant.updateMany({...})
  ]);
  ```
* **Status Enforcement Middleware:** Implemented status checks on the cancellation endpoint, rejecting requests with a `409 Conflict` if the order is already in production.

---

## 4. Challenges Solved
* **Database State Inconsistencies:** Prevented issues where database operations failed after payment but before cart cleanup. Handled this by placing order generation, cart emptying, and coupon count increments inside a single atomic transaction block.
* **Unauthorized Order Access:** Blocked access attempts to order details by verifying that the requesting user ID matches the order record owner, unless the request is made by an authorized administrator.

---

## 5. Deliverables
* `/apps/api/src/modules/orders/` — Order creation and lifecycle tracking.
* `/apps/customer/src/app/orders/[id]/page.tsx` — Customer order tracking details.
* `/apps/api/src/utils/orderNumber.ts` — Human-readable order ID generator.
