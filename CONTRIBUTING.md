# Contributing

Thanks for your interest in improving `gray-ui-csm`.

## Scope

This repo is maintained as an open-source UI showcase for design engineering work.
Contributions are welcome for:

- Documentation improvements
- Accessibility and UX polish
- Bug fixes in existing workflows
- Small, focused refactors that improve maintainability

For large feature proposals, please open an issue first to discuss scope.

## Development Workflow

1. Fork the repository
2. Create a branch from `main`
3. Install repo git hooks with `pnpm install:git-hooks`
4. Run locally and verify quality checks
5. Open a PR with a clear summary and rationale

## Local Checks

Run these before submitting:

```bash
pnpm check:guardrails
pnpm typecheck
pnpm lint
pnpm build
```

## Git Hooks

This repo includes lightweight git hooks in `.githooks`.

- `pre-commit` runs `pnpm check:guardrails`
- `pre-push` runs `pnpm check:guardrails`, `pnpm lint`, and `pnpm typecheck`

Install them once per local clone:

```bash
pnpm install:git-hooks
```

## Coding Guidelines

- Keep changes focused and minimal
- Preserve existing UI patterns and naming conventions
- Prefer composable components over large inline logic blocks
- Avoid introducing demo data directly inside view components when it can live in `lib/*`
- Follow [PROJECT_RULES.md](./PROJECT_RULES.md) as the source of truth for architecture, hardcoding, and design-system rules

Thanks again for contributing.
