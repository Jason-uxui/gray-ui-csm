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
3. Run locally and verify quality checks
4. Open a PR with a clear summary and rationale

## Local Checks

Run these before submitting:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Coding Guidelines

- Keep changes focused and minimal
- Preserve existing UI patterns and naming conventions
- Prefer composable components over large inline logic blocks
- Avoid introducing demo data directly inside view components when it can live in `lib/*`

Thanks again for contributing.
