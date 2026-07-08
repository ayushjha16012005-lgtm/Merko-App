# Comprehensive Testing Framework

This document outlines the testing strategy, tools, and execution processes for quality assurance of the MERKO platform.

---

## 1. Test Matrix Overview

| Test Layer | Focus Area | Technology / Tools | Goal |
| :--- | :--- | :--- | :--- |
| **Unit** | Isolated functions, DTOs, and helpers. | Jest | ≥ 80% code coverage. |
| **Integration** | Route controllers, middlewares, DB endpoints. | Supertest, Mock Redis | 100% API schema validation. |
| **End-to-End** | Cross-app customer journeys. | Playwright | Verify checkout & authentication paths. |
| **Performance** | API query throughput & latency. | k6 | Latency P95 ≤ 300ms. |
| **Security** | OWASP vulnerabilities & permissions. | OWASP ZAP, Snyk | Zero high/critical CVEs. |

---

## 2. Unit & Integration Testing

We use Jest and Supertest to evaluate packages and api endpoints.

### 2.1 Configuration
The monorepo defines a root-level `jest.config.ts` coordinating test scopes:

```typescript
import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  projects: [
    '<rootDir>/apps/api/jest.config.ts',
    '<rootDir>/packages/*/jest.config.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

export default config;
```

### 2.2 CLI Execution Commands
```bash
# Execute Jest unit tests across workspaces
pnpm test

# Run tests in watch mode during development
pnpm --filter @merko/api test:watch

# Execute API route integration tests
pnpm --filter @merko/api test:integration
```

---

## 3. End-to-End (E2E) Browser & Responsive Testing

We use Playwright to simulate user interactions on real browser engines.

### 3.1 Playwright Configuration
Playwright checks cross-browser compatibility across multiple viewport scales:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* Mobile responsive testing */
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
```

### 3.2 CLI Execution Commands
```bash
# Run E2E tests
pnpm test:e2e

# Run tests in UI mode
pnpm test:e2e --ui
```

---

## 4. Performance & Security Testing

### 4.1 Load Simulation (k6)
We check connection pool stability and caching using k6 load scripts:

```javascript
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Sustained load
    { duration: '2m', target: 0 },   // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'], // 95% of requests must complete under 300ms
  },
};

export default function () {
  const res = http.get('http://api.merko.local/api/v1/products');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
```

### 4.2 Security Audits
* **Dependency Auditing:** Lint pipelines enforce vulnerability checks using `npm audit` or `snyk test`.
* **Dynamic Scans (DAST):** Automated OWASP ZAP container runs scan staging environments weekly to detect XSS or authentication leaks.
* **IDOR Verification:** Scopes must be checked inside all controllers (e.g. validating that a logged-in user can only query their own `Order` or `Address`).
