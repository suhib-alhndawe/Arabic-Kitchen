# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Full-stack Arabic grill restaurant website with complete admin CMS.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5 + express-session
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild
- **Frontend**: React + Vite, Tailwind CSS, framer-motion, react-hook-form, wouter

## Project: مطعم ومشاوي فصاح لحم (Fasah Lahm Grill Restaurant)

### Customer-Facing
- Home page with fire/grill hero section, WhatsApp button
- Menu page with category filters, search, and item cards
- Categories: كباب، شقف، عرايس، صواني، دجاج، شيش

### Admin CMS (at /admin)
Full SaaS-style sidebar admin panel with:
- **Dashboard** (/admin) — stats (total items, categories, availability, uploads)
- **Menu Management** (/admin/menu) — CRUD for menu items with image upload
- **Categories Management** (/admin/categories) — CRUD for categories
- **Media Manager** (/admin/media) — upload images, browse library, copy URLs
- **Settings** (/admin/settings) — restaurant name, WhatsApp number, logo, address
- Admin credentials: username `admin`, password `fasah2024`

## API Routes

- `GET /api/menu?category=&search=` — list menu items
- `POST /api/menu` — create item (requires auth)
- `PUT /api/menu/:id` — update item (requires auth)
- `DELETE /api/menu/:id` — delete item (requires auth)
- `GET /api/categories` — list categories
- `POST /api/categories` — create category (requires auth)
- `PUT /api/categories/:id` — update category (requires auth)
- `DELETE /api/categories/:id` — delete category (requires auth)
- `POST /api/upload` — upload image file (multipart, field: "file") (requires auth)
- `GET /api/upload/list` — list uploaded files
- `GET /api/files/:filename` — serve uploaded file
- `GET /api/settings` — get restaurant settings
- `PUT /api/settings` — update settings (requires auth)
- `GET /api/dashboard/stats` — dashboard statistics (requires auth)
- `POST /api/auth/login` — login with { username, password }
- `POST /api/auth/logout` — logout
- `GET /api/auth/me` — check auth status

## Database Schema

### `menu_items` — restaurant menu items
### `categories` — menu categories with icon/slug
### `settings` — key-value restaurant settings
