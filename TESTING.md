# Testing Strategy & Configuration

The MERKO platform uses a multi-layered testing workflow to guarantee application stability and prevent regressions across the workspaces.

---

## 🔬 Testing Architecture

* **Unit Testing (Jest):** Focuses on testing core domain services, repositories, utility functions, and Zod input validators in isolation.
* **Integration Testing (Supertest):** Runs against a sandboxed test database instance (initialized via Docker Compose) to verify REST API route endpoints, database mutations, and middleware boundaries.
* **End-to-End Testing (Playwright):** Orchestrates complete customer flows (registration, adding variant products, configuring designs, checkout redirects) on headless browsers.
* **Load & Performance Testing (k6):** Models traffic spikes (up to 500 virtual users) checking concurrency safety and database connection pool behavior.

---

## 🛠️ CLI Reference

### Run Unit Tests
```bash
# Run unit tests across all monorepo scopes
pnpm test

# Run tests with coverage reporting
pnpm test --coverage

# Run tests inside a single package (e.g. apps/api)
pnpm --filter @merko/api test
```

### Run Integration Tests
Before running integration tests, spin up the test database:
```bash
# Start integration PostgreSQL test database
docker compose -f docker-compose.test.yml up -d

# Run integrations
pnpm test:integration
```

### Run E2E Playwright Tests
```bash
# Install Playwright browser engines
npx playwright install

# Run E2E suites
pnpm test:e2e
```

---

## 🛡️ Target Quality Gates

* **Code Coverage:** Minimum **80% statement coverage** required on all new modules before merging.
* **Lighthouse Performance:** LCP must remain **under 2.5s** on all pre-rendered product detail pages.
* **Security Scans:** `npm audit` and `snyk test` must return **zero high or critical vulnerabilities** on dependencies.
* **Concurrent Capacity:** The API Gateway must process **95% of queries under 300ms** during load simulations.

For more details on the testing infrastructure configurations, check out [Testing Documentation](docs/testing.md).
