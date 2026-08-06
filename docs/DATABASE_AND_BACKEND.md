# Database and Backend Architecture Documentation

This document provides a comprehensive technical reference for the database and backend architecture of the Init-Website repository. It covers the ORM layer, database schemas, migration history, security policies, audit logging, and cache invalidation strategies.

---

## 1. Overview of Supabase PostgreSQL + Drizzle ORM Architecture

The Init-Website backend operates on a hybrid relational database architecture combining **Supabase PostgreSQL** as the database host and platform, and **Drizzle ORM** as the type-safe schema definition and migration tool.

### Architectural Stack

- **Database Platform**: Supabase PostgreSQL engine handling relational tables, custom PostgreSQL enums, stored procedures / RPC functions, index constraints, and Row-Level Security (RLS) policies.
- **ORM & Schema Definition**: [drizzle-orm](file:///C:/My-Files/Github/Init-Website/package.json#L21) (`v0.45.2`) and [drizzle-kit](file:///C:/My-Files/Github/Init-Website/package.json#L43) (`v0.31.10`). Schema definitions reside in [`src/db/schema.ts`](file:///C:/My-Files/Github/Init-Website/src/db/schema.ts).
- **Client Access Layer**: [`@supabase/supabase-js`](file:///C:/My-Files/Github/Init-Website/package.json#L18) client ([`src/supabaseClient.ts`](file:///C:/My-Files/Github/Init-Website/src/supabaseClient.ts)) used for web client requests, RPC invocations, session authentication, and direct table queries under RLS enforcement.
- **State Management & Data Fetching**: SWR (`swr`) for client-side caching, data fetching, and optimistic cache invalidation.

```
+-----------------------------------------------------------------------+
|                           Vite + React App                            |
|                                                                       |
|   +-----------------------+               +-----------------------+   |
|   |   SWR Data Fetching   |               |   Audit Logger        |   |
|   |   (src/utils/         |               |   (src/utils/         |   |
|   |    fetchers.ts)       |               |    auditLogger.ts)    |   |
|   +-----------+-----------+               +-----------+-----------+   |
|               |                                       |               |
|               +-------------------+-------------------+               |
|                                   |                                   |
|                         +---------v----------+                        |
|                         |  Supabase Client   |                        |
|                         | (supabaseClient.ts)|                        |
|                         +---------+----------+                        |
+-----------------------------------|-----------------------------------+
                                    | HTTPS / PostgREST / WebSockets
                                    v
+-----------------------------------------------------------------------+
|                          Supabase PostgreSQL                          |
|                                                                       |
|   +------------------+   +-------------------+   +----------------+   |
|   |  Public Tables   |   |   RPC Functions   |   | RLS Policies   |   |
|   |  (users, forms,  |   | (save_form_def,   |   | (is_admin(),   |   |
|   |   blogs, etc.)   |   |  get_form_def)    |   |  public read)  |   |
|   +------------------+   +-------------------+   +----------------+   |
|                                                                       |
|   Schema managed via Drizzle SQL Migrations (supabase/migrations/*)   |
+-----------------------------------------------------------------------+
```

---

## 2. Table Definitions and Technical Specifications

All tables are defined in [`src/db/schema.ts`](file:///C:/My-Files/Github/Init-Website/src/db/schema.ts) and created via SQL migration files.

### 2.1 `users`

Stores profile and metadata for members, core team members, and administrators.

- **Primary Key**: `id` (`uuid`, DEFAULT `gen_random_uuid()`)
- **Unique Constraints**: `github_id` (`users_github_id_unique`)

| Field Name | Type | Constraints / Default | Description |
|---|---|---|---|
| `id` | `uuid` | PRIMARY KEY, `gen_random_uuid()` | Unique user identifier |
| `auth_user_id` | `uuid` | Nullable | References Supabase `auth.users.id` |
| `github_id` | `bigint` | NOT NULL, UNIQUE | GitHub user ID (numeric mode in Drizzle) |
| `username` | `text` | NOT NULL | GitHub username |
| `name` | `text` | NOT NULL | Full display name |
| `avatar_url` | `text` | Nullable | Avatar image URL |
| `bio` | `text` | Nullable | User biography |
| `role` | `text` | DEFAULT `'member'` | System role (`'member'`, `'admin'`) |
| `is_core_member` | `boolean` | DEFAULT `false` | Indicates core club member status |
| `team_name` | `text` | Nullable | Assigned internal team name |
| `is_team_leader` | `boolean` | DEFAULT `false` | Indicates team leadership status |
| `is_active` | `boolean` | DEFAULT `true` | Account active flag |
| `profile_completed` | `boolean` | DEFAULT `false` | Profile completion onboarding flag |
| `created_at` | `timestamp with time zone` | DEFAULT `now()` | Account creation timestamp |
| `last_seen_at` | `timestamp with time zone` | Nullable | Last activity timestamp |
| `linkedin_url` | `text` | Nullable | LinkedIn profile link |
| `instagram_url` | `text` | Nullable | Instagram profile link |
| `github_url` | `text` | Nullable | Public GitHub profile link |
| `roll_no` | `text` | Nullable | Institutional roll number |
| `custom_title` | `text` | Nullable | Custom designation or badge title |

---

### 2.2 `repositories`

Tracks GitHub repositories managed by or showcased by the club.

- **Primary Key**: `id` (`bigint`)

| Field Name | Type | Constraints / Default | Description |
|---|---|---|---|
| `id` | `bigint` | PRIMARY KEY | Internal repository identifier |
| `github_repo_id` | `bigint` | NOT NULL | External GitHub repository ID |
| `name` | `text` | NOT NULL | Repository name |
| `description` | `text` | Nullable | Repository description |
| `html_url` | `text` | NOT NULL | Web URL on GitHub |
| `is_archived` | `boolean` | DEFAULT `false` | Archival flag |
| `is_featured` | `boolean` | DEFAULT `false` | Showcase highlight flag |
| `stars` | `integer` | DEFAULT `0` | GitHub star count |
| `forks` | `integer` | DEFAULT `0` | GitHub fork count |
| `pushed_at` | `timestamp with time zone` | Nullable | Last commit push timestamp |
| `last_synced_at` | `timestamp with time zone` | Nullable | Last GitHub API sync timestamp |
| `archival_reason` | `text` | Nullable | Reason for repository archival |
| `is_revivable` | `boolean` | DEFAULT `true` | Indicates if archived project can be revived |
| `topics` | `jsonb` | Nullable | Topic tags array |
| `difficulty` | `text` | Nullable | Project difficulty rating |
| `project_status` | `text` | Nullable | Status (`'active'`, `'completed'`, etc.) |
| `video_url` | `text` | Nullable | Demo or presentation video URL |
| `homepage` | `text` | Nullable | Live application demo URL |

---

### 2.3 `pull_requests`

Records pull requests submitted by members against tracked club repositories.

- **Primary Key**: `id` (`uuid`, DEFAULT `gen_random_uuid()`)
- **Unique Constraints**: `github_pr_id` (`pull_requests_github_pr_id_unique`)

| Field Name | Type | Constraints / Default | Description |
|---|---|---|---|
| `id` | `uuid` | PRIMARY KEY, `gen_random_uuid()` | Unique PR record identifier |
| `github_pr_id` | `bigint` | NOT NULL, UNIQUE | External GitHub pull request ID |
| `repo_id` | `bigint` | FK -> `repositories(id)` ON DELETE CASCADE | Parent repository ID |
| `author_id` | `uuid` | FK -> `users(id)` ON DELETE CASCADE | Submitting member user ID |
| `title` | `text` | Nullable | Pull request title |
| `state` | `text` | Nullable | PR state (`'open'`, `'closed'`, `'merged'`) |
| `merged_at` | `timestamp with time zone` | Nullable | Timestamp when PR was merged |
| `created_at` | `timestamp with time zone` | Nullable | PR creation timestamp |

---

### 2.4 `contribution_stats`

Stores monthly aggregated contribution metrics, commit counts, PR counts, and score adjustments per user.

- **Primary Key**: Composite `("user_id", "month", "year")` (`contribution_stats_user_id_month_year_pk`)

| Field Name | Type | Constraints / Default | Description |
|---|---|---|---|
| `user_id` | `uuid` | NOT NULL, FK -> `users(id)` ON DELETE CASCADE | Associated user ID |
| `month` | `integer` | NOT NULL | Calendar month (1-12) |
| `year` | `integer` | NOT NULL | Calendar year (e.g. 2026) |
| `commit_count` | `integer` | DEFAULT `0` | Total commits count in period |
| `pr_count` | `integer` | DEFAULT `0` | Total pull requests count in period |
| `score` | `integer` | DEFAULT `0` | Computed leaderboards contribution score |
| `score_adjustment` | `integer` | NOT NULL, DEFAULT `0` | Manual bonus or penalty adjustment |
| `adjustment_reason` | `text` | Nullable | Reason for manual score adjustment |
| `last_updated_at` | `timestamp with time zone` | DEFAULT `now()` | Metrics update timestamp |

---

### 2.5 `blogs`

Manages blog posts, articles, submission statuses, and author metadata. Uses custom PostgreSQL enum `blog_status`.

- **Custom Enum**: `blog_status` = `('pending', 'published', 'rejected')`
- **Primary Key**: `id` (`uuid`, DEFAULT `gen_random_uuid()`)
- **Unique Constraints**: `slug` (`blogs_slug_unique`)

| Field Name | Type | Constraints / Default | Description |
|---|---|---|---|
| `id` | `uuid` | PRIMARY KEY, `gen_random_uuid()` | Unique blog post identifier |
| `title` | `text` | NOT NULL | Article title |
| `slug` | `text` | NOT NULL, UNIQUE | URL-safe unique slug |
| `content` | `text` | NOT NULL | Markdown or raw blog content |
| `author_id` | `uuid` | FK -> `users(id)` ON DELETE SET NULL | Author user ID |
| `is_published` | `boolean` | DEFAULT `false` | Publication flag |
| `published_at` | `timestamp with time zone` | Nullable | Timestamp when published |
| `roll_no` | `text` | Nullable | Author roll number |
| `phone_number` | `text` | Nullable | Author contact phone number |
| `tags` | `text[]` | Nullable | Tag array |
| `author_name` | `text` | Nullable | Display author name fallback |
| `status` | `blog_status` | DEFAULT `'pending'` | Review status (`'pending'`, `'published'`, `'rejected'`) |
| `cover_image_url` | `text` | Nullable | Header cover image URL |
| `created_at` | `timestamp with time zone` | DEFAULT `now()` | Blog creation timestamp |

---

### 2.6 `attendance_sessions` and `attendance_records`

Tracks event attendance sessions and individual member attendance statuses.

#### Table: `attendance_sessions`
- **Primary Key**: `id` (`uuid`, DEFAULT `gen_random_uuid()`)

| Field Name | Type | Constraints / Default | Description |
|---|---|---|---|
| `id` | `uuid` | PRIMARY KEY, `gen_random_uuid()` | Session identifier |
| `name` | `text` | NOT NULL | Session / Event name |
| `session_date` | `date` | Nullable | Event date |
| `created_by` | `uuid` | FK -> `users(id)` ON DELETE SET NULL | Creator user ID |

#### Table: `attendance_records`
- **Primary Key**: Composite `("session_id", "user_id")` (`attendance_records_session_id_user_id_pk`)

| Field Name | Type | Constraints / Default | Description |
|---|---|---|---|
| `session_id` | `uuid` | NOT NULL, FK -> `attendance_sessions(id)` ON DELETE CASCADE | Parent attendance session ID |
| `user_id` | `uuid` | NOT NULL, FK -> `users(id)` ON DELETE CASCADE | Attending user ID |
| `status` | `text` | Nullable | Status (`'present'`, `'absent'`, `'excused'`) |

---

### 2.7 `audit_logs`

Captures administrative actions and data modification history.

- **Primary Key**: `id` (`uuid`, DEFAULT `gen_random_uuid()`)

| Field Name | Type | Constraints / Default | Description |
|---|---|---|---|
| `id` | `uuid` | PRIMARY KEY, `gen_random_uuid()` | Audit log entry ID |
| `performed_by_id` | `uuid` | FK -> `users(id)` ON DELETE SET NULL | Actor user ID |
| `action_type` | `text` | NOT NULL | Action category (`'CREATE'`, `'UPDATE'`, `'DELETE'`) |
| `target_id` | `text` | Nullable | Identifier of affected entity |
| `old_value` | `jsonb` | Nullable | Prior data state snapshot |
| `new_value` | `jsonb` | Nullable | Updated data state snapshot |
| `created_at` | `timestamp with time zone` | DEFAULT `now()` | Action log timestamp |
| `table_name` | `text` | Nullable | Target database table name |
| `old_data` | `jsonb` | Nullable | Supplementary old state |
| `new_data` | `jsonb` | Nullable | Supplementary new state |

---

### 2.8 `site_settings`

Global site configuration singleton table (`id = 1`).

- **Primary Key**: `id` (`integer`, DEFAULT `1`)

| Field Name | Type | Constraints / Default | Description |
|---|---|---|---|
| `id` | `integer` | PRIMARY KEY, DEFAULT `1` | Singleton row lock identifier |
| `allow_public_blogs` | `boolean` | NOT NULL, DEFAULT `true` | Controls non-admin blog submissions |
| `discord_link` | `text` | NOT NULL, DEFAULT `''` | Official Discord invite link |
| `instagram_link` | `text` | NOT NULL, DEFAULT `''` | Official Instagram page link |
| `linkedin_link` | `text` | NOT NULL, DEFAULT `''` | Official LinkedIn page link |
| `updated_at` | `timestamp with time zone` | DEFAULT `now()` | Settings update timestamp |

---

### 2.9 Forms Ecosystem

The custom form builder and response collection system consists of four normalized tables.

#### Table: `forms`
- **Primary Key**: `id` (`uuid`, DEFAULT `gen_random_uuid()`)
- **Unique Constraints**: `slug` (`forms_slug_unique`)
- **Check Constraints**: `status IN ('draft', 'published', 'closed')`

| Field Name | Type | Constraints / Default | Description |
|---|---|---|---|
| `id` | `uuid` | PRIMARY KEY, `gen_random_uuid()` | Form identifier |
| `slug` | `text` | NOT NULL, UNIQUE | Unique URL slug |
| `title` | `text` | NOT NULL | Form title |
| `description` | `text` | Nullable | Form description text |
| `status` | `text` | DEFAULT `'draft'`, CHECK status | Form status (`'draft'`, `'published'`, `'closed'`) |
| `fields` | `jsonb` | NOT NULL, DEFAULT `'[]'` | Legacy fields array (cleared in migration 0002) |
| `settings` | `jsonb` | NOT NULL, DEFAULT `'{}'` | Form configuration flags |
| `created_by` | `uuid` | FK -> `users(id)` ON DELETE SET NULL | Creator user ID |
| `created_at` | `timestamp with time zone` | DEFAULT `now()` | Creation timestamp |
| `updated_at` | `timestamp with time zone` | DEFAULT `now()` | Last modification timestamp |
| `revision` | `integer` | NOT NULL, DEFAULT `1` | Monotonic revision counter for optimistic concurrency |

#### Table: `form_items`
- **Primary Key**: Composite `("form_id", "item_id")` (`form_items_pk`)
- **Check Constraints**:
  - `kind IN ('text', 'email', 'number', 'textarea', 'select', 'radio', 'multiselect', 'checkbox', 'date', 'rating', 'section')`
  - `position >= 0`
- **Indexes**:
  - `idx_form_items_form_position`: UNIQUE INDEX ON `("form_id", "position")`
  - `idx_form_items_form_kind`: INDEX ON `("form_id", "kind")`

| Field Name | Type | Constraints / Default | Description |
|---|---|---|---|
| `form_id` | `uuid` | NOT NULL, FK -> `forms(id)` ON DELETE CASCADE | Parent form ID |
| `item_id` | `text` | NOT NULL | Field item identifier within form |
| `kind` | `text` | NOT NULL, CHECK kind | Input type classifier |
| `title` | `text` | NOT NULL | Field label / question title |
| `description` | `text` | Nullable | Field help text |
| `required` | `boolean` | NOT NULL, DEFAULT `false` | Required field validation flag |
| `position` | `integer` | NOT NULL, CHECK position >= 0 | Display sequence order |
| `config` | `jsonb` | NOT NULL, DEFAULT `'{}'` | Configuration object (placeholder, rating scale, validation rules) |
| `created_at` | `timestamp with time zone` | DEFAULT `now()` | Creation timestamp |
| `updated_at` | `timestamp with time zone` | DEFAULT `now()` | Modification timestamp |

#### Table: `form_item_options`
- **Primary Key**: Composite `("form_id", "item_id", "option_id")` (`form_item_options_pk`)
- **Foreign Keys**: `("form_id", "item_id")` -> `form_items("form_id", "item_id")` ON DELETE CASCADE (`form_item_options_form_item_fk`)
- **Check Constraints**: `position >= 0`
- **Indexes**:
  - `idx_form_item_options_item_position`: UNIQUE INDEX ON `("form_id", "item_id", "position")`
  - `idx_form_item_options_item`: INDEX ON `("form_id", "item_id")`

| Field Name | Type | Constraints / Default | Description |
|---|---|---|---|
| `form_id` | `uuid` | NOT NULL | Parent form ID |
| `item_id` | `text` | NOT NULL | Parent form item ID |
| `option_id` | `text` | NOT NULL | Unique option ID |
| `label` | `text` | NOT NULL | Display label of option |
| `position` | `integer` | NOT NULL, CHECK position >= 0 | Option sequence position |
| `created_at` | `timestamp with time zone` | DEFAULT `now()` | Creation timestamp |

#### Table: `form_responses`
- **Primary Key**: `id` (`uuid`, DEFAULT `gen_random_uuid()`)
- **Indexes**:
  - `idx_form_responses_form_id`: INDEX ON `("form_id")`
  - `idx_form_responses_submitted_at`: INDEX ON `("submitted_at" DESC)`

| Field Name | Type | Constraints / Default | Description |
|---|---|---|---|
| `id` | `uuid` | PRIMARY KEY, `gen_random_uuid()` | Response record ID |
| `form_id` | `uuid` | NOT NULL, FK -> `forms(id)` ON DELETE CASCADE | Associated form ID |
| `answers` | `jsonb` | NOT NULL, DEFAULT `'{}'` | Key-value dictionary of field answers (`item_id` -> answer) |
| `respondent` | `jsonb` | DEFAULT `'{}'` | Submitter identity metadata |
| `metadata` | `jsonb` | DEFAULT `'{}'` | Browser / submission session metadata |
| `submitted_at` | `timestamp with time zone` | DEFAULT `now()` | Submission timestamp |

---

## 3. Migration Evolution History

The database schema evolved across three explicit SQL migration files located in [`supabase/migrations/`](file:///C:/My-Files/Github/Init-Website/supabase/migrations):

### 3.1 Migration `0000_far_guardian.sql`

- **Purpose**: Baseline schema instantiation.
- **Key Changes**:
  1. Created `blog_status` PostgreSQL enum type (`'pending'`, `'published'`, `'rejected'`).
  2. Created core application tables: `users`, `repositories`, `pull_requests`, `contribution_stats`, `blogs`, `attendance_sessions`, `attendance_records`, `audit_logs`.
  3. Configured foreign key cascades (e.g. `pull_requests` -> `repositories` and `users`, `attendance_records` -> `attendance_sessions` and `users`).
  4. Configured unique keys on `users.github_id`, `blogs.slug`, and `pull_requests.github_pr_id`.

### 3.2 Migration `0001_lowly_dark_beast.sql`

- **Purpose**: Introduction of dynamic form builder and responses.
- **Key Changes**:
  1. Created `forms` table with inline JSONB `fields` array and `settings` JSONB object.
  2. Created `form_responses` table referencing `forms.id` with `ON DELETE CASCADE`.
  3. Added index `idx_form_responses_form_id` and descending index `idx_form_responses_submitted_at`.
  4. Enabled Row-Level Security on `forms` and `form_responses`.
  5. Established initial RLS policies permitting public read on published forms, public submission insertion for published forms, and admin full access via `public.is_admin()`.

### 3.3 Migration `0002_swift_form_normalization.sql`

- **Purpose**: Form system normalization, optimistic locking, and stored procedure / RPC function suite.
- **Key Changes**:
  1. Added `revision` integer column to `forms` (`DEFAULT 1 NOT NULL`).
  2. Created normalized `form_items` table with `kind` CHECK constraint and unique position index `idx_form_items_form_position`.
  3. Created normalized `form_item_options` table with option level index `idx_form_item_options_item_position`.
  4. Migrated legacy JSONB arrays in `forms.fields` into relational rows inside `form_items` and `form_item_options` using `LATERAL jsonb_array_elements(...)`.
  5. Emptied legacy `forms.fields` to `[]` post-migration.
  6. Enabled RLS and created policies for `form_items` and `form_item_options`.
  7. Created 4 core Stored Procedures / RPC Functions:
     - `public.get_form_definition(p_form_id uuid)`: Admin RPC assembling complete form JSON definition with fields and options.
     - `public.get_public_form_definition(p_slug text)`: Public RPC fetching published form by slug.
     - `public.list_forms_overview()`: Admin table-returning RPC calculating field counts and response counts per form.
     - `public.save_form_definition(...)`: Transactional form upsert procedure handling optimistic revision validation (`p_expected_revision`), revision incrementing, item deletion, and re-insertion of normalized items and options.
  8. Granted `EXECUTE` privileges on functions to `authenticated` and `anon` database roles.

---

## 4. Row-Level Security (RLS) Policies and Security Model

All sensitive tables enforce Supabase Row-Level Security. Administrative privilege verification is centralized under the PostgreSQL helper function `public.is_admin()`.

### 4.1 Helper Function `public.is_admin()`

The helper function checks whether the executing session user possesses administrative privileges.

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE users.auth_user_id = auth.uid()
      AND users.role = 'admin'
  );
END;
$$;
```

### 4.2 RLS Policy Matrix

| Table | Policy Name | Command | Target / Condition |
|---|---|---|---|
| `forms` | Public read published forms | `SELECT` | `status = 'published'` |
| `forms` | Admin full access on forms | `ALL` | `public.is_admin()` |
| `form_items` | Public read published form items | `SELECT` | `EXISTS (SELECT 1 FROM public.forms WHERE forms.id = form_items.form_id AND forms.status = 'published')` |
| `form_items` | Admin full access on form items | `ALL` | `public.is_admin()` |
| `form_item_options` | Public read published form item options | `SELECT` | `EXISTS (SELECT 1 FROM public.forms WHERE forms.id = form_item_options.form_id AND forms.status = 'published')` |
| `form_item_options` | Admin full access on form item options | `ALL` | `public.is_admin()` |
| `form_responses` | Public insert to published forms | `INSERT` | `WITH CHECK (EXISTS (SELECT 1 FROM public.forms WHERE forms.id = form_responses.form_id AND forms.status = 'published'))` |
| `form_responses` | Admin read all responses | `SELECT` | `public.is_admin()` |

---

## 5. Audit Logging Architecture

Administrative updates, creations, and deletions are logged into `public.audit_logs` using the utility module [`src/utils/auditLogger.ts`](file:///C:/My-Files/Github/Init-Website/src/utils/auditLogger.ts).

### Execution Flow

1. **Invocation**: Administrative actions call `logAuditAction(...)`:
   ```typescript
   export async function logAuditAction(
     actionType: string,
     tableName: string,
     targetId: string | null,
     oldValue: any = null,
     newValue: any = null,
     performedById?: string | null
   )
   ```
2. **Actor Resolution**:
   - If `performedById` is provided directly, it is used as the actor ID.
   - If `performedById` is absent, `logAuditAction` retrieves the active session from `supabase.auth.getSession()`.
   - It queries `public.users` matching `auth_user_id = session.user.id` to resolve the database user UUID (`actorId`).
   - If no valid session or user record exists, logging aborts gracefully to avoid unauthenticated runtime failure.
3. **Database Insertion**: An audit entry is inserted into `audit_logs` with `performed_by_id`, `action_type`, `table_name`, `target_id`, `old_value`, and `new_value`.
4. **Error Handling**: Wrapped in a `try...catch` block so audit write errors never disrupt primary business logic operations.

---

## 6. SWR Cache Invalidation Mechanism

Client-side data fetching uses SWR (`swr`). To prevent stale UI states after mutations, cache keys and invalidation routines are standardized in [`src/utils/swrKeys.ts`](file:///C:/My-Files/Github/Init-Website/src/utils/swrKeys.ts) and [`src/utils/cacheInvalidation.ts`](file:///C:/My-Files/Github/Init-Website/src/utils/cacheInvalidation.ts).

### 6.1 SWR Key Registry (`src/utils/swrKeys.ts`)

```typescript
export const SWR_KEYS = {
  SITE_SETTINGS: 'site_settings',
  ADMIN_BLOGS: 'admin_blogs',
  ADMIN_PROJECTS: 'admin_projects',
  ADMIN_MEMBERS: 'admin_members',
  ADMIN_SESSIONS: 'admin_sessions',
  FORMS_LIST: 'forms_list',
  form: (id: string) => `form:${id}`,
  formResponses: (id: string) => `form_responses:${id}`,
  publicForm: (slug: string) => `public_form:${slug}`,
} as const;
```

### 6.2 Cache Invalidation Utility (`src/utils/cacheInvalidation.ts`)

The function `invalidateFormCaches` invalidates form caches selectively based on mutated resources:

```typescript
import { mutate } from 'swr';
import { SWR_KEYS } from './swrKeys';

type InvalidateFormCachesOptions = {
  formId?: string | null;
  slug?: string | null;
};

export async function invalidateFormCaches({
  formId,
  slug,
}: InvalidateFormCachesOptions = {}) {
  const keys = new Set<string>();

  // Always invalidate the overall forms list
  keys.add(SWR_KEYS.FORMS_LIST);

  if (formId) {
    keys.add(SWR_KEYS.form(formId));
    keys.add(SWR_KEYS.formResponses(formId));
  }

  if (slug) {
    keys.add(SWR_KEYS.publicForm(slug));
  }

  await Promise.all([...keys].map((key) => mutate(key)));
}
```

### 6.3 Data Fetching Services (`src/utils/fetchers.ts`)

All SWR hooks consume centralized fetcher routines in [`src/utils/fetchers.ts`](file:///C:/My-Files/Github/Init-Website/src/utils/fetchers.ts):

- `fetchSiteSettings()`: Queries `site_settings` for `id = 1`.
- `fetchAdminBlogs()`: Queries `blogs` ordered by `created_at DESC`.
- `fetchAdminProjects()`: Queries `repositories` where `is_visible = true`.
- `fetchAdminMembers()`: Queries `users` with nested `contribution_stats`.
- `fetchAdminSessions()`: Queries `attendance_sessions` ordered by `session_date DESC`.
- `fetchAllForms()`: Executes RPC `list_forms_overview`.
- `fetchPublishedForms()`: Queries `forms` where `status = 'published'`.
- `fetchFormById(formId)`: Executes RPC `get_form_definition`.
- `fetchFormResponses(formId)`: Queries `form_responses` for `formId`.
- `fetchPublicFormBySlug(slug)`: Executes RPC `get_public_form_definition`.
