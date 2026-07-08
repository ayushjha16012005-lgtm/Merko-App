# Phase 9: Notifications

## 1. Goal
Implement a reliable, decoupled background worker system to send email, SMS, WhatsApp, and Push notifications with automatic retry capabilities.

---

## 2. Features Completed
* **Bull MQ Task Engine:** Redis-backed queues separating messaging payloads from the primary API loop.
* **Transactional Emails (SendGrid):** HTML messages sent for order creation, shipping updates, and verification events.
* **Twilio SMS & WhatsApp:** Verified SMS alerts containing OTP codes and order status milestones.
* **Push Notifications (Firebase FCM):** Subscriptions routing instant notifications to client browsers.
* **In-App Feeds:** Feeds managing notifications inside user menus.

---

## 3. Technical Implementation
* **Bull MQ Queuing:** Designed isolated workers processing specific task categories (e.g. `email-queue`, `whatsapp-queue`).
* **Retry configuration:** Job structures enforce a 3-attempt retry loop with exponential back-off configurations:
  ```typescript
  await notificationQueue.add('send-email', payload, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 }
  });
  ```

---

## 4. Challenges Solved
* **External API Failures:** Handled connection drops with SendGrid/Twilio APIs by implementing Bull MQ job queue retries, preventing task losses and routing persistent failures to a dead-letter queue (DLQ) for admin review.
* **API Route Response Blockers:** Moved long-running email generation tasks to background queues, keeping checkout API response times under 300ms.

---

## 5. Deliverables
* `/apps/api/src/modules/notifications/` — Queue handlers.
* `/apps/api/src/workers/` — Decoupled workers processing Redis queues.
* `packages/types/src/notifications.ts` — Common notification schemas.
