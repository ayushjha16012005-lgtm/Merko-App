# Phase 10: Design Preview Engine

## 1. Goal
Build the client-side Fabric.js canvas customization viewer, debounced input rendering engines, and server-side high-resolution print export pipelines.

---

## 2. Features Completed
* **Fabric.js Canvas viewer:** Live interactive overlays rendering custom coordinates over base product catalog photos.
* **Debounced input sync:** Input handlers syncing client customizations to preview overlays under 200ms.
* **Print PDF Generation:** Headless browser rendering pipelines exporting designs to print-ready PDF/PNG formats.
* **Dynamic Media Transformation:** Real-time formatting, scaling, and quality overrides powered by Cloudinary.

---

## 3. Technical Implementation
* **Debounced Recalculation:** Client forms use a 200ms debounce interval to wait for typing to pause before recalculating canvas overlays.
* **High-Res headless Rendering:** Backend exports spin up a server-side headless browser instance running Puppeteer, which injects customer inputs into a high-DPI canvas to export 300+ DPI print files.

---

## 4. Challenges Solved
* **Sluggish Storefront Canvas Performance:** Solved lagging UI states when typing by debouncing inputs. The canvas now only re-renders 200ms after the customer pauses typing.
* **Low-Resolution Print Artifacts:** Prevented pixelated prints by generating high-resolution PDF print-ready files on the server using headless Chrome, rather than capturing low-DPI screenshots from the client's browser.

---

## 5. Deliverables
* `/apps/customer/src/components/LivePreview.tsx` — Fabric.js viewer.
* `/apps/api/src/services/printExporter.ts` — Server PDF generation helper.
* `packages/ui/src/canvas/` — Layout boundary matrices.
