# Phase 3: Product Management

## 1. Goal
Design the inventory structures, parent/child taxonomy, variant options, and search indexing required for high-concurrency catalog queries.

---

## 2. Features Completed
* **Catalog Administration:** Product creation, variant pricing, soft-deletion, and category relationships.
* **Database Full-Text Search:** GIN-indexed Postgres search queries over product attributes.
* **Media Uploads:** Cloudinary asset uploading supporting up to 10 product images.
* **Read caching:** Catalog queries stored in Redis (Products: TTL 10m; Categories: TTL 1h).
* **Eviction Policies:** Mutation-driven cache invalidation updating user views when admins update products.

---

## 3. Technical Implementation
* **Variant Attribute schemas:** Product variants represent option arrays (e.g. `{"size": "A4", "color": "white"}`) with price delta modifiers (e.g. `priceDeltaPaise: 5000`).
* **GIN Search Index:** Applied native Postgres GIN indexing over product names and descriptions:
  ```sql
  CREATE INDEX idx_products_fts ON products USING gin(to_tsvector('english', name || ' ' || description));
  ```
* **Transactional Eviction:** Wrapped Admin catalog controllers with post-commit hooks to purge Redis keys on product updates.

---

## 4. Challenges Solved
* **Drift in Variant Prices:** Prevented precision issues common with floating-point values by storing all costs, variants, and cart items in Indian Paise (integers) rather than fractional currencies.
* **Slow Database Search Queries:** Mitigated high database query latency under load by using GIN indexes over raw SQL LIKE queries, reducing lookups to under 300ms.

---

## 5. Deliverables
* `/apps/api/src/modules/products/` — Catalog controller endpoints.
* `/apps/api/src/modules/categories/` — Category trees.
* `prisma/migrations/*` — GIN search indexes and variant constraints.
