# Phase 5: Cart & Checkout

## 1. Goal
Develop the shopping checkout pipelines, persistent user cart models, localized guest carts, address managers, and coupon validation systems.

---

## 2. Features Completed
* **Persistent Member Carts:** PostgreSQL-stored cart items synchronized across devices.
* **Guest Cart Migration:** localStorage guest carts that merge into user profiles on registration or login.
* **Address Management:** User profiles storing multiple billing and shipping addresses with default selectors.
* **Discount Code Engine:** Live coupon validations checking expiry dates, use boundaries, and minimum cart amounts.
* **Checkout pipeline:** Progressive screens leading customers through cart review, address selections, discount application, and checkout preview.

---

## 3. Technical Implementation
* **Cart Quantities:** Used composite indices restricting duplicate entries on the same variant inside the database:
  ```sql
  CREATE UNIQUE INDEX idx_cart_item_unique ON cart_items(cart_id, variant_id);
  ```
* **Migration logic:** Authenticated login requests trigger a service routine querying the database and merging local storage cart entries, preventing item loss.

---

## 4. Challenges Solved
* **Concurrent Cart Merging:** Resolved item duplicate hazards during guest-to-member cart migration. If a customer added the same item to their guest cart and member cart, the migration engine merges the quantity values and updates the price, rather than throwing duplicate key errors.
* **Vulnerable Cart Price Calculations:** Blocked attempts to manipulate item prices by recalculating all cart totals, variant premiums, and coupon discounts on the server side, rather than trusting values sent from the client.

---

## 5. Deliverables
* `/apps/api/src/modules/cart/` — DB cart service and routes.
* `/apps/api/src/modules/coupons/` — Discount valuation logic.
* `/apps/customer/src/store/useCartStore.ts` — Zustand client cart store.
