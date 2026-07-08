# Contributing to MERKO

Thank you for your interest in contributing to the MERKO platform! We welcome contributions from developers, designers, writers, and anyone else who wants to help make professional customized printing accessible to everyone.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any violations to **security@merko.com**.

## Getting Started

1. **Fork the Repository:** Fork the repository on GitHub and clone your fork locally.
2. **Setup Dependencies:** Install the required dependencies using `pnpm`:
   ```bash
   pnpm install
   ```
3. **Environment Setup:** Copy the `.env.example` to `.env` in the respective directories and set your credentials.
4. **Create a Branch:** Create a branch for your changes using a descriptive name and standard prefixes:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

## Development Standards

### Commit Messages
We follow the **Conventional Commits** specification for commit messages:
* `feat:` for new features (e.g., `feat: add Google OAuth login support`)
* `fix:` for bug fixes (e.g., `fix: resolve payment signature validation error`)
* `docs:` for documentation updates
* `style:` for code style changes (formatting, missing semi-colons)
* `refactor:` for code restructuring that doesn't change functionality
* `test:` for adding or modifying tests
* `chore:` for build tools, package manager config, etc.

### Code Quality Gates
Before submitting a pull request, ensure your code passes all lint and build checks:
```bash
# Verify TypeScript compilation
pnpm typecheck

# Verify ESLint rules
pnpm lint

# Format code with Prettier
pnpm format

# Verify full production build
pnpm build
```

## Pull Request Process

1. Submit your pull request using our [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).
2. Ensure your PR is linked to an existing issue.
3. The continuous integration (CI) workflow must pass completely.
4. Obtain a review and approval from at least one core maintainer.
5. Once approved, the branch will be squashed and merged into the main development branch.
