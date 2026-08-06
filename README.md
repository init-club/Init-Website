# Init Club Web Application

## Overview

The Init Club Web Application is a full-stack platform built for **Init Club**, a student developer community. The system provides an interactive public hub for community engagement, member profiles, open-source project showcases, technical blogs, and dynamic form submissions, backed by a role-based administrative management system.

The architecture combines a React 19 frontend with Vite, Tailwind CSS, and Framer Motion, paired with a Supabase PostgreSQL database managed via Drizzle ORM, row-level security (RLS) policies, database stored procedures (RPCs), and Deno-based Supabase Edge Functions for automated GitHub integration.

---

## Key Capabilities

- **GitHub-Authenticated Member Hub**: OAuth authentication linked to GitHub organization membership verification via Just-In-Time (JIT) sync.
- **Automated Open-Source & Contribution Tracker**: Edge function that continuously synchronizes organization repositories, pull requests, and weekly commit statistics to compute an all-time member leaderboard.
- **Normalized Dynamic Form Builder & Submissions Engine**: Drag-and-drop form authoring interface supporting 11 field types, validation rules, optimistic concurrency revision controls, scheduled opening/closing windows, analytical response charts, and CSV data exports.
- **Content & Blog Management System**: Community blog proposal engine with an administrative review, approval, publishing, and tag management workflow.
- **Project Discovery & Archive (Graveyard)**: Curated index of active repositories categorized by difficulty and project status, alongside an archival section for sunsetted projects.
- **Administrative Control Suite**: Dashboard for managing members, manual leaderboard score adjustments, member whitelisting, event attendance roll-call tracking, site settings, and audit logging.

---

## Documentation Index

For exhaustive technical specifications and sub-system details, refer to the documents in the [`docs/`](docs/) directory:

- [Database & Backend Schema Documentation](docs/DATABASE_AND_BACKEND.md): Complete Drizzle ORM schema, PostgreSQL entity definitions, migration history, RLS security policies, and SWR cache invalidation keys.
- [Edge Functions & GitHub Sync Engine Documentation](docs/EDGE_FUNCTIONS_AND_GITHUB_SYNC.md): Deno runtime Edge Functions, GitHub REST API integration, membership lookup JIT setup, contributor commit/PR aggregation, and scoring formulas.
- [Dynamic Form Engine Architecture Documentation](docs/FORM_ENGINE_ARCHITECTURE.md): Relational form normalization, optimistic concurrency control (`revision`), stored procedure RPCs, non-blocking autosave lock queue, and validation engine.
- [Frontend Architecture & Admin Control Suite Documentation](docs/FRONTEND_AND_ADMIN_SUITE.md): React Router structure, `AuthContext` & onboarding gates, public views, and complete administrative dashboard control suite.
- [Design System & UI Components Documentation](docs/DESIGN_SYSTEM_AND_COMPONENTS.md): Obsidian dark mode color tokens, typography scales, Framer Motion spring physics, Lenis smooth scrolling, and shared component primitives.

---

## Technical Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Language**: TypeScript 5.9
- **Package Manager**: Bun 1.x
- **Routing**: React Router DOM 7
- **Styling**: Tailwind CSS 3.4
- **Primitives**: Radix UI (Select, Checkbox, Radio Group, Dialog, Tooltip)
- **Animation**: Framer Motion 12
- **Smooth Scroll**: Lenis 1.3
- **Data Fetching & Caching**: SWR 2.3
- **Icons**: Lucide React

### Backend & Infrastructure
- **Database**: PostgreSQL (Supabase)
- **ORM / Schema**: Drizzle ORM 0.40
- **Serverless Edge Functions**: Supabase Edge Functions (Deno runtime)
- **Authentication**: Supabase Auth (GitHub OAuth provider)
- **Database Logic**: PL/pgSQL Stored Procedures (RPCs) and Row-Level Security (RLS)

---

## Repository Structure

```
Init-Website/
├── docs/                       In-depth architecture & sub-system documentation
│   ├── DATABASE_AND_BACKEND.md
│   ├── DESIGN_SYSTEM_AND_COMPONENTS.md
│   ├── EDGE_FUNCTIONS_AND_GITHUB_SYNC.md
│   ├── FORM_ENGINE_ARCHITECTURE.md
│   └── FRONTEND_AND_ADMIN_SUITE.md
├── public/                     Static public assets and document files
├── src/
│   ├── assets/                 Brand identity images and graphics
│   ├── components/             UI component library
│   │   ├── About/              About page specific presentation components
│   │   ├── admin/              Admin dashboard widgets and management panels
│   │   ├── blogs/              Blog cards, author guidelines, and write modals
│   │   ├── forms/              Form subsystem
│   │   │   ├── builder/        Form canvas, field editor, palette, settings/preview modals
│   │   │   └── renderer/       Public form renderer, progress indicator, custom controls
│   │   ├── homepage/           Landing page hero, git graph visualizer, value cards
│   │   ├── layout/             Navbar, Footer, SmoothScroll provider, FixedGrid backdrop
│   │   ├── projects/           Project cards, graveyard cards, search and filter bars
│   │   ├── shared/             Modal dialogs (Confirm, AccessDenied, PdfModal, etc.)
│   │   └── ui/                 Radix UI primitive abstractions styled with Tailwind
│   ├── context/                AuthContext for session and RBAC management
│   ├── data/                   Static site configuration and navigation graphs
│   ├── db/                     Drizzle ORM schema definition (schema.ts)
│   ├── lib/                    Utility helpers (cn class merging utility)
│   ├── pages/                  Application page views
│   │   └── admin/              Admin route pages (Forms, Members, Projects, Blogs, etc.)
│   ├── styles/                 Global CSS definitions and CSS variable design tokens
│   ├── types/                  TypeScript interfaces (Forms, Database, Auth)
│   ├── utils/                  Audit logger, SWR fetchers, SWR keys, Form definition helpers
│   ├── App.tsx                 Main application router and initialization gate
│   ├── main.tsx                Application entry point
│   └── supabaseClient.ts       Supabase client instantiation
├── supabase/
│   ├── functions/              Supabase Deno Edge Functions
│   │   ├── github-lookup-user/ Organization membership verification & JIT setup
│   │   └── github-sync/        Automated organization sync for repos, PRs, and commits
│   └── migrations/             SQL migrations, RLS policies, and RPC definitions
├── eslint.config.js            ESLint configuration
├── package.json                Project dependencies and script definitions
├── postcss.config.js           PostCSS configuration
├── tailwind.config.js          Tailwind theme extension and token mapping
├── tsconfig.json               TypeScript root configuration
└── vite.config.ts              Vite bundler configuration and manual chunk splitting
```

---

## Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                                 React 19 Frontend                                 |
|                                                                                   |
|  +-------------------+   +--------------------+   +----------------------------+  |
|  |   Public Pages    |   |   Form Builder     |   |      Admin Dashboards      |  |
|  |  (Home, Projects, |   | (BuilderCanvas,    |   |  (Members, Blogs, Projects,|  |
|  |   Blogs, Forms)   |   |  FieldEditor, etc) |   |   Attendance, Analytics)   |  |
|  +---------+---------+   +---------+----------+   +--------------+-------------+  |
|            |                       |                             |                |
|            +-----------------------+-----------------------------+                |
|                                    |                                              |
|                    SWR Client Cache & Fetching Layer                              |
|                                    |                                              |
+------------------------------------+----------------------------------------------+
                                     |
                                     v
+-----------------------------------------------------------------------------------+
|                              Supabase Backend                                     |
|                                                                                   |
|  +------------------------+   +-----------------------+   +--------------------+  |
|  |    Supabase Auth       |   |  PostgreSQL Database  |   |   Edge Functions   |  |
|  |  (GitHub OAuth Provider|   |  (Drizzle Schema, RLS,|   | (github-lookup-user|  |
|  |   & Session Tokens)    |   |   PL/pgSQL RPCs)      |   |   github-sync)     |  |
|  +------------------------+   +-----------------------+   +---------+----------+  |
|                                                                     |             |
+---------------------------------------------------------------------|-------------+
                                                                      |
                                                                      v
                                                            +-------------------+
                                                            |  GitHub REST API  |
                                                            |  (init-club org)  |
                                                            +-------------------+
```

---

## Database Schema & Architecture

The database structure is declared using Drizzle ORM in `src/db/schema.ts` and deployed to PostgreSQL via Supabase migrations in `supabase/migrations/`.

### Core Entities

#### 1. `users`
Represents registered community members.
- `id`: `uuid` (Primary Key, default random)
- `auth_user_id`: `uuid` (Foreign Key referencing Supabase Auth `auth.users.id`)
- `github_id`: `bigint` (Unique, external GitHub identifier)
- `username`: `text` (GitHub handle)
- `name`: `text` (Display name)
- `role`: `text` (Role indicator: `'member'` or `'admin'`)
- `is_core_member`: `boolean`
- `is_active`: `boolean`
- `profile_completed`: `boolean` (Flag controlling access past the profile setup onboarding gate)
- `roll_no`, `bio`, `avatar_url`, `linkedin_url`, `instagram_url`, `github_url`, `custom_title`

#### 2. `repositories`
Synchronized GitHub repositories belonging to the organization.
- `id`: `bigint` (Primary Key, GitHub repository ID)
- `github_repo_id`: `bigint` (Unique)
- `name`, `description`, `html_url`, `homepage`, `video_url`
- `stars`, `forks`, `pushed_at`, `last_synced_at`
- `is_archived`, `is_featured`, `is_revivable`, `archival_reason`
- `difficulty`: `text` (`'beginner'`, `'intermediate'`, `'advanced'`)
- `project_status`: `text` (`'active'`, `'in_progress'`, `'completed'`, `'maintenance'`)
- `topics`: `jsonb`

#### 3. `pull_requests`
Tracked pull requests across organization repositories.
- `id`: `uuid` (Primary Key)
- `github_pr_id`: `bigint` (Unique)
- `repo_id`: Foreign Key referencing `repositories.id` (ON DELETE CASCADE)
- `author_id`: Foreign Key referencing `users.id` (ON DELETE CASCADE)
- `title`, `state`, `merged_at`, `created_at`

#### 4. `contribution_stats`
Aggregated monthly metrics for computing the community leaderboard.
- Composite Primary Key: (`user_id`, `month`, `year`)
- `user_id`: Foreign Key referencing `users.id` (ON DELETE CASCADE)
- `commit_count`: `integer`
- `pr_count`: `integer`
- `score`: `integer` (Calculated score: `Commits + (Merged PRs * 10)`)
- `score_adjustment`: `integer` (Manual administrative points modifier)
- `adjustment_reason`: `text`

#### 5. `blogs`
Community technical articles and proposals.
- `id`: `uuid` (Primary Key)
- `slug`: `text` (Unique)
- `title`, `content`, `cover_image_url`, `tags` (`text[]`), `author_name`
- `author_id`: Foreign Key referencing `users.id` (ON DELETE SET NULL)
- `status`: PostgreSQL Enum `blog_status` (`'pending'`, `'published'`, `'rejected'`)
- `is_published`: `boolean`

#### 6. `attendance_sessions` & `attendance_records`
Event attendance tracking system.
- `attendance_sessions`: PK `id`, `name`, `session_date`, `created_by`
- `attendance_records`: Composite PK (`session_id`, `user_id`), `status` (`'present'`, `'late'`, `'absent'`)

#### 7. `audit_logs`
Compliance audit trails for administrative actions.
- `id`: `uuid` (Primary Key)
- `performed_by_id`: Foreign Key referencing `users.id`
- `action_type`: `text` (e.g., `'CREATE_FORM'`, `'UPDATE_FORM'`, `'UPDATE_ROLE'`)
- `table_name`: `text`
- `target_id`: `text`
- `old_value`, `new_value`: `jsonb`

#### 8. `forms`, `form_items`, `form_item_options`, `form_responses`
Normalized relational schema for the dynamic form engine.
- `forms`: PK `id` (`uuid`), `slug` (Unique), `title`, `description`, `status` (`'draft'`, `'published'`, `'closed'`), `settings` (`jsonb`), `revision` (`integer`, default 1)
- `form_items`: Composite PK (`form_id`, `item_id`), `kind` (`'text'`, `'email'`, `'number'`, `'textarea'`, `'select'`, `'radio'`, `'multiselect'`, `'checkbox'`, `'date'`, `'rating'`, `'section'`), `title`, `description`, `required`, `position`, `config` (`jsonb`)
- `form_item_options`: Composite PK (`form_id`, `item_id`, `option_id`), `label`, `position`
- `form_responses`: PK `id`, `form_id` referencing `forms.id` (ON DELETE CASCADE), `answers` (`jsonb`), `respondent` (`jsonb`), `metadata` (`jsonb`), `submitted_at`

---

## Edge Functions & Synchronization

The platform utilizes two Deno-based Supabase Edge Functions residing in `supabase/functions/`:

### 1. User Onboarding Lookup (`github-lookup-user`)
- Triggered during login when an authenticated user does not have a matching profile row in the internal `users` table.
- Queries the GitHub REST API (`/orgs/init-club/memberships/{username}`) using a GitHub Personal Access Token (`github_pat`).
- Rejects non-members with an HTTP 403 response.
- Creates a user record in the `users` table upon successful membership verification using the Supabase Service Role Key.

### 2. GitHub Sync Engine (`github-sync`)
- Executed periodically via background cron triggers or triggered manually via the admin dashboard.
- Iterates over all repositories in the `init-club` organization to update star counts, fork counts, topics, and pushed timestamps.
- Fetches organization pull requests and links merged pull requests to registered users.
- Fetches author commit activity from GitHub, converts weekly activity buckets into calendar month buckets (`month`, `year`), and updates the `contribution_stats` table.
- Calculates score metrics using the formula:
  ```
  Score = (Commit Count * 1) + (Merged Pull Request Count * 10) + Score Adjustment
  ```

---

## Security Model & Access Control

### Database Security (RLS)
PostgreSQL Row-Level Security is active across tables and governed by a helper function `public.is_admin()` which evaluates whether the executing session belongs to an administrative user.

- **Forms Security**: Public users can read published form definitions and submit responses. Form editing, response reading, and structure modifications require `public.is_admin()`.
- **Blog Security**: Public users can read published blogs. Members can submit pending blog proposals. Blog approval and rejection are restricted to administrators.
- **Audit Security**: Admin actions call `logAuditAction()` in `src/utils/auditLogger.ts`, capturing change state directly into `audit_logs`.

### Frontend Navigation Guarding
- **`AuthContext`**: Manages session subscriptions via `supabase.auth.onAuthStateChange`. Provides user role resolution (`isAdmin`) and profile data to the component tree.
- **Onboarding Gate**: Users with `profile_completed === false` are automatically redirected to `/profile-setup` and prevented from navigating to public or administrative pages until initial profile setup is completed.
- **`AdminGuard`**: Higher-Order Component wrapping all `/admin/*` routes. Non-administrative users attempting to access these routes are redirected to `/`.

---

## Form Engine Architecture

The platform features a form engine split into a normalized backend structure and a modular React frontend builder/renderer suite.

### Stored Procedures (RPCs)
- **`save_form_definition`**: Handles atomic creation and updating of forms. Receives form metadata, settings, and a serialized array of items. Uses optimistic concurrency control (`p_expected_revision` vs `forms.revision`) to prevent race conditions. Deletes existing `form_items` for the form ID and performs bulk inserts into `form_items` and `form_item_options`. Increments `revision`.
- **`get_form_definition`**: Performs SQL subquery JSON aggregations to reconstruct full form field trees for administrative editing.
- **`get_public_form_definition`**: Reconstructs form definitions for public respondents, enforcing `forms.status = 'published'`.

### Autosave System (`FormBuilder.tsx`)
- Debounces edit operations by 1200 ms before dispatching silent save requests.
- Utilizes `saveInFlightRef` to prevent concurrent overlapping RPC calls.
- Employs `dirtyDuringSaveRef` to capture modifications made while a save operation is in flight, triggering a follow-up save upon completion.
- Uses `AbortController` with a 25-second timeout (`SAVE_TIMEOUT_MS`) to handle network latency or large payload processing gracefully.
- Provides visual state indicators in the top panel (`Saving...`, `Saved`, `Save failed — Retry`).

---

## Design System & Theme

The user interface follows an **Obsidian Dark Mode** design system.

- **Color Palette**: Obsidian slate background (`#09090b`), cyan accents (`#00ffd5`), purple highlights (`#a855f7`), and Zinc structural borders (`#18181b`).
- **Typography**:
  - Display / Headings: `Orbitron`
  - Body / UI: `Space Grotesk`
  - Monospace / Code / Badges: `JetBrains Mono`
- **Animations**: Page mount transitions, modal popups (`AnimatePresence`), hover states, and 3D card tilt dynamics (`ParallaxCard`) driven by Framer Motion.
- **Scrolling**: Smooth inertia scrolling powered by Lenis, exposed to components via `useLenis()`.
- **Background Scanner**: `FixedGrid` SVG grid pattern featuring dual animated scanner lines emitting subtle glow effects.

---

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- Bun (v1.0 or higher)
- A Supabase project with PostgreSQL database enabled
- A GitHub Personal Access Token with organization read permissions

### Environment Variables
Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

For Supabase Edge Functions, set the following secrets in your Supabase dashboard:

```env
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
github_pat=your-github-personal-access-token
```

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/init-club/Init-Website.git
   cd Init-Website
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Run the development server:
   ```bash
   bun run dev
   ```

4. Build for production:
   ```bash
   bun run build
   ```

5. Preview the production build locally:
   ```bash
   bun run preview
   ```

---

## Database Migration & Deployment

Database migrations are managed via SQL files in `supabase/migrations/`.

- `0000_far_guardian.sql`: Core schema initialization (users, repositories, pull_requests, contribution_stats, blogs, attendance, site_settings, legacy forms).
- `0001_lowly_dark_beast.sql`: Initial form function routines.
- `0002_swift_form_normalization.sql`: Schema normalization introducing `form_items`, `form_item_options`, revision control, index optimizations, and updated stored procedures (`save_form_definition`, `get_form_definition`, `get_public_form_definition`, `list_forms_overview`).

To apply migrations using the Supabase CLI:

```bash
bunx supabase db push
```

To deploy Edge Functions:

```bash
bunx supabase functions deploy github-lookup-user
bunx supabase functions deploy github-sync
```

---

## License

This repository is maintained by the **Init Club** core team. All rights reserved.
