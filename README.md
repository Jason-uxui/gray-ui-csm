<h1 align="center">Gray CSM UI · Next.js + shadcn/ui</h1>

<p align="center">
  An open-source Customer Success workspace UI that demonstrates how design systems,
  complex ticket workflows, and polished interaction patterns can be implemented in maintainable React code.
</p>

<p align="center">
  <a href="#getting-started"><strong>Run locally</strong></a>
  ·
  <a href="#architecture"><strong>Architecture</strong></a>
  ·
  <a href="#design-engineering-focus"><strong>Design Engineering Focus</strong></a>
</p>

---

## Overview

`gray-ui-csm` is a UI-first CSM (Customer Success Management) dashboard built with:

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui primitives + custom composition
- dnd-kit for interactive board behavior

This repository is intentionally built as a **design engineering showcase**:

- Feature-level flows (tickets board/table/detail/drawer)
- Reusable UI primitives and route-driven structure
- Realistic mock content for UX storytelling and state transitions

> Note: This is a front-end demo. Sample data comes from local fixtures, with some edits saved in browser storage.

## Key Screens

- **Tickets Workspace**
  - Board and table layouts
  - Bulk actions, status/priority edits
  - Ticket drawer for quick update

- **Ticket Detail View**
  - Conversation/task/activity/notes tabs
  - Context panel (details/people/knowledge)
  - Reply workflows with macro suggestions
  - Remote Assist and Phone Support from the ticket's **More actions** menu
    (simulated customer consent, session states, recordings and results)

- **Knowledge Base**
  - Rich-text article editing, metadata and version history
  - Save/discard guards and browser-local persistence

- **CSM Navigation Sections**
  - Inbox, Customers, Knowledge Base, Automation, Settings
  - Shared route metadata and consistent page scaffolding

## Design Engineering Focus

This project highlights practical design-engineering decisions:

- **Single source of truth for route metadata** in `lib/csm-routes.ts`
- **Composable app shell** with adaptive sidebar behavior
- **Scalable data-grid primitives** in `components/data-grid`
- **Stateful ticket interactions** implemented without backend coupling
- **Token-driven styling** through CSS variables in `app/globals.css`

## Architecture

- `app/`
  - Route entry points (App Router)
  - Shared root layout and metadata

- `components/`
  - `tickets/`: ticket workflows (board, table, detail, drawer)
  - `data-grid/`: reusable table/grid foundation
  - `ui/`: shadcn-style primitives

- `lib/`
  - `csm-routes.ts`: route metadata, sidebar previews, template metrics
  - `tickets/*`: ticket domain types and mock data
  - `current-user.ts`: demo actor/profile data

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Install

```bash
pnpm install
```

### Develop

```bash
pnpm dev
```

Open `http://localhost:3000`.

### Build and Run

```bash
pnpm build
pnpm start
```

### Quality Checks

```bash
pnpm typecheck
pnpm lint
pnpm check:guardrails
pnpm test:remote-assist
pnpm test:knowledge-storage
```

## Scripts

- `pnpm dev` - Run development server (Turbopack)
- `pnpm build` - Production build
- `pnpm start` - Run production server
- `pnpm typecheck` - TypeScript check
- `pnpm lint` - ESLint checks
- `pnpm format` - Prettier format `ts/tsx`
- `pnpm check:guardrails` - Token and thin-route contracts
- `pnpm test:remote-assist` - Remote Assist and Phone Support behavior
- `pnpm test:knowledge-storage` - Article persistence and migration regressions

## Mock Data and Production Notes

Current ticket and workspace content is mock data for UI demonstration.

Remote Assist and Phone Support use a sample-customer adapter. Invitations do not
send email, calls do not connect to a phone service, and preview recordings are
supplied fixtures. See the [feature handoff](./docs/remote-assist-handoff.md) for
state coverage, Figma references and verified limitations.

Before using this in production:

1. Replace `lib/tickets/mock-data.ts` with API-backed data sources.
2. Replace demo identities in `lib/current-user.ts`.
3. Wire mutations (status/priority/notes/replies) to server actions or API routes.

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a PR.

## License

This repository is licensed under the [MIT License](./LICENSE).
Supplied design/media assets have a separate provenance and rights boundary;
see [Remote Assist assets](./public/remote-assist/README.md).
