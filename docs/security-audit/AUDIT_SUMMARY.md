# Init Club Website — Security Audit Summary

**Audit Date:** August 2026
**Scope:** Production website, Supabase backend, database access controls, authentication, RPCs, edge functions, and frontend security

---

## Vulnerabilities Identified

### 🔴 Critical

**1. GitHub Username Validation Bypass**
- The GitHub lookup function was vulnerable to path traversal.
- This allowed attackers to bypass the intended GitHub organization membership verification.

**2. Unauthorized Member Whitelisting**
- The GitHub lookup flow could create/whitelist users who were not members of the organization.
- This created a path from an unauthenticated outsider to a legitimate application member.

**3. Member Self-Promotion to Admin**
- Authenticated members could modify privileged fields on their own database record.
- The `role` field was writable, creating a potential member → admin privilege-escalation path.

**4. Unauthenticated GitHub Synchronization**
- The GitHub synchronization edge function lacked sufficient authorization.
- An unauthenticated caller could trigger organization-wide synchronization operations.

### 🟠 High

**5. Public Exposure of Sensitive User Metadata**

The public users dataset exposed sensitive fields including:
- GitHub/Auth identifiers
- University roll numbers
- User roles

**6. Insufficient Column-Level Database Protection**
- Privileged fields such as `role`, `auth_user_id`, and GitHub identity fields were not sufficiently protected at the database permission level.

**7. Missing Authorization on Edge Functions**
- Sensitive edge-function functionality could be reached using public application credentials without requiring an authenticated and authorized user.

**8. Public Form Submission Security Regression**
- Database restrictions blocked unauthenticated form submissions, potentially breaking forms intended for non-members.

### 🟡 Medium

**9. Stored Malicious URL Scheme in Social Links**
- User-controlled social-link fields accepted potentially unsafe URI schemes such as `javascript:` or `data:`.

**10. Profile Editing IDOR / Client-Side Target Selection**
- The profile editing flow trusted a URL parameter to select the profile being edited.
- Server-side authorization currently mitigates the actual unauthorized update, but the frontend implementation remains unsafe.

**11. Insufficient Protection of Administrative Data**
- Administrative and audit-related records require stronger separation between ordinary members and privileged users.

**12. Dependency Vulnerabilities**
- The project contained multiple npm dependency vulnerabilities, including high-severity advisories requiring dependency updates.

### 🟢 Additional Security / Correctness Findings

**13. GitHub Synchronization Pagination Limitations**
- Repository and pull-request synchronization did not fully handle datasets exceeding the configured page size.

**14. GitHub Synchronization Performance / API Usage**
- Sequential processing and repeated GitHub API requests could create unnecessary API usage and performance pressure.

**15. Administrative CRUD Capabilities Exposed Through the Database API**
- Administrators possess broad database modification capabilities, including deletion of user records.
- These capabilities should be intentionally restricted and audited.

---

## Overall Assessment

The audit identified several significant weaknesses across authorization, privilege escalation, GitHub integration, database permissions, data exposure, and edge-function security.

The most serious issues were the combination of:

> **GitHub membership bypass → unauthorized member creation → member privilege escalation → administrator access.**

Several February audit fixes are now confirmed to be effective, particularly RLS protections and server-side RPC authorization, but multiple critical issues remained open during the August 2026 verification.

---

## Priority Remediation

1. Fix GitHub username/path validation and enforce organization membership.
2. Revoke member write access to privileged `users` columns.
3. Move role management entirely behind an admin-authorized RPC.
4. Protect `github-sync` with a server-side authentication/cron secret.
5. Restrict sensitive columns from public database reads.
6. Require authentication and authorization for GitHub edge functions.
7. Validate social-link URLs.
8. Remove the client-controlled `?edit=` profile target.
9. Review and update vulnerable npm dependencies.
10. Audit existing user records for unauthorized accounts or privilege changes.

---

## Proof of Concept

The end-to-end privilege-escalation path (Critical findings 1 → 2 → 3) was verified against the production site using a test account. The profile badge transitions from **MEMBER** to **ADMIN** after self-promotion, with the role change persisted server-side:

| # | State | Screenshot |
|---|-------|------------|
| 1 | Test account `@irey85537-star` joined as a regular **member** (badge + milestone show `member`) | [`proofs/01-role-member-before-escalation.jpg`](proofs/01-role-member-before-escalation.jpg) |
| 2 | Same account after self-promotion — badge and milestone now show **admin**, persisted in the `users` table | [`proofs/02-role-admin-after-escalation.jpg`](proofs/02-role-admin-after-escalation.jpg) |

The same test account was subsequently observed with `role = "admin"` when querying the `users` table via the database API, confirming the escalation was persisted server-side and not a client-side rendering issue.
