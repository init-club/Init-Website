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
