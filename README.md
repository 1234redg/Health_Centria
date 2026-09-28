# E-Kalinga

Monorepo (pnpm workspaces):

- `apps/server` — Express + TypeScript REST API, MongoDB Atlas (Mongoose)
- `apps/web` — React + Vite + TanStack Router frontend

## Prerequisites

- Node.js >= 20
- pnpm >= 9 (`corepack enable`)
- A MongoDB Atlas connection string

## Setup

```bash
pnpm install
cp apps/server/.env.example apps/server/.env   # then fill in MONGODB_URI
cp apps/web/.env.example apps/web/.env          # optional, defaults to http://localhost:5000
```

## Develop

```bash
# both
pnpm dev

# individually
pnpm dev:server   # http://localhost:5000
pnpm dev:web      # http://localhost:5173
```

## Build

```bash
pnpm build
```
