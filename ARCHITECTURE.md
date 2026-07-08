# Enterprise Architecture Specification

This document details the architectural layers and technical implementation patterns of the MERKO Customizable Product Marketplace.

---

## 🏢 Monorepo Structure

MERKO is organized as a unified monorepo using **pnpm workspaces** and **Turborepo** build caching. This enforces:
* **Strict Type Sharing:** Shared types and schemas in `packages/types/` prevent desynchronization between API payloads and client components.
* **Reusable UI Toolkit:** `packages/ui/` exports the shared Tailwind + Shadcn UI library, ensuring design consistency between the customer store and the admin portal.
* **Global Configurations:** Centralized configurations in `packages/config/` govern ESLint rules, environment checking, and build parameters.

---

## 🔒 Authentication & Role-Based Access Control (RBAC)

```mermaid
sequenceDiagram
    participant Client as User Browser
    participant API as Express API
    participant Redis as Upstash Redis
    participant DB as PostgreSQL

    Client->>API: POST /auth/login { email, password }
    API->>DB: Fetch user record & check hash
    DB-->>API: User details
    API->>API: Generate Access Token (JWT, 15m)
    API->>API: Generate Refresh Token (UUID, 7d)
    API->>Redis: Set Token UUID map (TTL 7d)
    API-->>Client: Set httpOnly Cookies (Access + Refresh)

    Note over Client,API: Subsequent Request to /admin/*
    Client->>API: GET /admin/dashboard (Cookie: Access Token)
    API->>API: Verify signature and role permissions (RBAC)
    alt Role is CUSTOMER
        API-->>Client: 403 Forbidden
    else Role is ADMIN / SUPER_ADMIN
        API-->>Client: 200 OK + Dashboard KPIs
    end
```

---

## ⚙️ Dynamic Customization Engine Flow

The engine maps admin field configurations directly into reactive customer customization panels.

```mermaid
flowchart TD
    subgraph AdminPanel["Admin: Product Setup"]
        A[Define Custom Field Config] --> B[Store as JSONB in product.customization_schema]
    end

    subgraph Storefront["Customer: Customization & Checkout"]
        C[Fetch schema: GET /products/:id/schema] --> D[FieldRenderer builds form dynamically]
        D --> E[Render user text and photo inputs]
        E --> F[Fabric.js updates live preview overlay]
        F --> G[Generate PNG snapshot & Save to Cloudinary]
        G --> H[Serialize design inputs in order_items.customization_data]
    end

    subgraph Operations["Admin: Fulfillment"]
        I[Retrieve Order details] --> J[Download print-ready high-res customization data]
    end

    B --> C
    H --> I
```

---

## 🚀 Payment & Transaction Lifecycle

All order state mutations occur within transactional SQL batches.

```mermaid
stateDiagram-v2
    [*] --> PENDING : Order checkout initiated
    PENDING --> PAYMENT_CONFIRMED : Webhook verification (payment.captured)
    PENDING --> CANCELLED : 30-min payment threshold exceeded (abandoned)
    PAYMENT_CONFIRMED --> IN_PRODUCTION : Admin advances state
    IN_PRODUCTION --> QUALITY_CHECK : Printing completed
    QUALITY_CHECK --> SHIPPED : Dispatch with Courier tracking ID
    SHIPPED --> DELIVERED : Delivery confirmation receipt
    PAYMENT_CONFIRMED --> REFUNDED : Cancel before production (automated)
    DELIVERED --> REFUNDED : Admin-approved return payout
```

For detailed specifications of the backend server and operational runbooks, refer to [Architecture Documentation](docs/architecture.md).
