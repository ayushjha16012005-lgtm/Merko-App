# Phase 2 Implementation Roadmap — Merko Platform
**Target Start:** Post Phase 1 Sign-Off  
**Estimated Duration:** 8–12 weeks  
**Team Allocation:** 4-6 engineers

---

## Phase 2 Objectives

1. Implement product catalog system with variants and images
2. Build dynamic customization engine foundation
3. Implement admin product management interface
4. Set up shopping cart and order pipeline
5. Establish secure user authentication
6. Implement comprehensive testing and CI/CD

---

## Database Schema Expansion (Pre-Implementation)

### New Tables Required

#### 1. Category
```sql
CREATE TABLE "Category" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "description" TEXT,
  "imageUrl" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "sortOrder" INT DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Product
```sql
CREATE TABLE "Product" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "description" TEXT,
  "basePrice" DECIMAL(10,2) NOT NULL,
  "categoryId" TEXT NOT NULL,
  "imageUrl" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "inventoryCount" INT DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
);
```

#### 3. ProductImage
```sql
CREATE TABLE "ProductImage" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "altText" TEXT,
  "displayOrder" INT DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
);
```

#### 4. ProductVariant
```sql
CREATE TABLE "ProductVariant" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sku" TEXT UNIQUE NOT NULL,
  "priceModifier" DECIMAL(10,2) DEFAULT 0,
  "inventoryCount" INT DEFAULT 0,
  "attributes" JSONB NOT NULL,  -- {"size": "L", "color": "blue"}
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
);
```

#### 5. CustomizationTemplate
```sql
CREATE TABLE "CustomizationTemplate" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "templateJson" JSONB NOT NULL,  -- Canvas config: areas, tools, defaults
  "previewImageUrl" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
);
```

#### 6. Cart
```sql
CREATE TABLE "Cart" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "totalPrice" DECIMAL(10,2) DEFAULT 0,
  "itemCount" INT DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  UNIQUE("userId")
);
```

#### 7. CartItem
```sql
CREATE TABLE "CartItem" (
  "id" TEXT PRIMARY KEY,
  "cartId" TEXT NOT NULL,
  "productVariantId" TEXT NOT NULL,
  "customization" JSONB,  -- Design data, text overlays, etc.
  "quantity" INT DEFAULT 1,
  "unitPrice" DECIMAL(10,2) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE,
  FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id")
);
```

#### 8. Order
```sql
CREATE TABLE "Order" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "orderNumber" TEXT UNIQUE NOT NULL,
  "status" ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'),
  "totalPrice" DECIMAL(10,2) NOT NULL,
  "shippingAddressId" TEXT NOT NULL,
  "billingAddressId" TEXT NOT NULL,
  "estimatedDeliveryDate" DATE,
  "trackingNumber" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id"),
  FOREIGN KEY ("shippingAddressId") REFERENCES "Address"("id"),
  FOREIGN KEY ("billingAddressId") REFERENCES "Address"("id")
);
```

#### 9. OrderItem
```sql
CREATE TABLE "OrderItem" (
  "id" TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "productVariantId" TEXT NOT NULL,
  "customization" JSONB,
  "quantity" INT DEFAULT 1,
  "unitPrice" DECIMAL(10,2) NOT NULL,
  "lineTotal" DECIMAL(10,2) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE,
  FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id")
);
```

#### 10. Coupon
```sql
CREATE TABLE "Coupon" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT UNIQUE NOT NULL,
  "discountType" ENUM('PERCENTAGE', 'FIXED_AMOUNT'),
  "discountValue" DECIMAL(10,2) NOT NULL,
  "maxUses" INT,
  "currentUses" INT DEFAULT 0,
  "minOrderAmount" DECIMAL(10,2),
  "expiryDate" TIMESTAMP,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 11. Review
```sql
CREATE TABLE "Review" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "rating" INT CHECK (rating >= 1 AND rating <= 5),
  "title" TEXT,
  "comment" TEXT,
  "isVerifiedPurchase" BOOLEAN DEFAULT false,
  "helpfulCount" INT DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  UNIQUE("productId", "userId")
);
```

### Schema Changes to Existing Tables

#### User
Add fields for authentication & profile:
```sql
ALTER TABLE "User" ADD COLUMN "verificationToken" TEXT;
ALTER TABLE "User" ADD COLUMN "verificationTokenExpiry" TIMESTAMP;
ALTER TABLE "User" ADD COLUMN "passwordResetToken" TEXT;
ALTER TABLE "User" ADD COLUMN "passwordResetExpiry" TIMESTAMP;
ALTER TABLE "User" ADD COLUMN "phoneVerified" BOOLEAN DEFAULT false;
ALTER TABLE "User" ADD COLUMN "twoFactorEnabled" BOOLEAN DEFAULT false;
ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP;
```

### Migration Order
1. Create all new tables (Category through Review)
2. Add foreign key indexes for performance
3. Add unique constraints and checks
4. Backfill category data (if migrating from v1)
5. Create migration file: `20250616000000_add_catalog_and_orders`

---

## Sprint-by-Sprint Breakdown

### Sprint 1: Database & Authentication (2 weeks)

**Goals:**
- Implement database migrations
- Add user authentication flows
- Set up JWT middleware

**Deliverables:**

#### Backend
1. **Prisma Migration**
   - Create and validate `add_catalog_and_orders` migration
   - Apply migrations to dev/staging/production
   - Test rollback scenarios

2. **Authentication Module** (`apps/api/src/modules/auth`)
   - `auth.controller.ts` → /register, /login, /refresh, /logout
   - `auth.service.ts` → Business logic for auth
   - `auth.repository.ts` → User creation, lookup
   - JWT middleware for route protection
   - Password hashing (bcrypt)
   - Token generation and validation

3. **User Service Enhancements**
   - Update user profile endpoint
   - Email verification flow
   - Password reset flow

#### Frontend
1. **Customer Portal**
   - Login/Register pages
   - Protected route wrapper
   - Token storage and refresh logic
   - User profile page update

2. **Management Portal**
   - Admin login (role-based)
   - Dashboard with user summary

#### Testing
- Unit tests for auth service
- Integration tests for auth endpoints

**Files to Create/Modify:**
```
Backend:
  apps/api/src/modules/auth/
  ├── auth.controller.ts (NEW)
  ├── auth.service.ts (NEW)
  ├── auth.repository.ts (NEW)
  ├── index.ts (NEW)
  └── auth.middleware.ts (NEW)
  
  apps/api/src/middleware/
  ├── auth.ts (NEW - JWT verification)
  
  apps/api/prisma/migrations/
  └── 20250616000000_add_catalog_and_orders/ (NEW)
  
  packages/types/src/
  ├── auth.ts (NEW)
  └── user-role.ts (UPDATE - add permissions)

Frontend (Customer):
  apps/customer/src/app/
  ├── login/ (NEW)
  ├── register/ (NEW)
  └── page.tsx (UPDATE - require auth)
  
  apps/customer/src/lib/
  ├── auth-client.ts (NEW)
  └── api-client.ts (UPDATE - add token handling)

Frontend (Management):
  apps/management/src/app/
  └── login/ (NEW)
  
  apps/management/src/lib/
  ├── auth-client.ts (NEW)
  └── api-client.ts (UPDATE - add token handling)
```

---

### Sprint 2: Product Catalog Foundation (2 weeks)

**Goals:**
- Implement product and category management
- Build category/product APIs
- Create product gallery with images

**Deliverables:**

#### Backend
1. **Category Module** (`apps/api/src/modules/categories`)
   - `categories.controller.ts` → GET /categories, GET /:id, POST, PATCH, DELETE
   - `categories.service.ts` → Business logic
   - `categories.repository.ts` → Database queries

2. **Product Module** (`apps/api/src/modules/products`)
   - `products.controller.ts` → CRUD endpoints
   - `products.service.ts` → Business logic
   - `products.repository.ts` → Database queries
   - Image upload handler (use S3 or local storage)

3. **Product Variant Module** (`apps/api/src/modules/variants`)
   - Variant CRUD API
   - Variant-product relationship handling

#### Frontend
1. **Customer Portal**
   - `/products` page with category filtering
   - Product detail page with image gallery
   - Product variant selector

2. **Management Portal**
   - `/products` management page (CRUD)
   - Category management page (CRUD)
   - Product image uploader
   - Variant management interface

#### Testing
- Tests for category endpoints
- Tests for product CRUD operations
- Tests for image upload

**Files to Create:**
```
Backend:
  apps/api/src/modules/categories/
  ├── categories.controller.ts
  ├── categories.service.ts
  ├── categories.repository.ts
  └── index.ts
  
  apps/api/src/modules/products/
  ├── products.controller.ts
  ├── products.service.ts
  ├── products.repository.ts
  └── index.ts
  
  apps/api/src/modules/variants/
  ├── variants.controller.ts
  ├── variants.service.ts
  ├── variants.repository.ts
  └── index.ts

Frontend (Customer):
  apps/customer/src/app/
  ├── products/
  │   ├── page.tsx (Product listing)
  │   └── [id]/
  │       └── page.tsx (Product detail)
  
  apps/customer/src/components/
  ├── product-card.tsx
  ├── product-gallery.tsx
  ├── variant-selector.tsx
  └── category-filter.tsx

Frontend (Management):
  apps/management/src/app/
  └── products/
      ├── page.tsx (List)
      ├── [id]/ (Detail/Edit)
      └── new/ (Create)
  
  apps/management/src/components/
  ├── product-form.tsx
  ├── image-uploader.tsx
  └── variant-editor.tsx
```

---

### Sprint 3: Customization Engine Foundation (2 weeks)

**Goals:**
- Design customization template system
- Build canvas-based editor foundation
- Implement design persistence

**Deliverables:**

#### Backend
1. **Customization Template Module**
   - `CustomizationTemplate` CRUD APIs
   - Template rendering and validation
   - Design data storage (JSONB)

2. **Customization Service**
   - Template schema definition
   - Design validation logic
   - Preview generation hooks

#### Frontend
1. **Design Editor Component** (React)
   - Canvas library integration (fabric.js or Konva)
   - Text tool with fonts
   - Color picker
   - Image upload and placement
   - Shape tools (rectangles, circles)
   - Layer panel
   - Undo/Redo history
   - Save/Load design state

2. **Customer Portal**
   - `/products/[id]/customize` page
   - Design editor embedded
   - Live preview pane
   - Save design to cart

3. **Design Viewer**
   - Read-only preview of saved designs
   - Design thumbnail generation

#### Testing
- Unit tests for canvas interactions
- Tests for design serialization

**Files to Create:**
```
Backend:
  apps/api/src/modules/customization/
  ├── customization.controller.ts
  ├── customization.service.ts
  ├── customization.repository.ts
  └── index.ts

Frontend (Customer):
  apps/customer/src/components/
  ├── design-editor.tsx (Main canvas component)
  ├── design-toolbar.tsx
  ├── layer-panel.tsx
  ├── property-panel.tsx
  ├── design-preview.tsx
  └── design-history.ts (Undo/Redo state)
  
  apps/customer/src/app/
  └── products/
      └── [id]/
          └── customize/
              └── page.tsx

  apps/customer/src/lib/
  ├── canvas-utils.ts (Canvas helpers)
  ├── design-serializer.ts (Save/Load design)
  └── font-loader.ts (Font management)
```

**Dependencies to Add:**
```json
{
  "fabric": "^5.3.0",
  "zustand": "^4.4.0"  // State management for design editor
}
```

---

### Sprint 4: Cart & Order Management (2 weeks)

**Goals:**
- Implement shopping cart functionality
- Build order creation pipeline
- Set up order tracking

**Deliverables:**

#### Backend
1. **Cart Module** (`apps/api/src/modules/cart`)
   - `cart.controller.ts` → GET, POST, DELETE operations
   - `cart.service.ts` → Add/remove items, calculate totals
   - `cart.repository.ts` → Database operations

2. **Order Module** (`apps/api/src/modules/orders`)
   - `orders.controller.ts` → GET, POST, PATCH endpoints
   - `orders.service.ts` → Order creation from cart, status updates
   - `orders.repository.ts` → Database queries

3. **Coupon Module** (`apps/api/src/modules/coupons`)
   - Coupon validation
   - Discount calculation

#### Frontend
1. **Customer Portal**
   - `/cart` page
   - Cart item management (add, remove, update quantity)
   - Coupon code input
   - Checkout flow (not payment integration yet)
   - `/orders` page (order history)
   - `/orders/[id]` detail page

2. **Management Portal**
   - `/orders` management dashboard
   - Order status update interface
   - Order fulfillment checklist
   - Download print-ready assets from customization

#### Testing
- Tests for cart operations
- Tests for order creation
- Tests for discount calculations

**Files to Create:**
```
Backend:
  apps/api/src/modules/cart/
  ├── cart.controller.ts
  ├── cart.service.ts
  ├── cart.repository.ts
  └── index.ts
  
  apps/api/src/modules/orders/
  ├── orders.controller.ts
  ├── orders.service.ts
  ├── orders.repository.ts
  └── index.ts
  
  apps/api/src/modules/coupons/
  ├── coupons.controller.ts
  ├── coupons.service.ts
  ├── coupons.repository.ts
  └── index.ts

Frontend (Customer):
  apps/customer/src/app/
  ├── cart/
  │   └── page.tsx
  ├── checkout/
  │   └── page.tsx
  └── orders/
      ├── page.tsx
      └── [id]/
          └── page.tsx
  
  apps/customer/src/components/
  ├── cart-item.tsx
  ├── coupon-input.tsx
  ├── order-summary.tsx
  └── address-selector.tsx

Frontend (Management):
  apps/management/src/app/
  ├── orders/
  │   ├── page.tsx (List)
  │   └── [id]/
  │       └── page.tsx (Detail)
  
  apps/management/src/components/
  ├── order-status-updater.tsx
  ├── order-items-table.tsx
  └── fulfillment-checklist.tsx
```

---

### Sprint 5: Admin Product Management (1.5 weeks)

**Goals:**
- Complete admin product CRUD
- Bulk import/export
- Analytics dashboard foundation

**Deliverables:**

#### Backend
1. **Product Import/Export**
   - CSV import for bulk products
   - CSV export for backups
   - Validation before import

2. **Admin Dashboard Endpoints**
   - Sales metrics API
   - Product performance API
   - User stats API

#### Frontend
1. **Management Portal Enhancements**
   - Dashboard with KPIs (total orders, revenue, avg order value)
   - Product performance charts
   - Recent orders widget
   - Inventory alerts

2. **Product Import Tool**
   - CSV uploader
   - Preview before import
   - Conflict resolution UI

**Files to Create:**
```
Backend:
  apps/api/src/modules/admin/
  ├── admin.controller.ts
  ├── admin.service.ts
  ├── dashboard.ts (Metrics)
  └── index.ts
  
  apps/api/src/lib/
  ├── csv-parser.ts
  └── csv-exporter.ts

Frontend (Management):
  apps/management/src/app/
  ├── dashboard/
  │   └── page.tsx (ENHANCE)
  └── settings/
      └── bulk-import/ (NEW)
      
  apps/management/src/components/
  ├── dashboard-cards.tsx
  ├── sales-chart.tsx
  ├── import-uploader.tsx
  └── inventory-alerts.tsx
```

---

### Sprint 6: Reviews & Notifications (1.5 weeks)

**Goals:**
- Implement product reviews
- Set up email notifications
- Build notification center

**Deliverables:**

#### Backend
1. **Review Module**
   - Review creation/deletion
   - Rating aggregation
   - Review moderation flags

2. **Notification Module**
   - Email service integration (SendGrid or similar)
   - In-app notification storage
   - Notification delivery logic

#### Frontend
1. **Customer Portal**
   - Review submission form on product detail
   - Review listing on product pages
   - Notification center page

2. **Email Templates**
   - Order confirmation
   - Order shipped
   - Review request

**Files to Create:**
```
Backend:
  apps/api/src/modules/reviews/
  ├── reviews.controller.ts
  ├── reviews.service.ts
  ├── reviews.repository.ts
  └── index.ts
  
  apps/api/src/modules/notifications/
  ├── notifications.controller.ts
  ├── notifications.service.ts
  ├── notifications.repository.ts
  └── index.ts
  
  apps/api/src/lib/
  ├── email-service.ts
  └── templates/ (Email templates)

Frontend (Customer):
  apps/customer/src/components/
  ├── review-form.tsx
  ├── review-list.tsx
  ├── notification-center.tsx
  └── notification-badge.tsx
```

**Dependencies to Add:**
```json
{
  "@sendgrid/mail": "^8.1.0"
}
```

---

### Sprint 7: Testing & CI/CD (2 weeks)

**Goals:**
- Implement comprehensive test coverage
- Set up GitHub Actions CI/CD
- Add security scanning

**Deliverables:**

#### Testing
1. **Unit Tests**
   - Service layer tests (auth, products, cart, orders)
   - Utility/helper function tests
   - Target: 70% coverage

2. **Integration Tests**
   - API endpoint tests
   - Database transaction tests
   - Auth flow tests

3. **E2E Tests**
   - User registration and login
   - Product browsing and customization
   - Cart and checkout flow (mock payment)
   - Admin product management

#### CI/CD
1. **GitHub Actions Workflow**
   - Lint on PR
   - TypeScript check on PR
   - Build on PR
   - Run tests on PR
   - Build and push images on merge to main

2. **Security Scanning**
   - Snyk for dependency vulnerabilities
   - SAST for code vulnerabilities

#### DevOps
1. **Pre-commit Hooks**
   - Format code with Prettier
   - Run ESLint
   - Run type check

**Files to Create:**
```
.github/workflows/
├── lint-and-test.yml (PR workflow)
├── build-and-deploy.yml (Main workflow)
└── security-scan.yml (Dependency scanning)

Testing:
apps/api/src/modules/
├── auth/
│   └── __tests__/
│       ├── auth.service.test.ts
│       └── auth.controller.test.ts
├── products/
│   └── __tests__/
├── cart/
│   └── __tests__/
└── orders/
    └── __tests__/

e2e/
├── auth.e2e.ts
├── products.e2e.ts
├── cart-checkout.e2e.ts
└── admin-workflow.e2e.ts
```

**Dependencies to Add:**
```json
{
  "jest": "^29.0.0",
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.0.0",
  "supertest": "^6.3.0",
  "jest-mock-extended": "^3.0.0"
}
```

---

## Implementation Priority & Dependencies

### Must-Do-First (Blocking)
1. **Sprint 1 (Auth)** → Required for all subsequent sprints
2. **Sprint 2 (Catalog)** → Foundation for customization
3. **Sprint 3 (Customization)** → Core differentiator

### Can-Parallel-With-Above
- Sprint 4 (Cart/Orders) → Runs alongside Sprint 2/3
- Sprint 5 (Admin) → Runs after Sprint 2

### Final-Phase
- Sprint 6 (Reviews/Notifications) → Can be deferred if needed
- Sprint 7 (Testing/CI/CD) → Should be integrated throughout, not left to end

### Critical Path
```
Sprint 1 (Auth)
    ↓
Sprint 2 (Catalog) ←─┐
    ↓              │
Sprint 3 (Customization)
    ↓              │
Sprint 4 (Cart/Orders)
    ↓
Sprint 5 (Admin)
    ↓
Sprint 6 (Reviews/Notifications)
    ↓
Sprint 7 (Testing/CI/CD)
```

---

## Required Integrations

### External Services (Phase 2)
1. **Payment Processing:** Stripe or Razorpay
2. **Email Service:** SendGrid or AWS SES
3. **File Storage:** AWS S3 or Google Cloud Storage
4. **Image Processing:** ImageMagick or Cloud Vision for thumbnails

### Internal Upgrades Required
1. **Upgrade Next.js Lint to ESLint CLI** (deprecation removal)
2. **Set up API Gateway** (Kong or AWS API Gateway for rate limiting)
3. **Implement Redis Session Store** (for cart persistence)
4. **Set up Message Queue** (Bull/Redis or AWS SQS for async tasks)

---

## Estimated Team Allocation

### Backend (Node/Express/Prisma)
- 2 engineers (full-time across all sprints)

### Frontend (React/Next.js)
- 1.5 engineers (one per portal, shared resources)

### DevOps/Infrastructure
- 1 engineer (part-time, ramping up in Sprint 7)

### QA/Testing
- 0.5 engineer (integrated with development)

**Total:** 5 engineers, ~12 weeks

---

## Risk Mitigation

### Technical Risks
1. **Customization Canvas Complexity**
   - Mitigation: Prototype with fabric.js early, establish design limits
   
2. **Database Performance with Orders**
   - Mitigation: Add proper indexing, test with > 100k orders
   
3. **Image Processing at Scale**
   - Mitigation: Use CDN + async image optimization, not real-time

### Delivery Risks
1. **Scope Creep on Customization**
   - Mitigation: Define MVP canvas features, defer advanced tools
   
2. **Payment Integration Delays**
   - Mitigation: Use test API early, integrate in Sprint 4/5

### Security Risks
1. **User Data in Customizations**
   - Mitigation: Validate and sanitize all design JSON
   
2. **Unencrypted Cart Data**
   - Mitigation: Use HTTPS + secure cookies, validate all mutations

---

## Success Metrics

### Technical
- Build time < 2 minutes
- Lint/test time < 1 minute
- API response time (p99) < 200ms
- Database query time < 100ms

### Product
- Product catalog: 100+ products with variants
- Cart: Add to cart < 1 second
- Customization: Design load < 2 seconds
- Order processing: Checkout < 5 steps

### Quality
- Test coverage: > 70%
- CI/CD success rate: > 95%
- Production error rate: < 0.1%

---

## Next Steps (End of Phase 1)

1. **Finalize Phase 2 timeline** with team leads
2. **Reserve AWS/cloud resources** (RDS, S3, ECS)
3. **Set up payment provider sandbox** (Stripe/Razorpay)
4. **Provision email service** (SendGrid/SES)
5. **Create Jira/Linear epics and tasks** for each sprint
6. **Establish code review standards** and PR workflow
7. **Begin Sprint 1 prep:** Database migration review, auth design review

---

## Appendix: Technology Stack Recommendations

### Core (Already Selected)
- Frontend: React 18 + Next.js 15
- Backend: Node.js 20 + Express + Prisma
- Database: PostgreSQL 16
- Cache: Redis 7
- Containerization: Docker + Compose
- Build: Turborepo + pnpm

### Phase 2 Additions
- Design Canvas: **fabric.js** (or Konva.js)
- State Management: **Zustand** (lightweight)
- Testing: **Jest** + **Supertest**
- E2E Testing: **Playwright** or **Cypress**
- Payment: **Stripe SDK**
- Email: **SendGrid Node SDK**
- Image Optimization: **Sharp**
- Validation: **Zod** (already in use)

### Optional Enhancements
- Monitoring: Sentry, DataDog, or New Relic
- Analytics: Segment, Mixpanel, or PostHog
- CDN: Cloudflare, Fastly, or AWS CloudFront
- Message Queue: Bull (Redis-based) or AWS SQS

---

## Phase 2 Roadmap Sign-Off

✅ **Roadmap Approved**

This Phase 2 roadmap provides a clear, sprint-by-sprint implementation path to transform Merko from an architecture foundation into a fully functional marketplace platform. The sprints are sized for a 5-engineer team with overlapping work to maintain continuous progress.

**Ready to execute on first committed date.**

---
