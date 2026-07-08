# System Architecture Specification

This document details the architectural layout, package interactions, security enforcement, and database transaction pipelines of the MERKO Customizable Product Marketplace.

---

## 1. Monorepo Structural Layout

MERKO uses **pnpm workspaces** and **Turborepo** to orchestrate dependencies, task scheduling, and remote compilation caches.

```
merko-monorepo/
├── apps/
│   ├── api/                   ← Express.js REST API
│   ├── customer/              ← Next.js 15 Customer Storefront
│   └── management/            ← Next.js 15 Admin Portal
└── packages/
    ├── config/                ← Workspace-shared configurations
    ├── types/                 ← Shared TypeScript definitions & Zod DTO validations
    └── ui/                    ← Shared React design system component packages
```

Dependencies flow strictly from packages to apps:

```mermaid
graph TD
    api[apps/api] --> config[packages/config]
    api --> types[packages/types]
    
    customer[apps/customer] --> config
    customer --> types
    customer --> ui[packages/ui]
    
    management[apps/management] --> config
    management --> types
    management --> ui
```

---

## 2. Technical Stack Topology

The system uses a tiered application model to separate the presentation layer, edge proxying, business routing, and datastore engines.

```mermaid
flowchart TB
    subgraph ClientTier["Client Tier"]
        direction LR
        customer_client["Next.js 15\nCustomer Portal"]
        management_client["Next.js 15\nManagement Portal"]
    end

    subgraph EdgeTier["Edge & Proxy Tier"]
        cloudflare["Cloudflare CDN\nDNS · SSL/TLS · WAF"]
        vercel_edge["Vercel Edge Network\nStatic assets + SSR Server Cache"]
    end

    subgraph BackendTier["API Tier — Railway"]
        api_gateway["Express.js API Gateway"]
        subgraph Services["Domain Modules"]
            auth_module["Auth Module"]
            catalog_module["Catalog Module"]
            custom_module["Customization Module"]
            checkout_module["Checkout Module"]
        end
        jobs_worker["Bull MQ Worker\nBackground Tasks"]
    end

    subgraph DataTier["Data Tier"]
        db_primary[("PostgreSQL\nPrimary DB (Writes)")]
        db_replica[("PostgreSQL\nRead Replica")]
        redis_cache[("Redis\nSession Cache & Queues")]
    end

    customer_client & management_client --> cloudflare
    cloudflare --> vercel_edge
    vercel_edge --> api_gateway
    api_gateway --> auth_module & catalog_module & custom_module & checkout_module
    auth_module & catalog_module & custom_module & checkout_module --> db_primary
    catalog_module --> db_replica
    auth_module & checkout_module --> redis_cache
    jobs_worker --> redis_cache
    jobs_worker --> db_primary
```

---

## 3. Core Information & Security Flows

### 3.1 Authentication Sequence
The API secures sessions using short-lived access tokens and long-lived refresh tokens stored inside httpOnly cookies:

```mermaid
sequenceDiagram
    participant Client as Client Browser
    participant API as Express API Server
    participant Redis as Upstash Redis Cache
    participant DB as PostgreSQL DB

    Client->>API: POST /auth/login { email, password }
    API->>DB: Query User account details
    DB-->>API: User details + Password Hash
    API->>API: bcrypt.compare(password, hash)
    
    API->>API: Generate Access Token (JWT, HS256, 15m)
    API->>API: Generate Refresh Token (UUID)
    API->>Redis: SETEX refresh:userId:tokenId 604800 (hashed)
    API-->>Client: Set httpOnly, Secure, SameSite=Strict cookies
```

### 3.2 Role-Based Access Control (RBAC) Flow
Access permissions are verified in the Express routing pipeline using a custom role check middleware:

```mermaid
flowchart TD
    A[Incoming Request] --> B{JWT token valid?}
    B -- No --> C[Return 401 Unauthorized]
    B -- Yes --> D[Extract Role: CUSTOMER | ADMIN | SUPER_ADMIN]
    D --> E{Route requirement}
    E -- Scoped to Admin --> F{Is ADMIN or SUPER_ADMIN?}
    F -- No --> G[Return 403 Forbidden]
    F -- Yes --> H[Proceed to Domain Controller]
    E -- Scoped to Super Admin --> I{Is SUPER_ADMIN?}
    I -- No --> G
    I -- Yes --> H
    E -- General access --> H
```

---

## 4. Product Catalog & Customization Flow

The customization engine dynamically loads fields defined by admins and updates live canvas overlays before serializing input data at checkout.

```mermaid
flowchart TD
    subgraph AdminCatalog["Admin catalog Setup"]
        A[Create Product] --> B[Configure Customization Fields JSONB]
        B --> C[Set Canvas Positions, Fonts & Colors]
        C --> D[Save to product.customization_schema]
    end

    subgraph StorefrontCatalog["Customer catalog View"]
        E[Open product detail page] --> F[Load customization schema API]
        F --> G[FieldRenderer renders inputs dynamically]
        G --> H[Customer inputs text / uploads image]
        H --> I[Cloudinary handles media transformations]
        I --> J[Fabric.js updates overlay canvas preview]
        J --> K[Zustand caches customization snapshot]
    end

    D --> F
```

---

## 5. Order & Transaction Lifecycle

Orders process through a series of transactional states, securing payment via HMAC signatures before generating print files.

```mermaid
sequenceDiagram
    participant Client as Customer Storefront
    participant API as Express API
    participant Razorpay as Razorpay API
    participant DB as PostgreSQL Database
    participant Worker as Bull MQ background Worker

    Client->>API: POST /api/v1/orders (with customization inputs)
    API->>DB: Start Transaction: Check stock, Create Order (status: PENDING)
    API->>Razorpay: Generate payment order ID
    Razorpay-->>API: Razorpay Order ID
    API-->>Client: Return payment parameters
    Client->>Razorpay: Trigger checkout payment overlay
    Razorpay-->>API: POST webhook (payment.captured) + HMAC-SHA256
    API->>API: Validate signature using webhook secret
    API->>DB: Start Transaction: Update Order (status: PAYMENT_CONFIRMED), lock and decrement inventory
    API->>Worker: Enqueue SendGrid confirmation email job
    API-->>Razorpay: 200 OK
    Worker->>Worker: Parse print templates, send customer email
```
