# Frontend and Admin Suite Documentation

This document provides a comprehensive technical breakdown of the frontend architecture, routing, authentication context, security controls, public pages, and administrative suite for the **Init-Website** application.

---

## 1. Router Setup, Lazy Loading, and Route Structure

### Architecture Overview
The application root is configured in [`src/App.tsx`](file:///C:/My-Files/Github/Init-Website/src/App.tsx). It uses `BrowserRouter` from `react-router-dom` wrapped with an `AuthProvider` context.

```
App (AuthProvider)
 └── BrowserRouter
      └── AppContent
           └── SmoothScroll
                ├── ScrollToTop
                ├── JIT Sync Banner (Conditional)
                ├── AccessDeniedModal (Conditional)
                └── Suspense (Fallback: Fullscreen Loader)
                     └── Routes
```

### Lazy Loading Strategy
To optimize initial Bundle Size and Page Load Performance (FCP/LCP), all secondary pages and administrative subpages are dynamic code-split chunks using `React.lazy()` imports.

- **Synchronous Import**: Only [`HomePage`](file:///C:/My-Files/Github/Init-Website/src/pages/Home.tsx) (`src/pages/Home.tsx`) is imported synchronously to ensure instant rendering without fallback flash when visiting the root domain `/`.
- **Lazy Imports**: All other route components are dynamically imported:
  - Public Pages: `AboutPage`, `BlogsPage`, `FormsPage`, `ContactPage`, `EventsPage`, `IdeaWallPage`, `GraveyardPage`, `ActivityPage`, `MembersPage`, `LoginPage`, `ProfileSetup`, `Profile`, `PublicFormPage`, `FormSuccessPage`, `NotFoundPage`.
  - Admin Dashboards: `AdminDashboard`, `BlogsAdminPage`, `ProjectAdmin`, `MembersAdmin`, `SettingsAdmin`, `EventsAdmin`, `AnalyticsAdmin`, `FormsAdminPage`, `FormBuilderPage`, `FormResponsesPage`.

### Suspense Fallback
While lazy chunks are loaded over the network, `Suspense` renders an obsidian-dark full-screen backdrop with a cyan spinning loader (`<Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />`).

### Route Tree Specification

| Path | Component | Guard / Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/` | `HomePage` | Public | Core landing page with interactive node graph and club overview |
| `/login` | `LoginPage` | Public / Guest | GitHub OAuth initiation page |
| `/about` | `AboutPage` | Public | Hero, mission statement, core values, and 3-tier team showcase |
| `/members` | `MembersPage` | Public | Member showcase (renders `ComingSoon` placeholder) |
| `/idea-wall` | `IdeaWallPage` | Public | Active project showcase with filters and project detail modal |
| `/graveyard` | `GraveyardPage` | Public | Archived projects with revivable filters and archival reasons |
| `/activity` | `ActivityPage` | Public | Activity log (renders `ComingSoon` placeholder) |
| `/events` | `EventsPage` | Public | Events directory (renders `ComingSoon` placeholder) |
| `/blogs` | `BlogsPage` | Public | Community blog directory with guidelines post and submission modal |
| `/forms` | `FormsPage` | Public | Directory of published community forms |
| `/forms/:slug` | `PublicFormPage` | Public | Dynamic public form renderer with custom input fields |
| `/forms/:slug/success` | `FormSuccessPage` | Public | Post-submission confirmation page |
| `/contact` | `ContactPage` | Public | Club spirit, onboarding journey, rules, and task sheet PDF preview |
| `/profile-setup` | `ProfileSetup` | Authenticated (Gate) | Mandatory onboarding form for new members |
| `/profile` | `Profile` | Authenticated | Current logged-in user profile dashboard |
| `/profile/:username` | `Profile` | Public | Member public profile view |
| `/admin` | `AdminDashboard` | `AdminGuard` | Central administrative dashboard and manual GitHub sync |
| `/admin/blogs` | `BlogsAdminPage` | `AdminGuard` | Blog submission reviews, approvals, rejections, and edits |
| `/admin/projects` | `ProjectAdmin` | `AdminGuard` | Repository management, visibility toggles, and metadata edits |
| `/admin/members` | `MembersAdmin` | `AdminGuard` | Member roster, role assignment, whitelisting, score overrides |
| `/admin/events` | `EventsAdmin` | `AdminGuard` | Event session management and member roll-call attendance |
| `/admin/analytics` | `AnalyticsAdmin` | `AdminGuard` | System analytics for GitHub PRs, repositories, and attendance |
| `/admin/settings` | `SettingsAdmin` | `AdminGuard` | Global site configuration and social media link management |
| `/admin/forms` | `FormsAdminPage` | `AdminGuard` | Form management list and status toggling |
| `/admin/forms/new` | `FormBuilderPage` | `AdminGuard` | Visual form creator |
| `/admin/forms/:formId/edit` | `FormBuilderPage` | `AdminGuard` | Visual form editor |
| `/admin/forms/:formId/responses` | `FormResponsesPage` | `AdminGuard` | Form submission analytics, table view, and CSV export |
| `*` | `NotFoundPage` | Public | Cyberpunk 404 fallback page |

---

## 2. AuthContext, JIT GitHub OAuth Flow, and Onboarding Gate

### AuthContext Architecture
Authentication and global user state are managed by [`AuthContext.tsx`](file:///C:/My-Files/Github/Init-Website/src/context/AuthContext.tsx).

- **Context Interface**:
  - `session`: Supabase `Session` object or `null`.
  - `userProfile`: Database user row from `users` table or `null`.
  - `isAdmin`: Boolean flag indicating if `userProfile.role === 'admin'`.
  - `isLoading`: Boolean state active during initial session check or RPC fetch.
  - `refreshProfile`: Asynchronous method to force re-fetch profile data.

- **Profile Resolution Logic**:
  `fetchProfile` calls the Supabase RPC `get_my_status`. If the RPC succeeds, it sets `userProfile` and evaluates `isAdmin`. If RPC fails or returns empty data, it executes a fallback query against the `users` table filtering by `auth_user_id`.

- **Event Lifecycle**:
  `AuthProvider` registers `supabase.auth.onAuthStateChange` to continuously update session and user profile states upon login, token refresh, or sign out.

### Just-In-Time (JIT) GitHub OAuth Onboarding Flow

```
[User Clicks "Sign in with GitHub"]
              │
              ▼
    [GitHub OAuth Callback]
              │
              ▼
    [Supabase Auth Session Created]
              │
              ▼
   [AppContent useEffect Triggers]
              │
      ┌───────┴───────┐
      │ DB Row Exists?│
      └───────┬───────┘
         No   │   Yes
  ┌───────────┴───────────┐
  ▼                       ▼
[Execute JIT Sync]     [Check Onboarding Gate]
  │                       │
  ├─ Calls Edge Function:  ├─ profile_completed == true -> Access Granted
  │  'github-lookup-user' │
  │                       └─ profile_completed == false -> Redirect '/profile-setup'
  ├─ Validates GitHub Org
  │  Membership (init-club)
  │
  ├─ Success -> refreshProfile() -> Redirect '/profile-setup'
  └─ Failure -> Show AccessDeniedModal -> Sign Out
```

1. **JIT Trigger**: When a user logs in via GitHub OAuth for the first time, a Supabase Auth user is created, but no matching row exists in the `users` database table yet. `useEffect` in [`App.tsx`](file:///C:/My-Files/Github/Init-Website/src/App.tsx) detects `session && !userProfile` and invokes `tryJitSync()`.
2. **Edge Function Invocation**: `tryJitSync()` calls the Supabase edge function `github-lookup-user`, passing `github_username` extracted from `session.user.user_metadata.preferred_username` or `user_name`.
3. **GitHub Organization Verification**: The edge function verifies if the GitHub user belongs to the `init-club` organization. If verified, it inserts a new row into the `users` table. If the user is not a member of the organization, the function returns an error, triggering `setShowAccessDenied(true)`.
4. **JIT Sync Pending Edge Case**: If the redirect URL contains a `#JIT_SYNC_PENDING` fragment (resulting from OAuth redirect timing delays), a persistent blue system notification banner is displayed asking the user to wait 5 seconds and log in again.

### Onboarding Redirect Gate (`profile_completed`)
After JIT sync creates the database record, the user's `profile_completed` column defaults to `false`.

- `AppContent` monitors `[session, userProfile, isLoading]`.
- If `userProfile && !userProfile.profile_completed`, the application forcibly redirects the user to `/profile-setup`.
- The user is blocked from accessing protected pages until they fill in required onboarding metadata (full name, roll number, academic branch, bio, social links).
- Upon form submission in [`ProfileSetup.tsx`](file:///C:/My-Files/Github/Init-Website/src/pages/ProfileSetup.tsx), `profile_completed` is set to `true`, clearing the gate and allowing standard navigation.

---

## 3. AdminGuard Higher-Order Component and RBAC Model

### AdminGuard Component
Administrative routes are guarded by [`AdminGuard.tsx`](file:///C:/My-Files/Github/Init-Website/src/components/shared/AdminGuard.tsx).

```tsx
export default function AdminGuard({ children }: AdminGuardProps) {
  const { isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return isAdmin ? <>{children}</> : null;
}
```

### RBAC Security Model
The application implements a multi-tier Role-Based Access Control (RBAC) architecture:

```
                          ┌──────────────────────────┐
                          │   System Security Model  │
                          └────────────┬─────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
     [Public / Guest]              [Member]                    [Admin]
  ────────────────────       ───────────────────        ──────────────────────
  • Browse Public Pages      • Submit Blogs             • Access /admin/* Suite
  • View Projects & Blogs    • Submit Form Responses    • Approve/Reject Blogs
  • Submit Forms             • View Own Profile         • Manage Repositories
  • View Profiles            • Edit Own Profile         • Manage Member Roles
                             • View Member Directory    • Override Leaderboards
                                                        • Conduct Attendance
                                                        • View Analytics
                                                        • System Configuration
```

1. **Role Definition**: Roles are defined in the `users.role` database column:
   - `'admin'`: Executive leads and system maintainers.
   - `'member'`: Verified club members with active GitHub organization membership.
   - `'guest'`: Unauthenticated visitors.
2. **Client-Side Enforcer**: `<AdminGuard>` evaluates `isAdmin` from `AuthContext`. Non-admin users attempting to access `/admin/*` paths are redirected to the homepage (`/`).
3. **Database-Level Enforcement (RLS)**: Row-Level Security (RLS) policies on Supabase tables (`blogs`, `repositories`, `users`, `attendance_sessions`, `forms`, `site_settings`) validate the requesting user's `auth.uid()` against `users.role = 'admin'` to prevent unauthorized API payloads or direct database mutations.

---

## 4. Public Pages Breakdown

### Home Page (`/`)
- **File**: [`src/pages/Home.tsx`](file:///C:/My-Files/Github/Init-Website/src/pages/Home.tsx)
- **Key Subcomponents**:
  - `FixedGrid`: Background SVG matrix and dual animated laser scanners.
  - `GitGraph`: Interactive canvas/SVG visual node graph illustrating club commit activities and project clusters.
  - `AboutWhatWeDo`: Dynamic interactive grid highlighting core club pillars.
  - `Footer`: Global footer with social links and system status.

### About Page (`/about`)
- **File**: [`src/pages/About.tsx`](file:///C:/My-Files/Github/Init-Website/src/pages/About.tsx)
- **Key Subcomponents**:
  - `HeroSection`: Header banner with typewriter title animation.
  - `MissionSection`: Interactive tabbed interface detailing club charter and goals.
  - `CoreValuesSection`: Interactive grid showcasing fundamental club principles using `ParallaxCard`.
  - `TeamSection`: Personnel hierarchy organized into 3 distinct operational tiers:
    - `sudo`: Core executive leadership (President, Vice-President).
    - `maintainer`: Department leads and core technical maintainers.
    - `orchestrator`: Event coordinators and domain managers.
    - Includes `ImageLightbox` modal displaying personnel file cards with neon volumetric backlight glow.

### Members Page (`/members`)
- **File**: [`src/pages/Members.tsx`](file:///C:/My-Files/Github/Init-Website/src/pages/Members.tsx)
- **Features**: Currently renders `<ComingSoon pageName="Events" />` placeholder framed inside standard layout.

### Idea Wall Page (`/idea-wall`)
- **File**: [`src/pages/IdeaWall.tsx`](file:///C:/My-Files/Github/Init-Website/src/pages/IdeaWall.tsx)
- **Features & Data Flow**:
  - Fetches active, non-archived projects (`repositories` table where `is_archived = false` and `is_visible = true`).
  - Client-side debounced search filter (250ms delay) matching project title, description, programming language, or topic tags.
  - Difficulty filter (`all`, `beginner`, `intermediate`, `advanced`).
  - Project status filter (`all`, `idea`, `in_progress`, `completed`, `maintenance`).
  - Sorting options: Recent (`pushed_at`), Stars (`stars`), Name (`name`).
  - Renders grid of `ProjectCard` components and controls `ProjectDetailsModal` for inspecting video demos, topics, and GitHub links.

### Graveyard Page (`/graveyard`)
- **File**: [`src/pages/Graveyard.tsx`](file:///C:/My-Files/Github/Init-Website/src/pages/Graveyard.tsx)
- **Features & Data Flow**:
  - Showcase for sunsetted or archived club projects (`is_archived = true` and `is_visible = true`).
  - Filter toggle for revivable projects (`is_revivable = true`).
  - Displays archival reasons (`archival_reason`), last active timestamps, and `GraveyardCard` components with subtle ghost background icons.

### Activity Page (`/activity`)
- **File**: [`src/pages/Activity.tsx`](file:///C:/My-Files/Github/Init-Website/src/pages/Activity.tsx)
- **Features**: Renders `<ComingSoon pageName="Activity" />` placeholder.

### Events Page (`/events`)
- **File**: [`src/pages/Events.tsx`](file:///C:/My-Files/Github/Init-Website/src/pages/Events.tsx)
- **Features**: Renders `<ComingSoon pageName="Events" />` placeholder.

### Blogs Page (`/blogs`)
- **File**: [`src/pages/Blogs.tsx`](file:///C:/My-Files/Github/Init-Website/src/pages/Blogs.tsx)
- **Features & Data Flow**:
  - Queries published blogs (`status = 'published'`) ordered by `published_at DESC`.
  - Virtual guidelines post (`GUIDELINES_BLOG`) anchored at the top of the blog directory introducing writing standards and Markdown rules.
  - Client-side debounced search supporting filter modes: `all`, `roll_no`, `tags`.
  - Tag pill bar dynamically populated from unique published tags.
  - Controls `WriteBlogModal` enabling authenticated users to compose Markdown blog drafts for admin review.

### Forms Pages (`/forms`, `/forms/:slug`, `/forms/:slug/success`)
- **Files**: [`src/pages/Forms.tsx`](file:///C:/My-Files/Github/Init-Website/src/pages/Forms.tsx), [`src/pages/PublicFormPage.tsx`](file:///C:/My-Files/Github/Init-Website/src/pages/PublicFormPage.tsx), [`src/pages/FormSuccess.tsx`](file:///C:/My-Files/Github/Init-Website/src/pages/FormSuccess.tsx)
- **Features**:
  - `/forms`: Directory of open community registration and feedback forms.
  - `/forms/:slug`: Public form renderer that parses dynamic JSON field schemas (short text, long text, select, radio, checkbox, number, date) and handles client-side validation and submission into `form_responses`.
  - `/forms/:slug/success`: Confirmation page rendered post-submission with animated checkmark and return links.

### Contact Page (`/contact`)
- **File**: [`src/pages/Contact.tsx`](file:///C:/My-Files/Github/Init-Website/src/pages/Contact.tsx)
- **Features**:
  - Displays club spirit cards (`spiritItems`), onboarding roadmap timeline (`journeySteps`), club rules (`truthBombs`), and member gains (`youWillGain`).
  - Includes interactive preview modal `PdfModal` allowing users to view and download the official Init Club induction task sheet.

### Profile Pages (`/login`, `/profile-setup`, `/profile`, `/profile/:username`)
- **Files**: [`src/pages/LoginPage.tsx`](file:///C:/My-Files/Github/Init-Website/src/pages/LoginPage.tsx), [`src/pages/ProfileSetup.tsx`](file:///C:/My-Files/Github/Init-Website/src/pages/ProfileSetup.tsx), [`src/pages/Profile.tsx`](file:///C:/My-Files/Github/Init-Website/src/pages/Profile.tsx)
- **Features & Implementation Decisions**:
  - `/login`: Cyberpunk OAuth trigger page with GitHub authentication button.
  - `/profile-setup`: Onboarding form for fresh JIT-synced accounts.
  - `/profile` & `/profile/:username`: Full member profile card.
  - **RPC vs Direct Table Fallback**: Fetches data using RPC `get_full_profile`. Note that social fields are aliased as `gh_url`, `li_url`, `ig_url` in the RPC response versus `github_url`, `linkedin_url`, `instagram_url` in direct table selects; the profile reader normalizes both schemas.
  - **Client-Side Journey Timeline**: Milestones (Joined, First Commit, First PR, Published Blog, Title Awarded) are dynamically constructed on the client side from profile attributes to avoid database bloat.
  - **Roll Number Privacy**: Academic roll numbers (`roll_no`) are excluded from public profile views for privacy compliance and are visible exclusively to admins in `/admin/members`.

---

## 5. Administrative Suite Breakdown

### Central Admin Dashboard (`/admin`)
- **File**: [`src/pages/admin/AdminDashboard.tsx`](file:///C:/My-Files/Github/Init-Website/src/pages/admin/AdminDashboard.tsx)
- **Features**:
  - Overview stat cards displaying real-time counts for pending blog reviews, registered members, managed repositories, attendance sessions, and active forms.
  - **Manual GitHub Sync**: Trigger button that invokes the `github-sync` Supabase edge function to sync organization repository stars, forks, and contribution metrics.
  - Navigation grid built with `AdminCard` rendering quick-access portals to all administrative submodules.

```
+-----------------------------------------------------------------------+
|                         Admin Dashboard                               |
+-----------------------------------------------------------------------+
|  [Pending Blogs: 3]  [Members: 42]  [Repos: 18]  [Sessions: 12]        |
+-----------------------------------------------------------------------+
|  [Manual Sync GitHub Stats Button]                                     |
+-----------------------------------------------------------------------+
|  Module Portals:                                                      |
|  [Blog Reviews]   [Project Admin]   [Member Roster]  [Attendance]     |
|  [Analytics]      [Site Settings]   [Form Builder]   [Form Responses] |
+-----------------------------------------------------------------------+
```

### Blog Reviews Suite (`/admin/blogs`)
- **File**: [`src/pages/admin/BlogsAdmin.tsx`](file:///C:/My-Files/Github/Init-Website/src/pages/admin/BlogsAdmin.tsx)
- **Features**:
  - SWR data fetching using key `admin_blogs`.
  - Tabbed interface switching between `pending` review submissions and `published` posts.
  - One-click approval/rejection executing Supabase RPC `approve_blog_post`.
  - Full-featured blog post editor and preview modal allowing admins to refine titles, Markdown content, tag lists, cover images, and author metadata.
  - Deletion modal integration using `ConfirmModal`.

### Project Administration (`/admin/projects`)
- **File**: [`src/pages/admin/ProjectAdmin.tsx`](file:///C:/My-Files/Github/Init-Website/src/pages/admin/ProjectAdmin.tsx)
- **Features**:
  - Manages GitHub repositories synced into the `repositories` table.
  - Modal editor (`EditModal`) for configuring project status (`idea`, `in_progress`, `completed`, `maintenance`), difficulty ratings, featured project flag (`is_featured`), and archive state (`is_archived`).
  - Allows linking video demo URLs (`video_url`) and custom homepage links (`homepage`).

### Member Roster & Leaderboards (`/admin/members`)
- **File**: [`src/pages/admin/MembersAdmin.tsx`](file:///C:/My-Files/Github/Init-Website/src/pages/admin/MembersAdmin.tsx)
  - Member management table showing roll numbers, GitHub handles, assigned roles, and custom achievement titles.
  - **All-Time Score Calculation**: Computes total member points on the client by reducing all monthly entries inside `contribution_stats`:
    ```ts
    member.contribution_stats?.reduce((acc, s) => acc + (s.score || 0), 0)
    ```
  - **Score Override Engine**: Admins can award bonus or penalty points (`score_adjustment`) with written justifications (`adjustment_reason`). Overrides target the current month's row in `contribution_stats` without mutating historical records.
  - **Optimistic UI Updates**: Local state updates immediately upon score override submission while SWR cache (`admin_members`) revalidates in the background.
  - Whitelist management interface allowing admins to pre-authorize new GitHub handles into `whitelisted_github_users`.

### Events & Attendance Management (`/admin/events`)
- **File**: [`src/pages/admin/EventsAdmin.tsx`](file:///C:/My-Files/Github/Init-Website/src/pages/admin/EventsAdmin.tsx)
- **Features**:
  - Creation of new attendance sessions (`attendance_sessions` table) with date assignment.
  - Roll-call interface listing all active members with status buttons: `present`, `late`, `absent`.
  - Audit logging via `logAuditAction` recording attendance modification events.

### System Analytics Dashboard (`/admin/analytics`)
- **File**: [`src/pages/admin/AnalyticsAdmin.tsx`](file:///C:/My-Files/Github/Init-Website/src/pages/admin/AnalyticsAdmin.tsx)
- **Features**:
  - **GitHub Metrics Tab**: Pull request counts, merged PR ratios, and live recent pull request feed.
  - **Project Metrics Tab**: Total repository counts, aggregated star and fork counters, difficulty breakdown charts, and top-starred repository leaderboard.
  - **Attendance Metrics Tab**: Total conducted sessions, overall member attendance percentages, and per-session attendance breakdown tables.

### Site Settings Suite (`/admin/settings`)
- **File**: [`src/pages/admin/SettingsAdmin.tsx`](file:///C:/My-Files/Github/Init-Website/src/pages/admin/SettingsAdmin.tsx)
- **Features**:
  - Configures global record in `site_settings` table (ID `1`).
  - Toggle switch for `allow_public_blogs` controlling public blog submissions.
  - Input fields for updating club social platform links (Discord, Instagram, LinkedIn).

### Form Builder & Response Suite (`/admin/forms`, `/admin/forms/new`, `/admin/forms/:formId/edit`, `/admin/forms/:formId/responses`)
- **Files**: [`src/pages/admin/FormsAdmin.tsx`](file:///C:/My-Files/Github/Init-Website/src/pages/admin/FormsAdmin.tsx), `FormBuilder.tsx`, `FormResponses.tsx`
- **Features**:
  - **Form Admin List**: Overview of all created forms with quick status toggles (`draft`, `published`, `closed`), share link copying, and form deletion.
  - **Form Builder**: Drag-and-drop / click-to-add form schema designer supporting text fields, textareas, dropdowns, radio groups, checkboxes, number fields, and date pickers with custom validation rules.
  - **Form Responses**: Comprehensive response table displaying submitted form data, response count analytics, submission inspection modal, and one-click CSV export.
