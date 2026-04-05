# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bloomme is a subscription-based flower delivery service. The repo is a monorepo with three services:

- **`frontend/`** — Next.js 15 (React 19, TypeScript, Tailwind CSS, Framer Motion)
- **`backend/`** — Express 5 (TypeScript, PostgreSQL, JWT auth, Razorpay, AWS SES)
- **`admin-portal/`** — Separate Express 4 service for admin operations (port 9000)

Production domain: `bloomme.co.in`. Nginx proxies `/` → frontend, `/api/` → backend, `admin.bloomme.co.in` → admin portal.

---

## Development Commands

### Frontend
```bash
cd frontend
npm run dev      # Start dev server (Next.js)
npm run build    # Production build
npm run lint     # ESLint
```

### Backend
```bash
cd backend
npm run dev      # Start with nodemon + tsx (hot reload)
npm run build    # Compile TypeScript → dist/
npm run start    # Run compiled dist/index.js
npm run init-db  # Initialize/migrate database tables
npm run test     # Run Jest tests
```

### Admin Portal
```bash
cd admin-portal
npm run dev      # Start with tsx watch
npm run build    # Compile TypeScript → dist/
```

### Docker (full stack)
```bash
docker-compose up --build   # All services: frontend, backend, admin, postgres, nginx
```

Port mapping in Docker: Frontend → 5001, Backend → 5002, Admin → 5003, PostgreSQL → 5433.

---

## Architecture

### Frontend (`frontend/`)
- **App Router** (`app/`) — Each route is a folder with `page.tsx`. Major routes: `/`, `/about`, `/contact`, `/faq`, `/plans`, `/signup`, `/login`, `/dashboard`, `/admin`, `/privacy`, `/terms`
- **Components** (`components/`) — Shared UI and section components. Ambient effects in `components/ambient/`.
- **Sections** (`sections/` or within `components/`) — Hero, ProductShowcase, HowItWorks, Features, Pricing, Footer
- **Styling** — Tailwind CSS + `styles/globals.css`. Material Design 3 color tokens. No CSS Modules.
- **Path alias** — `@/*` maps to the frontend root.
- **`layout-client.tsx`** — Client-side root layout wrapper (includes FloatingFlowers ambient component).
- Build errors and TS errors are suppressed in `next.config.ts` (`ignoreDuringBuilds: true`) — don't rely on build-time type checking.

### Backend (`backend/src/`)
- **Entry point** — `index.ts` registers all routes and starts Express on port 5000.
- **Routes** — Each domain has its own file in `routes/`:
  - `auth.ts`, `user.ts`, `subs.ts`, `dashboard.ts`, `payments.ts`, `orders.ts`
  - `addons.ts`, `referrals.ts`, `promo.ts`, `calendar.ts`
  - `newsletter.ts`, `config.ts`, `admin.ts`, `upload.ts`
- **Database** — `db.ts` exports a `pg` Pool. SSL enabled in production. Run `init-db.ts` to create/migrate all tables.
- **Auth** — JWT tokens. Users use short-lived tokens; admin uses 24h tokens.
- **Payments** — Razorpay integration in `routes/payments.ts`.
- **Email** — AWS SES (via `@aws-sdk/client-ses`) for newsletters; Resend for transactional email.
- **File uploads** — Multer; served statically from `/uploads`.

### Admin Portal (`admin-portal/src/`)
- Runs on port 9000. Acts as a proxy to the backend with added JWT auth layer.
- Admin credentials are hardcoded in `index.ts` (not database-driven).
- Exposes endpoints for managing users, subscriptions, orders, and page content.

### Database Tables
`users`, `addresses`, `subscriptions`, `add_ons`, `subscription_add_ons`, `deliveries`, `newsletter_subscribers`, `plans`, `app_config`, `categories`, `subcategories`, `promo_codes`, `orders`, `payments`, `referrals`, `page_content`

`page_content` table schema: `(page_name, section_name, title, subtitle, description, image_url, cta)` — used by the Content Manager in the admin panel.

---

## Environment Variables

### Backend (`.env`)
```
PORT=5000
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=...
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url
AWS_REGION=ap-south-1
SES_SENDER_EMAIL=noreply@yourdomain.com
```

Resend and Razorpay keys are also expected but not in `.env.example` — check `routes/` for variable names used.

### Frontend
Next.js env vars prefixed with `NEXT_PUBLIC_` for client-side. Backend URL is typically set as `NEXT_PUBLIC_API_URL`.

---

## Key Conventions

- **TypeScript strict mode** is on in both frontend and backend, but build-time errors are suppressed in the frontend `next.config.ts`.
- **No test files** exist yet in the frontend; backend has Jest configured with `ts-jest`.
- **Demo account** for the `/dashboard` route: `demo@bloomme.com` / `Demo@123`.
- **Admin login** for `/admin` panel goes through `admin-portal` service — not the main backend auth.
- The `checkout-redesign` branch contains the most recent dashboard work; `main` is the production branch.

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
