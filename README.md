# CVSaves

A personal budgeting and expense-tracking web app. Set a monthly income and budget, log expenses against custom categories, and see where your money actually goes.

**Live app:** [cvsaves.vercel.app](https://cvsaves.vercel.app)

Built as a personal project to learn full-stack development with React, TypeScript, and Postgres.

---

<!-- Add 2-3 screenshots here. Put the image files in a /docs folder and reference them:
![Dashboard](docs/dashboard.png)
![Category breakdown](docs/categories.png)
-->

## Features

- **Accounts** — email/password sign-up with verification, password reset, profile editing, account deletion
- **Monthly budgeting** — set income and budget per month, with running totals for spend and remaining budget
- **Expenses** — full CRUD on expenses (amount, description, category, date), scoped to the signed-in user
- **Categories** — custom categories with colours; renaming cascades to historical expenses so past data stays consistent
- **Visualisation** — spending breakdown by category, charted with Recharts and Chart.js
- **Data management** — CSV export by month, clear a month, clear all data, delete account
- **Interface** — responsive layout, light/dark mode persisted per user

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 18, TypeScript, Vite |
| Routing | React Router |
| Styling | Tailwind CSS, Radix UI (shadcn-style components) |
| Forms | React Hook Form, Zod |
| Charts | Recharts, Chart.js / react-chartjs-2 |
| Backend | Supabase (Postgres + Auth) |
| Hosting | Vercel |

---

## Architecture

The app is a single-page React client talking directly to Supabase. There is no custom API server — the browser queries Postgres through the Supabase client, and access control is enforced at the database layer.

```
                    ┌──────────────┐
                    │   Supabase   │
                    │     Auth     │
                    └──────┬───────┘
                           │
                    authenticated?
                      /          \
                    no            yes
                    │              │
                 /login          / (Home)
                                   │
             ┌─────────────────────┼─────────────────────┐
             │                     │                     │
       Monthly Budget          Expenses             Categories
             │                     │                     │
             └─────────────────────┼─────────────────────┘
                                   │
                          src/lib/db.ts (data layer)
                                   │
                          Supabase Postgres
```

`App.tsx` wraps the app in a Supabase session context and guards the `/` route, redirecting unauthenticated users to `/login`. All database reads and writes go through `src/lib/db.ts` rather than being scattered through components.

### Data model

| Table | Columns |
|---|---|
| `expenses` | `id`, `user_id`, `amount`, `description`, `category`, `date` |
| `monthly_meta` | `user_id`, `month`, `income`, `budget` |
| `user_categories` | `id`, `user_id`, `name`, `color` |

### Security model

Because the client talks to Postgres directly using the public anon key, the `user_id` filters in `db.ts` are a convenience, not a security boundary — client-side code can be modified by the user. Access control is enforced by **Row Level Security policies** on every table, matching `auth.uid()` against the row's `user_id`. Without RLS, this architecture would expose all users' data.

### A note on dates

Expense dates are stored as plain `date` values. When reading them into JavaScript, they are parsed with an explicit `T12:00:00` (noon) time component rather than midnight. Parsing at midnight means a UTC-to-local conversion can shift a date backwards by one day for users west of UTC, silently filing an expense under the wrong day. Anchoring at noon leaves 12 hours of headroom in either direction.

---

## Running locally

**Prerequisites:** Node.js 18+, and a Supabase project with the three tables above, Row Level Security enabled on each, and a policy restricting access to `auth.uid() = user_id`.

```bash
git clone https://github.com/21ex/cvsaves.git
cd cvsaves
npm install
```

Create a `.env.local` file in the project root:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Then start the dev server with `npm run dev`.

---

## Known limitations

Being honest about what this project does not currently do well:

- **`home.tsx` is too large.** It has grown into a single component holding most of the app's state, mixing UI, data fetching, and business logic. Splitting it into custom hooks (`useExpenses`, `useMonthlyBudget`, `useCategories`) is the main refactor this codebase needs.
- **No automated tests.** All testing so far has been manual.
- **Categories are referenced by name, not ID, on expense rows.** This is why renaming requires a bulk update across historical expenses. Referencing by foreign key would be the correct design.
- **No pagination.** Expenses are fetched for a whole month at a time, which is fine at personal scale but would not hold up with large datasets.
- **Leftover scaffolding.** Some unused component-story files remain from the original project template.

## Roadmap

- [ ] Refactor `home.tsx` into focused hooks and components
- [ ] Migrate expense categories to foreign-key references
- [ ] Add unit tests for the `db.ts` data layer
- [ ] Recurring expenses
- [ ] Multi-month trend view
