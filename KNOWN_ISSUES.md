# Known Issues & Workarounds

This document outlines active development caveats, known edge cases, and workarounds for the MERKO platform.

---

## ⚙️ Development Server Orphans
* **Symptom:** Next.js or Express dev servers fail to start with `Error: listen EADDRINUSE: address already in use :::3000`.
* **Cause:** Webpack HMR or Node processes can remain orphaned in the background when terminating `pnpm dev` forcefully (e.g., via SIGKILL).
* **Workaround:** Purge the orphaned processes:
  ```bash
  kill -9 $(lsof -t -i:3000 -i:3001 -i:4000)
  ```

---

## 🎨 Next.js Shared CSS Package caching
* **Symptom:** Modifications to the `@merko/ui` package styles are not immediately visible in the `customer` or `management` portals.
* **Cause:** Turborepo caching can sometimes skip client re-compilation of Next.js static files if Tailwind configuration files remain untouched.
* **Workaround:** Clear Next.js cache folders and restart the dev server:
  ```bash
  pnpm clean
  pnpm dev
  ```

---

## 💳 Razorpay Sandbox Webhook Delivery Latency
* **Symptom:** Orders remain in `PENDING` state for up to 10 seconds after Razorpay checkout payment completes successfully in test mode.
* **Cause:** Razorpay webhook API queues experience latency in test modes compared to production endpoints.
* **Workaround:** Implement short-polling on the customer checkout page using TanStack Query. If the order status is not updated via webhook, query `/api/v1/orders/:id` every 2 seconds for a maximum of 5 attempts.

---

## 🔔 Twilio WhatsApp Template Sandbox Limits
* **Symptom:** WhatsApp notifications return error code `21610` (Opt-out/Unsubscribed status).
* **Cause:** Twilio Sandbox requires receiving phone numbers to opt-in explicitly by texting `join <sandbox-phrase>` before messages can be delivered.
* **Workaround:** In sandbox/development mode, verify that the recipient number has completed the opt-in registration. In production mode, this restriction does not apply.
