# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, Tailwind CSS, framer-motion, react-hook-form

## Project: مطعم ومشاوي فصاح لحم (Fasah Lahm Grill Restaurant)

Full-stack Arabic RTL restaurant website with:
- Home page with hero section and fire/grill theme
- Menu page with category filters (كباب، شقف، عرايس، صواني، دجاج، شيش), search, and item cards
- Admin CMS dashboard (protected by session auth) at `/admin`
- WhatsApp floating order button
- Admin credentials: username `admin`, password `fasah2024` (set via ADMIN_USERNAME / ADMIN_PASSWORD env vars)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── restaurant/         # React + Vite frontend (RTL Arabic restaurant site)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## API Routes

- `GET /api/menu` — list all menu items (supports `?category=` and `?search=`)
- `POST /api/menu` — create item (requires auth)
- `PUT /api/menu/:id` — update item (requires auth)
- `DELETE /api/menu/:id` — delete item (requires auth)
- `POST /api/auth/login` — `{ username, password }` → session
- `POST /api/auth/logout` — destroy session
- `GET /api/auth/me` → `{ authenticated, username? }`

## Database Schema

### `menu_items` table
- `id` (serial PK)
- `name` (text) — English name
- `name_ar` (text) — Arabic name
- `category` (text) — one of: كباب، شقف، عرايس، صواني، دجاج، شيش
- `price` (real) — price in SAR
- `description` (text) — English description
- `description_ar` (text) — Arabic description
- `image_url` (text)
- `available` (boolean, default true)
- `created_at` (timestamp)

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
