# Future Updates & Roadmap

This document outlines planned updates and feature additions for future development cycles of the **Init Club Web Application**.

---

## Planned Updates

### 1. Rename Members Page to Alumni Page & Add Hardcoded Alumni Roster

- **Target File**: `src/pages/Members.tsx`
- **Description**: Rename the Members page to the **Alumni Page** and add hardcoded team details for past executive boards, technical leads, and alumni (following the visual presentation pattern of `TeamSection.tsx` on the About Page).

### 2. Events Page Implementation with Multimedia Team Data

- **Target File**: `src/pages/Events.tsx`
- **Description**: Gather complete event details, photos, write-ups, and workshop materials from the Multimedia team and construct the full public Events showcase page (integrating with `attendance_sessions` and `attendance_records`).

### 3. Potential Utilization of `is_core_member` and `is_team_leader` User Flags

- **Target Files**: `src/pages/admin/MembersAdmin.tsx`, `src/pages/Profile.tsx`, `src/pages/Members.tsx`
- **Description**: The backend `users` table contains `is_core_member` and `is_team_leader` boolean flags that could potentially be useful in future iterations:
  - Maybe display visual badges/chips (e.g., "Core Member", "Team Lead") on user profiles or member directory pages if needed.
  - Could be used to highlight Core Members / Team Leaders in admin member management views or team filters.
  - Optionally leverage these flags for special feature access or role distinctions down the line if the club workflow requires it.

### 4. Member Profile Deactivation via `is_active` Flag

- **Target Files**: `src/pages/admin/MembersAdmin.tsx`, `src/pages/Profile.tsx`, `src/components/activity/Leaderboard.tsx`
- **Description**: Integrate the backend `is_active` boolean flag from the `users` table into the Admin Member Management dashboard:
  - Add an active/inactive status toggle switch on member cards in `/admin/members` allowing admins to deactivate or reactivate user profiles.
  - Automatically exclude deactivated members (`is_active = false`) from public leaderboards, active member directories, and public profile lookups.
  - Prevent deactivated accounts from logging in or performing actions on the platform until reactivated by an administrator.

### 5. Sub-Team Categorization via `team_name` Column

- **Target Files**: `src/pages/admin/MembersAdmin.tsx`, `src/components/activity/Leaderboard.tsx`, `src/pages/Members.tsx`
- **Description**: Utilize the backend `users.team_name` text column:
  - Group club members into sub-teams (e.g., *Frontend*, *Backend*, *Multimedia*, *AI/ML*).
  - Add team-based filter toggles on member directories and team leaderboards.

### 6. Audit Logs Administrative UI Viewer (`audit_logs`)

- **Target Files**: `src/pages/admin/AuditLogsAdmin.tsx`, `src/utils/auditLogger.ts`
- **Description**: Construct a dedicated `/admin/audit-logs` dashboard page:
  - Display system audit logs recorded in the `audit_logs` table.
  - Allow executive leads to inspect administrative action history (role promotions, score overrides, site settings updates, and whitelisting logs).

### 7. Featured Projects Spotlight (`is_featured` Repository Flag)

- **Target Files**: `src/pages/Home.tsx`, `src/pages/IdeaWall.tsx`
- **Description**: Leverage the backend `repositories.is_featured` boolean flag:
  - Create a "Featured Projects" carousel or top spotlight banner on the Home Page (`/`) or Idea Wall (`/idea-wall`).
  - Allow admins to spotlight top-tier club open-source projects.

### 8. Enhanced Member Bio Presentation (`users.bio`)

- **Target Files**: `src/components/activity/Leaderboard.tsx`, `src/pages/Members.tsx`
- **Description**: Better showcase user bios stored in `users.bio`:
  - Render member bios in hover tooltips or expanded member detail cards across the Leaderboard and member directories.

### 9. Enforcement of `allow_public_blogs` Site Setting

- **Target Files**: `src/components/blogs/WriteBlogModal.tsx`, `src/pages/Blogs.tsx`
- **Description**: Connect the `allow_public_blogs` field from `site_settings`:
  - Dynamically enable or disable community blog proposals based on the admin setting.
  - Show a clear message on the Blogs page when public submissions are temporarily locked by admins.

### 10. Update GitHub PAT in Supabase to Official Init Club Account & Annual Renewal

> [!IMPORTANT]
> **Personal Token Migration & Annual Expiry**:
>
> - **Current State**: The `GITHUB_PAT` configured in Supabase currently belongs to a personal account (**Nitansh Shankar**). Consequently, first-time logins/authorizations may appear to users as though a personal account is requesting access.
> - **Resolution**: Replace the token in Supabase with a `GITHUB_PAT` generated directly from the official **Init Club** organization account.
> - **Annual Rotation Required**: Due to Init Club GitHub organization policy restrictions, this PAT expires after **1 year** and must be regenerated and updated in Supabase annually.
