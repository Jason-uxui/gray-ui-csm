# Gray CSM UI

Open-source Customer Success workspace UI built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Current Open-Source Scope

The publish branch (`master`) currently focuses on the **Tickets workspace page**:

- Ticket board and table layouts
- Search, filter, sorting, and bulk update interactions
- Reusable app shell and sidebar navigation patterns

Unreleased flows (for example ticket drawer and full ticket detail) are kept on the `staging` branch and are not part of the public scope yet.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- dnd-kit

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

## Scripts

- `pnpm dev` - Run local development server
- `pnpm build` - Build for production
- `pnpm start` - Run production server
- `pnpm typecheck` - TypeScript check
- `pnpm lint` - ESLint checks

## Branch Strategy

- `master`: public open-source scope (ticket page preview)
- `staging`: internal work-in-progress and unreleased flows

Use selective cherry-pick or scoped PRs when promoting changes from `staging` to `master`.
